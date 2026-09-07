import socket, sqlite3, sys
sys.path.insert(0, r'c:\Users\HP\OneDrive\Desktop\qubit\Qubit_Tracer\backend')
import auth

conn = sqlite3.connect('qubit_tracer.db')
c = conn.cursor()
c.execute("SELECT email FROM users WHERE username='nani'")
email = c.fetchone()[0]
token = auth.create_access_token(data={'sub': email})

s = socket.socket()
s.settimeout(5)
s.connect(('127.0.0.1', 8000))
req = (
    f'GET /ws/collab/7?token={token} HTTP/1.1\r\n'
    'Host: 127.0.0.1:8000\r\n'
    'Upgrade: websocket\r\n'
    'Connection: Upgrade\r\n'
    'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n'
    'Sec-WebSocket-Version: 13\r\n'
    'Origin: http://localhost:5173\r\n\r\n'
).encode()
s.sendall(req)
try:
    resp = s.recv(1024)
    print('Response:', resp.decode('latin1'))
except Exception as e:
    print('Error:', e)
s.close()
