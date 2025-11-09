"""QLive provider abstraction and mock implementation for Phase 0."""

from __future__ import annotations

import random
import threading
import time
import uuid
from copy import deepcopy
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from qbraid.runtime import JobStatus, QbraidJob
from qbraid.runtime import QbraidProvider as SDKQbraidProvider
from qbraid.runtime.schemas.job import RuntimeJobModel

try:  # Lazy optional imports so the mock still loads without qiskit extras.
    from qiskit.qasm2 import loads as qasm2_loads  # type: ignore
    from qiskit_aer import AerSimulator  # type: ignore
except ImportError:  # pragma: no cover - only hit when deps missing.
    qasm2_loads = None  # type: ignore
    AerSimulator = None  # type: ignore

__all__ = [
    "ProviderError",
    "QLiveProviderBase",
    "create_provider",
]


def _utc_now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _utc_now_iso_from_ts(ts: float) -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(ts))


class ProviderError(Exception):
    """Base exception for provider errors."""


class QLiveProviderBase:
    """Interface for QLive provider adapters."""

    def list_providers(self) -> List[dict]:
        raise NotImplementedError

    def list_devices(self, provider_id: str) -> List[dict]:
        raise NotImplementedError

    def submit_job(
        self,
        provider_id: str,
        *,
        openqasm: str,
        shots: int,
        device_id: str,
        options: Optional[dict] = None,
    ) -> dict:
        raise NotImplementedError

    def get_job(self, provider_id: str, job_id: str) -> dict:
        raise NotImplementedError

    def cancel_job(self, provider_id: str, job_id: str) -> dict:
        raise NotImplementedError

    def list_jobs(self, provider_id: str) -> List[dict]:
        raise NotImplementedError


@dataclass
class _MockJob:
    job_id: str
    provider_id: str
    device_id: str
    openqasm: str
    shots: int
    submit_ts: float
    queue_duration: float
    run_duration: float
    transpile_stats: dict
    options: dict = field(default_factory=dict)
    status: str = "queued"
    start_ts: Optional[float] = None
    end_ts: Optional[float] = None
    cancelled_ts: Optional[float] = None
    result_payload: Optional[dict] = None

    def to_summary(self) -> dict:
        return {
            "job_id": self.job_id,
            "provider_id": self.provider_id,
            "device_id": self.device_id,
            "status": self.status,
            "submitted_at": _utc_now_iso_from_ts(self.submit_ts),
            "shots": self.shots,
            "transpile_stats": self.transpile_stats,
            "options": self.options,
        }


class MockQLiveProvider(QLiveProviderBase):
    """Phase 0 mock provider that behaves like qBraid-managed hardware."""

    PROVIDER_ID = "qbraid-mock"

    def __init__(self, *, max_jobs: int = 25):
        self.max_jobs = max_jobs
        self._jobs: Dict[str, _MockJob] = {}
        self._lock = threading.Lock()
        self._devices = self._build_devices()

    def list_providers(self) -> List[dict]:
        return [
            {
                "id": self.PROVIDER_ID,
                "name": "qBraid (mock)",
                "mode": "mock",
                "description": "Phase 0 preview provider that simulates qBraid job flow.",
            }
        ]

    def list_devices(self, provider_id: str) -> List[dict]:
        self._ensure_provider(provider_id)
        return self._devices

    def submit_job(
        self,
        provider_id: str,
        *,
        openqasm: str,
        shots: int,
        device_id: str,
        options: Optional[dict] = None,
    ) -> dict:
        self._ensure_provider(provider_id)
        options = options or {}
        with self._lock:
            if len(self._jobs) >= self.max_jobs:
                raise ProviderError("Mock provider job limit reached; clear old jobs to submit new ones.")

            if not any(d["id"] == device_id for d in self._devices):
                raise ProviderError(f"Unknown device_id '{device_id}' for provider '{provider_id}'.")

            job_id = f"QLIVE-{uuid.uuid4().hex[:12]}"
            submit_ts = time.time()
            queue_duration = 4.0 + random.uniform(1.5, 6.0)
            run_duration = 3.0 + random.uniform(1.0, 4.0)
            transpile_stats = self._estimate_transpile_stats(openqasm)
            result_payload = self._generate_mock_result(openqasm, shots, device_id)

            job = _MockJob(
                job_id=job_id,
                provider_id=provider_id,
                device_id=device_id,
                openqasm=openqasm,
                shots=shots,
                submit_ts=submit_ts,
                queue_duration=queue_duration,
                run_duration=run_duration,
                transpile_stats=transpile_stats,
                options=options,
                result_payload=result_payload,
            )
            self._jobs[job_id] = job

        return {
            "job_id": job_id,
            "provider_id": provider_id,
            "device_id": device_id,
            "status": job.status,
            "submitted_at": _utc_now_iso_from_ts(submit_ts),
            "shots": shots,
            "est_wait": queue_duration,
            "transpile_stats": transpile_stats,
        }

    def get_job(self, provider_id: str, job_id: str) -> dict:
        self._ensure_provider(provider_id)
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                raise ProviderError(f"Unknown job_id '{job_id}'.")
            self._update_job_status(job)
            payload = self._job_to_payload(job)
        return payload

    def cancel_job(self, provider_id: str, job_id: str) -> dict:
        self._ensure_provider(provider_id)
        with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                raise ProviderError(f"Unknown job_id '{job_id}'.")
            self._update_job_status(job)
            if job.status in {"completed", "failed", "cancelled"}:
                return self._job_to_payload(job)
            job.status = "cancelled"
            job.cancelled_ts = time.time()
        return self._job_to_payload(job)

    def list_jobs(self, provider_id: str) -> List[dict]:
        self._ensure_provider(provider_id)
        with self._lock:
            jobs = list(self._jobs.values())
            for job in jobs:
                self._update_job_status(job)
            jobs.sort(key=lambda j: j.submit_ts, reverse=True)
            return [self._job_to_payload(j, include_result=False) for j in jobs]

    def _ensure_provider(self, provider_id: str) -> None:
        if provider_id != self.PROVIDER_ID:
            raise ProviderError(f"Unknown provider_id '{provider_id}'.")

    def _build_devices(self) -> List[dict]:
        now_iso = _utc_now_iso()
        return [
            {
                "id": "qbraid_qir_simulator",
                "name": "qBraid QIR Simulator",
                "provider": "qBraid",
                "mode": "simulator",
                "status": "online",
                "updated_at": now_iso,
                "num_qubits": 32,
                "queue_depth": random.randint(0, 4),
                "avg_queue_time": 2,
                "coupling_map": "fully-connected",
            },
            {
                "id": "ionq_simulator",
                "name": "IonQ Ideal Simulator",
                "provider": "IonQ",
                "mode": "simulator",
                "status": "online",
                "updated_at": now_iso,
                "num_qubits": 15,
                "queue_depth": random.randint(0, 6),
                "avg_queue_time": 3,
                "coupling_map": "fully-connected",
            },
            {
                "id": "quera_aquila",
                "name": "QuEra Aquila",
                "provider": "QuEra",
                "mode": "qpu",
                "status": random.choice(["online", "maintenance", "offline"]),
                "updated_at": now_iso,
                "num_qubits": 256,
                "queue_depth": random.randint(2, 8),
                "avg_queue_time": 12,
                "coupling_map": "ahs",
            },
            {
                "id": "rigetti_ankaa_3",
                "name": "Rigetti Ankaa 3",
                "provider": "Rigetti",
                "mode": "qpu",
                "status": random.choice(["online", "busy", "offline"]),
                "updated_at": now_iso,
                "num_qubits": 84,
                "queue_depth": random.randint(1, 5),
                "avg_queue_time": 9,
                "coupling_map": "square-lattice",
            },
        ]

    def _update_job_status(self, job: _MockJob) -> None:
        if job.status in {"completed", "failed", "cancelled"}:
            return
        now = time.time()
        elapsed = now - job.submit_ts
        if job.status == "queued" and elapsed >= job.queue_duration:
            job.status = "running"
            job.start_ts = now
        if job.status == "running":
            run_elapsed = now - (job.start_ts or now)
            if run_elapsed >= job.run_duration:
                job.status = "completed"
                job.end_ts = now

    def _job_to_payload(self, job: _MockJob, *, include_result: bool = True) -> dict:
        payload = {
            "job_id": job.job_id,
            "provider_id": job.provider_id,
            "device_id": job.device_id,
            "status": job.status,
            "submitted_at": _utc_now_iso_from_ts(job.submit_ts),
            "shots": job.shots,
            "transpile_stats": job.transpile_stats,
            "options": job.options,
            "progress": self._progress(job),
            "queue_duration": job.queue_duration,
            "run_duration": job.run_duration,
            "start_at": _utc_now_iso_from_ts(job.start_ts) if job.start_ts else None,
            "end_at": _utc_now_iso_from_ts(job.end_ts) if job.end_ts else None,
            "cancelled_at": _utc_now_iso_from_ts(job.cancelled_ts) if job.cancelled_ts else None,
        }
        if include_result and job.status == "completed" and job.result_payload is not None:
            payload["result"] = job.result_payload
        return payload

    def _progress(self, job: _MockJob) -> float:
        if job.status == "queued":
            return 0.05
        if job.status == "running":
            if not job.start_ts:
                return 0.25
            run_elapsed = time.time() - job.start_ts
            return min(0.9, 0.25 + (run_elapsed / max(job.run_duration, 1e-3)) * 0.65)
        if job.status == "completed":
            return 1.0
        if job.status == "cancelled":
            return 0.0
        return 0.0

    def _estimate_transpile_stats(self, openqasm: str) -> dict:
        two_qubit = openqasm.lower().count("cx") + openqasm.lower().count("cz")
        one_qubit = sum(openqasm.lower().count(g) for g in (" x", " y", " z", " h", " s", " t"))
        depth = max(two_qubit + one_qubit, 1)
        return {
            "depth_estimate": depth,
            "one_qubit_gates": one_qubit,
            "two_qubit_gates": two_qubit,
        }

    def _generate_mock_result(self, openqasm: str, shots: int, device_id: str) -> dict:
        counts = self._simulate_counts(openqasm, shots)
        noise_factor = random.uniform(0.92, 0.99)
        noisy_counts = self._perturb_counts(counts, shots, noise_factor)
        return {
            "device_id": device_id,
            "shots": shots,
            "counts_raw": counts,
            "counts_noisy": noisy_counts,
            "noise_factor": noise_factor,
            "openqasm_transpiled": openqasm,
        }

    def _simulate_counts(self, openqasm: str, shots: int) -> Dict[str, int]:
        if qasm2_loads is None or AerSimulator is None:
            return self._fallback_counts(1, shots)
        try:
            circuit = qasm2_loads(openqasm)
        except Exception:
            return {"0": shots}
        qc = circuit.copy()
        has_measure = any(instr.operation.name == "measure" for instr in qc.data)
        if not has_measure:
            qc.measure_all()
        try:
            sim = AerSimulator()
            result = sim.run(qc, shots=shots).result()
            counts = result.get_counts(qc)
            return {str(k): int(v) for k, v in counts.items()}
        except Exception:
            return self._fallback_counts(qc.num_clbits or qc.num_qubits, shots)

    def _fallback_counts(self, n: int, shots: int) -> Dict[str, int]:
        if n <= 0:
            return {"0": shots}
        zero_state = "0" * n
        return {zero_state: shots}

    def _perturb_counts(self, counts: Dict[str, int], shots: int, factor: float) -> Dict[str, int]:
        keys = list(counts.keys())
        if not keys:
            return {"0": shots}
        noisy_counts = {}
        remaining = shots
        for key in keys[:-1]:
            base = counts[key]
            noisy = max(0, int(round(base * factor + random.randint(-3, 3))))
            noisy_counts[key] = noisy
            remaining -= noisy
        noisy_counts[keys[-1]] = max(0, remaining)
        return noisy_counts


class QbraidQLiveProvider(QLiveProviderBase):
    """Live qBraid API integration for QLive using the official SDK."""

    _RUN_OPTION_KEYS = {
        "memory",
        "preflight",
        "tags",
        "entrypoint",
        "noise_model",
        "seed",
        "timeout",
        "backend",
        "params",
        "error_mitigation",
        "runtime_options",
    }

    def __init__(
        self,
        *,
        api_key: str,
        base_url: Optional[str] = None,
        request_timeout: float = 15.0,
        verify_ssl: bool = True,
    ) -> None:
        if not api_key:
            raise ProviderError("QBRAID_API_KEY is required when QLive provider mode is 'qbraid'.")

        try:
            self._provider = SDKQbraidProvider(api_key=api_key)
        except Exception as exc:  # pragma: no cover - SDK handles network specifics
            raise ProviderError(f"Failed to initialize qBraid provider: {exc}") from exc

        self._client = self._provider.client
        self._request_timeout = request_timeout
        self._verify_ssl = verify_ssl
        self._base_url = base_url  # retained for backwards compatibility

    def list_providers(self) -> List[dict]:
        devices = self._safe_get_devices()
        provider_names = sorted({self._device_provider_name(device) for device in devices})
        return [
            {
                "id": "qbraid",
                "name": "qBraid Quantum Cloud",
                "mode": "qbraid",
                "providers": provider_names or ["qbraid"],
                "description": "Live qBraid marketplace devices",
            }
        ]

    def list_devices(self, provider_id: str) -> List[dict]:
        devices = self._safe_get_devices()
        return [self._normalize_device(provider_id, device) for device in devices]

    def submit_job(
        self,
        provider_id: str,
        *,
        openqasm: str,
        shots: int,
        device_id: str,
        options: Optional[dict] = None,
    ) -> dict:
        circuit = self._qasm_to_circuit(openqasm)

        try:
            device = self._provider.get_device(device_id)
        except Exception as exc:
            raise ProviderError(f"Failed to load device '{device_id}': {exc}") from exc

        run_kwargs = self._filter_run_options(options)

        try:
            job_response = device.run([circuit], shots=shots, **run_kwargs)
        except Exception as exc:
            raise ProviderError(f"Failed to submit job to '{device_id}': {exc}") from exc

        job_obj = job_response[0] if isinstance(job_response, list) else job_response
        job_id = str(job_obj.id)

        model = self._load_job_model(job_id)
        payload = self._job_model_to_payload(provider_id, model, include_result=False)
        payload.update({"job_id": job_id, "shots": shots})
        return payload

    def get_job(self, provider_id: str, job_id: str) -> dict:
        model = self._load_job_model(job_id)
        return self._job_model_to_payload(provider_id, model, include_result=True)

    def cancel_job(self, provider_id: str, job_id: str) -> dict:
        job = QbraidJob(job_id, client=self._client)
        try:
            job.cancel()
        except Exception as exc:
            raise ProviderError(f"Failed to cancel job '{job_id}': {exc}") from exc

        model = self._load_job_model(job_id)
        return self._job_model_to_payload(provider_id, model, include_result=False)

    def list_jobs(self, provider_id: str) -> List[dict]:
        try:
            jobs = self._client.search_jobs()
        except Exception as exc:
            raise ProviderError(f"Failed to list jobs: {exc}") from exc

        payloads = []
        for job_data in jobs:
            try:
                model = RuntimeJobModel.from_dict(deepcopy(job_data))
            except Exception as exc:
                raise ProviderError(f"Failed to parse job data: {exc}") from exc
            payloads.append(self._job_model_to_payload(provider_id, model, include_result=False))
        return payloads

    def _safe_get_devices(self) -> List[Any]:
        try:
            return self._provider.get_devices()
        except Exception as exc:
            raise ProviderError(f"Failed to retrieve qBraid devices: {exc}") from exc

    def _device_provider_name(self, device: Any) -> str:
        profile = getattr(device, "profile", None)
        return getattr(profile, "provider_name", None) or "qbraid"

    def _normalize_device(self, provider_id: str, device: Any) -> dict:
        profile = getattr(device, "profile", None)
        provider_name = self._device_provider_name(device)
        try:
            metadata = device.metadata()
        except Exception:
            metadata = {}
        metadata = self._json_safe(metadata)

        entry = {
            "id": getattr(device, "id", None),
            "provider_id": provider_id,
            "name": self._build_device_name(device, profile, provider_name),
            "provider": provider_name,
            "status": metadata.get("status"),
            "num_qubits": getattr(profile, "num_qubits", None),
            "simulator": getattr(profile, "simulator", None),
            "metadata": metadata,
        }
        if getattr(profile, "basis_gates", None):
            entry["basis_gates"] = list(profile.basis_gates)
        if getattr(profile, "experiment_type", None):
            entry["experiment_type"] = profile.experiment_type.value
        return entry

    def _build_device_name(self, device: Any, profile: Any, provider_name: Optional[str]) -> Optional[str]:
        base_name = getattr(profile, "name", None) or getattr(device, "id", None)
        if not base_name or not provider_name:
            return base_name
        if provider_name.lower() in base_name.lower():
            return base_name
        return f"{base_name} ({provider_name})"

    def _json_safe(self, value: Any) -> Any:
        if isinstance(value, dict):
            return {k: self._json_safe(v) for k, v in value.items()}
        if isinstance(value, list):
            return [self._json_safe(v) for v in value]
        if isinstance(value, tuple):
            return [self._json_safe(v) for v in value]
        if isinstance(value, (set, frozenset)):
            return [self._json_safe(v) for v in value]
        try:
            import enum

            if isinstance(value, enum.Enum):
                enum_value = getattr(value, "value", None)
                return self._json_safe(enum_value if enum_value is not None else str(value))
        except Exception:  # pragma: no cover - enum always available but be safe
            pass
        try:  # optional numpy support
            import numpy as np  # type: ignore

            if isinstance(value, np.generic):
                return value.item()
            if isinstance(value, np.ndarray):
                return [self._json_safe(v) for v in value.tolist()]
        except Exception:  # pragma: no cover
            pass
        return value

    def _qasm_to_circuit(self, openqasm: str):
        from qiskit import QuantumCircuit  # type: ignore

        try:
            return QuantumCircuit.from_qasm_str(openqasm)
        except Exception as exc:
            raise ProviderError(f"Failed to parse OpenQASM payload: {exc}") from exc

    def _filter_run_options(self, options: Optional[dict]) -> dict:
        if not options:
            return {}
        return {k: v for k, v in options.items() if k in self._RUN_OPTION_KEYS}

    def _load_job_model(self, job_id: str) -> RuntimeJobModel:
        try:
            job_data = self._client.get_job(qbraid_id=job_id)
        except Exception as exc:
            raise ProviderError(f"Failed to fetch job '{job_id}': {exc}") from exc

        try:
            return RuntimeJobModel.from_dict(deepcopy(job_data))
        except Exception as exc:
            raise ProviderError(f"Failed to parse qBraid job payload: {exc}") from exc

    def _job_model_to_payload(
        self,
        provider_id: str,
        model: RuntimeJobModel,
        *,
        include_result: bool,
    ) -> dict:
        status_value = model.status.value if isinstance(model.status, JobStatus) else str(model.status)
        payload: dict[str, Any] = {
            "job_id": model.job_id,
            "provider_id": provider_id,
            "device_id": model.device_id,
            "status": status_value,
            "submitted_at": self._format_timestamp(model.time_stamps.createdAt),
            "shots": model.shots,
            "queue_position": model.queue_position,
            "tags": self._json_safe(dict(model.tags or {})),
            "experiment_type": self._json_safe(
                getattr(model.experiment_type, "value", model.experiment_type)
            ),
            "progress": self._estimate_progress(model.status),
            "time_stamps": {
                "created_at": self._format_timestamp(model.time_stamps.createdAt),
                "ended_at": self._format_timestamp(model.time_stamps.endedAt),
                "execution_duration_ms": model.time_stamps.executionDuration,
            },
            "metadata": self._json_safe(model.metadata.model_dump(by_alias=True)),
        }

        if include_result and status_value == JobStatus.COMPLETED.value:
            payload["result"] = self._load_job_result(model.job_id)

        return payload

    def _load_job_result(self, job_id: str) -> dict:
        job = QbraidJob(job_id, client=self._client)
        try:
            result = job.result()
        except Exception as exc:
            raise ProviderError(f"Failed to retrieve results for job '{job_id}': {exc}") from exc

        result_payload: dict[str, Any] = {
            "success": result.success,
            "details": self._json_safe(result.details),
        }
        try:
            result_payload["data"] = self._json_safe(result.data.to_dict())
        except Exception:
            result_payload["data"] = None
        try:
            result_payload["measurement_counts"] = self._json_safe(result.data.get_counts())
        except Exception:
            result_payload["measurement_counts"] = None
        try:
            result_payload["measurement_probabilities"] = self._json_safe(result.data.get_probabilities())
        except Exception:
            result_payload["measurement_probabilities"] = None
        try:
            result_payload["raw"] = self._json_safe(result.data.model_dump())
        except Exception:
            result_payload["raw"] = None
        return result_payload

    def _format_timestamp(self, value: Optional[Any]) -> Optional[str]:
        if value is None:
            return None
        try:
            return value.strftime("%Y-%m-%dT%H:%M:%SZ")
        except Exception:
            return str(value)

    def _estimate_progress(self, status: Optional[JobStatus | str]) -> float:
        if not status:
            return 0.0
        status_value = status.name if isinstance(status, JobStatus) else str(status).upper()
        mapping = {
            JobStatus.INITIALIZING.value: 0.1,
            JobStatus.QUEUED.value: 0.15,
            JobStatus.VALIDATING.value: 0.2,
            JobStatus.RUNNING.value: 0.6,
            JobStatus.CANCELLING.value: 0.35,
            JobStatus.COMPLETED.value: 1.0,
            JobStatus.CANCELLED.value: 0.0,
            JobStatus.FAILED.value: 0.0,
            JobStatus.UNKNOWN.value: 0.4,
            JobStatus.HOLD.value: 0.4,
        }
        return mapping.get(status_value, 0.5)


def create_provider(mode: str, **kwargs) -> QLiveProviderBase:
    mode = (mode or "mock").lower()
    if mode == "mock":
        allowed = {"max_jobs"}
        params = {k: kwargs[k] for k in allowed if k in kwargs}
        return MockQLiveProvider(**params)
    if mode == "qbraid":
        allowed = {"api_key", "base_url", "request_timeout", "verify_ssl"}
        params = {k: kwargs[k] for k in allowed if k in kwargs}
        return QbraidQLiveProvider(**params)
    raise ProviderError(f"Unknown QLive provider mode '{mode}'.")
