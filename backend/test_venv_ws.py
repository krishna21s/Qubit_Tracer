import asyncio
import websockets
import json
import sqlite3
import auth

conn = sqlite3.connect(r"qubit_tracer.db")
c = conn.cursor()
c.execute("SELECT id, username, email FROM users WHERE username='nani'")
user = c.fetchone()
token = auth.create_access_token(data={"sub": user[2]})

async def test_connect():
    url = f"ws://127.0.0.1:8000/ws/collab/7?token={token}"
    print(f"Connecting to {url}...", flush=True)
    try:
        ws = await websockets.connect(url, open_timeout=5)
        print("Connected!", flush=True)
        msg = await ws.recv()
        print("Received init:", msg, flush=True)
        await ws.close()
    except Exception as e:
        print("Exception:", type(e), e, flush=True)
        import traceback
        traceback.print_exc()

asyncio.run(test_connect())
