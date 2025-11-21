export function captureFrameToDataUrl(videoEl, maxSide = 1280, quality = 0.8) {
  if (!videoEl || !videoEl.videoWidth) {
    throw new Error("Video not ready for capture");
  }

  const vw = videoEl.videoWidth;
  const vh = videoEl.videoHeight;

  let scale = 1;
  const longer = Math.max(vw, vh);
  if (longer > maxSide) scale = maxSide / longer;

  const w = Math.round(vw * scale);
  const h = Math.round(vh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoEl, 0, 0, w, h);

  return canvas.toDataURL("image/png", quality);
}
