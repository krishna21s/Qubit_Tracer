import asyncio
import websockets
import json
import sqlite3
import os
import sys

sys.path.insert(0, r"c:\Users\HP\OneDrive\Desktop\qubit\Qubit_Tracer\backend")
import auth

conn = sqlite3.connect(r"c:\Users\HP\OneDrive\Desktop\qubit\Qubit_Tracer\backend\qubit_tracer.db")
c = conn.cursor()
c.execute("SELECT id, username, email FROM users WHERE username IN ('nani', 'vinay')")
users = {row[1]: (row[0], row[2]) for row in c.fetchall()}
print("Users:", users)

token_nani = auth.create_access_token(data={"sub": users["nani"][1]})
token_vinay = auth.create_access_token(data={"sub": users["vinay"][1]})

async def test():
    # Test direct to backend (8000) and via Vite (5173)
    uri_nani = f"ws://127.0.0.1:8000/ws/collab/7?token={token_nani}"
    uri_vinay = f"ws://127.0.0.1:5173/ws/collab/7?token={token_vinay}"
    
    print("Connecting Nani to 8000 and Vinay to 5173 (Vite proxy)...")
    try:
        async with websockets.connect(uri_nani) as ws_nani, websockets.connect(uri_vinay) as ws_vinay:
            # 1. read init
            init_nani = json.loads(await ws_nani.recv())
            print("Nani init:", init_nani)
            # participants broadcast on nani connect
            msg1 = json.loads(await ws_nani.recv())
            print("Nani recv msg1:", msg1)

            init_vinay = json.loads(await ws_vinay.recv())
            print("Vinay init:", init_vinay)

            # participants broadcast to both on vinay connect
            msg_p_nani = json.loads(await ws_nani.recv())
            print("Nani recv participants:", msg_p_nani)
            msg_p_vinay = json.loads(await ws_vinay.recv())
            print("Vinay recv participants:", msg_p_vinay)

            # 2. Nani sends cursor move
            print("Nani broadcasting cursor_move (200, 100)...")
            await ws_nani.send(json.dumps({"type": "cursor_move", "x": 200, "y": 100}))
            cursor_msg = json.loads(await ws_vinay.recv())
            print("Vinay received cursor:", cursor_msg)

            # 3. Vinay sends circuit_update
            print("Vinay broadcasting circuit_update...")
            update_data = {"gates": [{"id": "gate_test", "type": "H", "qubits": [0], "col": 0}], "qubits": 3}
            await ws_vinay.send(json.dumps({"type": "circuit_update", "data": update_data}))
            circuit_msg = json.loads(await ws_nani.recv())
            print("Nani received circuit_update:", circuit_msg)
            print("SUCCESS! Both 8000 and 5173 proxy work!")
    except Exception as e:
        print("ERROR:", e)
        import traceback
        traceback.print_exc()

asyncio.run(test())
