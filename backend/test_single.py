import asyncio
import websockets
import json
import sqlite3
import sys

sys.path.insert(0, r"c:\Users\HP\OneDrive\Desktop\qubit\Qubit_Tracer\backend")
import auth

conn = sqlite3.connect(r"c:\Users\HP\OneDrive\Desktop\qubit\Qubit_Tracer\backend\qubit_tracer.db")
c = conn.cursor()
c.execute("SELECT id, username, email FROM users WHERE username='nani'")
user_nani = c.fetchone()
token_nani = auth.create_access_token(data={"sub": user_nani[2]})

async def t():
    print("Testing 8000...", flush=True)
    async with websockets.connect(f"ws://127.0.0.1:8000/ws/collab/7?token={token_nani}") as ws:
        print("Connected 8000!", flush=True)
        init = await ws.recv()
        print("Got init from 8000:", init[:80], flush=True)

    print("Testing 5173 (Vite proxy)...", flush=True)
    try:
        async with websockets.connect(f"ws://127.0.0.1:5173/ws/collab/7?token={token_nani}") as ws:
            print("Connected 5173!", flush=True)
            init = await ws.recv()
            print("Got init from 5173:", init[:80], flush=True)
    except Exception as e:
        print("5173 Error:", e, flush=True)

asyncio.run(t())
