from flask import Flask, request, jsonify, send_file, send_from_directory
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
from qiskit.qasm2 import loads as qasm2_loads, dumps as qasm2_dumps
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector, DensityMatrix, partial_trace
from qiskit_aer import AerSimulator

import numpy as np
from flask_cors import CORS
import uuid


# imports for bot
import os, glob, uuid
from typing import List
from dotenv import load_dotenv

import chromadb

from google import genai
from google.genai import types


# Voice Assistant
import speech_recognition as sr
import pyttsx3

import tempfile

app = Flask(__name__)
r = sr.Recognizer()
CORS(app)  # Allow all cross-origin requests
# Save audio inside a dedicated folder, e.g., "speech_outputs"
AUDIO_DIR = "speech_outputs"
os.makedirs(AUDIO_DIR, exist_ok=True)


# ---------------------------------------------------
# Utility: Make JSON serializable
# ---------------------------------------------------
def complex_to_serializable(obj):
    """Recursively convert numpy arrays & complex numbers into JSON-safe types."""
    if isinstance(obj, complex):
        if abs(obj.imag) < 1e-10:
            return float(obj.real)  # treat tiny imaginary parts as real
        return {"real": obj.real, "imag": obj.imag}
    elif isinstance(obj, np.ndarray):
        return complex_to_serializable(obj.tolist())
    elif isinstance(obj, list):
        return [complex_to_serializable(x) for x in obj]
    elif isinstance(obj, dict):
        return {k: complex_to_serializable(v) for k, v in obj.items()}
    return obj


# ---------------------------------------------------
# Bloch vector calculation
# ---------------------------------------------------
def density_matrix_to_bloch(dm):
    """Convert single-qubit density matrix to Bloch vector (x, y, z)."""
    x = 2 * np.real(dm[0, 1])
    y = 2 * np.imag(dm[1, 0])
    z = np.real(dm[0, 0] - dm[1, 1])
    return [float(x), float(y), float(z)]


# ---------------------------------------------------
# Circuit Builders
# ---------------------------------------------------
def build_bell():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    return qc


def build_ghz():
    qc = QuantumCircuit(3)
    qc.h(0)
    qc.cx(0, 1)
    qc.cx(1, 2)
    return qc


def build_custom(qasm_str):
    qc = qasm2_loads(qasm_str)
    return qc


# ---------------------------------------------------
# Core Simulation
# ---------------------------------------------------
# --------- upgraded version ---------
def state_to_amplitudes_and_probs(statevector: np.ndarray):
    """Return (amps, probs) from a 1D complex numpy array. Keys are bitstrings q_{n-1}..q_0."""
    dim = statevector.shape[0]
    n = int(np.log2(dim))
    amps = {}
    probs = {}
    for idx, amp in enumerate(statevector):
        label = format(idx, f"0{n}b")  # |q_{n-1} ... q_0>
        pr = float(np.abs(amp) ** 2)
        amps[label] = {"re": float(np.real(amp)), "im": float(np.imag(amp)), "prob": pr}
        probs[label] = pr
    return amps, probs


def simulate_and_get_bloch(qc):
    """
    Simulate circuit, return everything needed for UI:
    - bloch vectors
    - density matrices
    - amplitudes & probabilities (if statevector available)
    - openqasm
    - counts (if measurement present)
    """
    has_measure = any(instr.operation.name == "measure" for instr in qc.data)
    sv = None
    counts = None

    if has_measure:
        sim = AerSimulator()
        qc2 = qc.copy()
        qc2.save_statevector()  # capture state before collapse
        result = sim.run(qc2).result()
        try:
            sv_obj = result.get_statevector(qc2)
            sv = np.asarray(sv_obj)
        except Exception:
            # fallback: only counts available
            counts = result.get_counts(qc)
    else:
        # Purely unitary → exact statevector
        sv_obj = Statevector.from_instruction(qc)
        sv = np.asarray(sv_obj)

    # If we could not get a statevector at all, return counts-only
    if sv is None:
        return {
            "num_qubits": qc.num_qubits,
            "counts": counts,
            "openqasm": qasm2_dumps(qc),
        }

    # Build full density matrix from statevector (pure state)
    full_dm = DensityMatrix(sv)
    n_qubits = qc.num_qubits

    # Reduced DMs and Bloch vectors
    bloch_vectors = []
    density_matrices = []
    for qubit in range(n_qubits):
        reduced_dm = partial_trace(full_dm, [i for i in range(n_qubits) if i != qubit])
        reduced_array = np.array(reduced_dm)
        bloch_vectors.append(density_matrix_to_bloch(reduced_array))
        density_matrices.append(reduced_array)

    # Amplitudes + probabilities
    amplitudes, probabilities = state_to_amplitudes_and_probs(sv)

    return {
        "num_qubits": n_qubits,
        "bloch_vectors": bloch_vectors,
        "density_matrices": density_matrices,
        "amplitudes": amplitudes,
        "probabilities": probabilities,
        "openqasm": qasm2_dumps(qc),
        **({"counts": counts} if counts is not None else {}),
    }


# ---------------------------------------------------
# Flask Routes
# ---------------------------------------------------
@app.route("/simulate", methods=["POST"])
def simulate():
    """
    POST JSON example:
    {
        "type": "bell" | "ghz" | "custom",
        "qasm": "...optional OpenQASM string for custom..."
    }
    """
    data = request.get_json(force=True)
    circuit_type = data.get("type", "").lower()

    try:
        if circuit_type == "bell":
            qc = build_bell()
        elif circuit_type == "ghz":
            qc = build_ghz()
        elif circuit_type == "custom":
            qasm_str = data.get("qasm", "")
            if not qasm_str.strip():
                return jsonify({"error": "Missing QASM for custom type"}), 400
            qc = build_custom(qasm_str)
        else:
            return jsonify({"error": "Invalid type, must be bell/ghz/custom"}), 400

        result = simulate_and_get_bloch(qc)
        return jsonify(complex_to_serializable(result))

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Qubit-Tracer API is running"}), 200


# ------------------------------ QUANTUM BOT & RELATED (ADVANCED ANALYSIS) --------------------------------

# -----------------------------
# Config
# -----------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY in your environment or a .env file")

DATA_DIR = os.getenv("DATA_DIR", "data")
DB_PATH = os.getenv("DB_PATH", "chroma")
COLLECTION_NAME = os.getenv("COLLECTION", "quantum-v1")
TOP_K = int(os.getenv("TOP_K", "5"))


# -----------------------------
# Clients
# -----------------------------
client = genai.Client(api_key=GEMINI_API_KEY)
chroma = chromadb.PersistentClient(path=DB_PATH)
collection = chroma.get_or_create_collection(COLLECTION_NAME)


# -----------------------------
# Utils
# -----------------------------


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        j = min(len(words), i + chunk_size)
        chunks.append(" ".join(words[i:j]))
        if j == len(words):
            break
        i = j - overlap
    return chunks


def embed_texts(texts: List[str], task_type: str) -> List[List[float]]:
    res = client.models.embed_content(
        model="gemini-embedding-001",
        contents=texts,
        config=types.EmbedContentConfig(task_type=task_type),
    )
    return [list(np.array(e.values, dtype=float)) for e in res.embeddings]


def build_index() -> dict:
    files = []
    for ext in ("*.md", "*.txt"):
        files.extend(glob.glob(os.path.join(DATA_DIR, "**", ext), recursive=True))

    ids, docs, metas, vectors = [], [], [], []

    for path in files:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        chunks = chunk_text(text)
        if not chunks:
            continue
        embeds = embed_texts(chunks, task_type="RETRIEVAL_DOCUMENT")
        for i, (ch, vec) in enumerate(zip(chunks, embeds)):
            ids.append(str(uuid.uuid4()))
            docs.append(ch)
            metas.append({"source": path, "chunk": i})
            vectors.append(vec)

    if ids:
        collection.delete(where={"chunk": {"$gte": 0}})
        collection.add(ids=ids, documents=docs, metadatas=metas, embeddings=vectors)

    return {"files_indexed": len(files), "chunks": len(docs)}


def retrieve(query: str, top_k: int) -> List[dict]:
    qvec = embed_texts([query], task_type="RETRIEVAL_QUERY")[0]
    results = collection.query(
        query_embeddings=[qvec],
        n_results=top_k,
        include=["documents", "metadatas", "distances"],
    )

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    dists = results.get("distances", [[]])[0]

    pairs = []
    for d, m, dist in zip(docs, metas, dists):
        pairs.append(
            {
                "text": d,
                "source": m.get("source"),
                "chunk": m.get("chunk"),
                "score": float(dist),
            }
        )
    return pairs


def answer_with_gemini(question: str, contexts: List[dict]) -> dict:
    sources_block = "\n".join(
        f"[{i+1}] {c['source']}#chunk-{c['chunk']} (score={c['score']:.3f})"
        for i, c in enumerate(contexts)
    )
    context_block = "\n\n---\n\n".join(c["text"] for c in contexts)

    prompt = f"""
RULES TO FOLLOW:
1. Core Identity & Persona

You are an expert AI assistant(For website named "Qubit-Tracer" used as Quantum State Visualizer). Your persona is friendly, precise, and helpful.

2. Conversational Rules

If the user provides a simple greeting (e.g., "hi", "hello") without a QUESTION, respond with a friendly greeting and briefly introduce yourself, inviting them to ask a question.

3. Knowledge Source Hierarchy

Your primary goal is to answer the user's QUESTION by synthesizing(making it an user understandable) information(clearly formatted with points and paragraphs) from the provided <CONTEXT>.

If the <CONTEXT> is insufficient to form a complete answer, you are permitted to use your general knowledge to fill in the gaps and provide the most helpful response possible.

Critical Constraint: You MUST NEVER mention the word "context" or allude to the source of your information. All knowledge should be presented as your own.

just give info what he asked, no need of extra content as i said it should be short and clear.

You should only help user about quantum related. not personal things(eg. content writing, generating new ideas).

4. Output and Formatting Rules

All output must be clean, highly structured, and easy to read.

Use clear headings for main topics and sub-topics.

Use hyphenated bullet points (- ) for items in a list. For nested lists, use indentation with hyphens.

Forbidden Formatting: Raw Markdown characters, especially for bolding (e.g., **text**), are strictly forbidden in the final output. The goal is a clean, readable text, not a raw code-like output.

For mathematical or scientific notations, use LaTeX formatting enclosed in $ or $$ delimiters.

CONTEXT:
{context_block}

SOURCES:
{sources_block}

QUESTION:
{question}
""".strip()

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    return {"answer": resp.text, "sources_list": sources_block}


# Add this new function somewhere in your app.py, for example after the retrieve function


def analyze_with_gemini(result_data: dict) -> str:
    """Generates a plain-English analysis of a quantum simulation result using Gemini."""

    # Prepare a detailed summary of the simulation result to send to Gemini
    # This context helps the model give a precise and relevant answer.
    data_summary = f"""
    Here is the data from a quantum simulation:
    - Number of Qubits: {result_data.get('num_qubits', 'N/A')}
    - OpenQASM Circuit:
      ```qasm
      {result_data.get('openqasm', 'N/A')}
      ```
    - Bloch Vectors (x, y, z coordinates for each qubit's state vector): {result_data.get('bloch_vectors', 'N/A')}
    - Final Probabilities of measurement outcomes: {result_data.get('probabilities', 'N/A')}
    """

    # Construct the prompt for Gemini
    prompt = f"""
    You are an expert quantum physicist AI assistant integrated into "Qubit-Tracer", a quantum state visualizer.
    Your task is to provide a clear, concise, and easy-to-understand analysis of the provided quantum simulation data.
    Explain the results as if you are talking to a university student who is learning quantum computing.

    Based on the following data, generate a descriptive text summary.
    
    **Analysis Guidelines:**
    1.  **Start with a high-level summary:** What is the overall state of the system? Is there entanglement?
    2.  **Analyze each qubit individually:**
        * Look at its Bloch vector. The length of the vector is `sqrt(x^2 + y^2 + z^2)`.
        * If the vector length is close to 1, it's a **pure state**. Describe its position (e.g., "in a superposition on the equator").
        * If the vector length is significantly less than 1, it's a **mixed state**. Explain that this is a sign of entanglement or noise. A vector at the center (length close to 0) means it's a **maximally mixed state**, indicating full entanglement.
    3.  **Connect to Probabilities:** Relate the qubit's state to the measurement probabilities provided.
    4.  **Keep it concise and clear.** Avoid overly technical jargon where possible.

    **Simulation Data:**
    {data_summary}

    Now, provide your analysis.
    """

    try:
        # Use the same Gemini client you've already configured
        resp = client.models.generate_content(
            model="gemini-1.5-flash",  # Using a powerful model for better analysis
            contents=prompt,
        )
        return resp.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "An error occurred while generating the analysis."


# -----------------------------
# Flask app
# -----------------------------


@app.route("/reindex", methods=["POST"])
def reindex():
    return jsonify(build_index())


@app.route("/query", methods=["POST"])
def query_api():
    data = request.get_json()
    contexts = retrieve(data.get("query"), top_k=data.get("top_k", TOP_K))
    result = answer_with_gemini(data.get("query"), contexts)
    return jsonify({"answer": result["answer"], "contexts": contexts})


@app.route("/voice-assist", methods=["POST"])
def voice_assist():
    user_text = request.json["query"]  # frontend sends text after speech recognition

    # 🔹 Call Gemini (like in /query route)
    contexts = retrieve(user_text, top_k=TOP_K)
    result = answer_with_gemini(user_text, contexts)
    bot_reply = result["answer"]

    # 🔹 Generate unique filename
    filename = f"reply_{uuid.uuid4().hex}.mp3"
    filepath = os.path.join(AUDIO_DIR, filename)

    # 🔹 Convert bot reply to speech (save as mp3)
    # creating engine
    engine = pyttsx3.init()
    engine.save_to_file(bot_reply, filepath)
    engine.runAndWait()

    # 🔹 Send both text + audio route back
    return jsonify({"reply": bot_reply, "audio": f"/send-speech/{filename}"})


# this code having with multi-language support
# @app.route("/voice-assist", methods=["POST"])
# def voice_assist():
#     data = request.json
#     user_text = data["query"]
#     lang_code = data.get("lang", "en-US")  # default to English

#     contexts = retrieve(user_text, top_k=TOP_K)
#     result = answer_with_gemini(user_text, contexts)
#     bot_reply = result["answer"]

#     filename = f"reply_{uuid.uuid4().hex}.mp3"
#     filepath = os.path.join(AUDIO_DIR, filename)

#     # ---- Multi-language TTS: use Google TTS or other robust TTS provider ----
#     from google.cloud import texttospeech

#     client = texttospeech.TextToSpeechClient()
#     synthesis_input = texttospeech.SynthesisInput(text=bot_reply)
#     voice = texttospeech.VoiceSelectionParams(
#         language_code=lang_code,
#         ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
#     )
#     audio_config = texttospeech.AudioConfig(
#         audio_encoding=texttospeech.AudioEncoding.MP3
#     )
#     response = client.synthesize_speech(
#         input=synthesis_input, voice=voice, audio_config=audio_config
#     )
#     with open(filepath, "wb") as out:
#         out.write(response.audio_content)

#     return jsonify({"reply": bot_reply, "audio": f"/send-speech/{filename}"})


@app.route("/send-speech/<path:filename>")
def send_speech(filename):
    filepath = os.path.join(AUDIO_DIR, filename)
    return send_file(filepath, mimetype="audio/mpeg")


# Add this new route at the end of your Flask routes section
@app.route("/analyze", methods=["POST"])
def analyze_route():
    data = request.get_json(force=True)
    simulation_result = data.get("result")

    if not simulation_result:
        return jsonify({"error": "Missing simulation result data"}), 400

    try:
        analysis_text = analyze_with_gemini(simulation_result)
        return jsonify({"analysis": analysis_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Quantum RAG Flask server")
    parser.add_argument(
        "--reindex", action="store_true", help="(Re)build the index from DATA_DIR"
    )
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    if args.reindex:
        print(build_index())

    app.run(host=args.host, port=args.port, debug=True)
