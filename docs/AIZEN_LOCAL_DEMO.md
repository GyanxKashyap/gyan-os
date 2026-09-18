# Aizen local demo

Aizen stays local for this version. This portfolio does not include model weights,
run a cloud inference service, or deploy the model. Its information tabs and project
gallery work even when generation is offline.

## Start the model

Follow the [Aizen repository](https://github.com/GyanxKashyap/aizen) for current
requirements and model details. Its documented v6 setup is:

```sh
git clone https://github.com/GyanxKashyap/aizen.git
cd aizen
gh release download v6 --pattern '*.pt'
python3 -m venv .venv
.venv/bin/pip install torch flask
.venv/bin/python server.py
```

The release contains `aizen_phase8.pt` (Chat) and
`aizen_phase8_pretrained.pt` (Story). Alternatively, download these from
[Aizen releases](https://github.com/GyanxKashyap/aizen/releases) into that
repository’s root. Python, PyTorch and the weights are separate prerequisites;
`npm ci` in Gyan OS does not install them.

Leave Aizen listening on `127.0.0.1:8321`. Start Gyan OS in a second terminal:

```sh
cd path/to/gyan-os
npm run dev
```

Open Settings → Check connection, then open Aizen. Try a short question such as
“What is 12 + 7?” or a story opening. Small-model outputs are demonstrations and
may be incorrect or repetitive.

## Connection contract

Vite proxies `/meta`, `/chat` and `/story` to the loopback model server. Leave
`VITE_AIZEN_API_BASE` blank; no external endpoint is needed.

| Route | Purpose |
| --- | --- |
| `GET /meta` | JSON metadata with nonempty `checkpoint`, `story_checkpoint` and positive `params` |
| `POST /chat` | JSON `question` and recent `history` pairs; streamed `text/plain` response |
| `POST /story` | JSON `prompt`, `tokens`, `temperature`; streamed `text/plain` response |

The UI checks metadata rather than trusting an HTML page or an OPTIONS response.
Connection checks time out after five seconds; generation has a three-minute
client timeout. Stop cancels the frontend request and retains partial output.
Whether server computation stops immediately depends on the local model server.
Closing Aizen cancels its current frontend requests. Minimizing does not.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Local demo offline | Start the model server, confirm port 8321, then click Check connection |
| Chat works but Story fails | Confirm the pretrained Story checkpoint exists; it loads separately |
| Missing checkpoint error | Download the v6 weights into the Aizen repository, not this one |
| Empty/HTML response | Use the Vite local server and its proxy; a static file server cannot run a model |
| Long wait | Check the Aizen terminal; the first model load may be slow. Stop and retry if necessary |
| Port 5173 occupied | Use the address Vite prints; a different port has separate browser storage |

No authentication is implemented by the local Aizen demo. Keep its listener local.
No hosted-backend setup or deployment workflow is part of this release.
