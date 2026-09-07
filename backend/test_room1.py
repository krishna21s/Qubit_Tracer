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
    print("Testing Room 1 with 3s timeout...", flush=True)
    try:
        async with asyncio.timeout(3):
            async with websockets.connect(f"ws://127.0.0.1:8000/ws/collab/1?token={token_nani}") as ws:
                print("Room 1 connected!", flush=True)
                msg = await ws.recv()
                print("Room 1 msg:", msg[:60], flush=True)
    except Exception as e:
        print("Room 1 FAILED:", type(e), e, flush=True)

asyncio.run(t())
