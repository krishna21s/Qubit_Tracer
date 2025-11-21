import base64
import requests

API = "https://neat-windows-jog.loca.lt/analyse"   # << use your URL

def send(img_path, prompt="Explain this image"):
    with open(img_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    r = requests.post(API, data={"image": b64, "prompt": prompt})
    print("Status:", r.status_code)
    print("Result:", r.json())

send("image.png")
