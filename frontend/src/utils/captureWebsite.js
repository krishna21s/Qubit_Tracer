import html2canvas from "html2canvas";

const hasUnsupportedColorFn = (text = "") =>
  /\b(color|oklch|oklab|lch|lab|color-mix)\(/i.test(text);

/**
 * Capture the website DOM.
 * Strategy:
 * 1) Hide the assistant card.
 * 2) Try html2canvas with foreignObjectRendering (browser paints CSS).
 * 3) If that fails, retry with a sanitization pass to strip unsupported color() backgrounds.
 * 4) Resize and return as data URL.
 */
export async function captureWebsiteScreenshot(
  rootSelector = "#root",
  quality = 0.7,
  maxSide = 1024
) {
  const rootEl = document.querySelector(rootSelector) || document.body;
  const assistEl = document.getElementById("visual-assist-card");

  // 1) Hide assistant card to keep it out of the screenshot (and out of parsing).
  let originalDisplay = "";
  if (assistEl) {
    originalDisplay = assistEl.style.display;
    assistEl.style.display = "none";
  }

  // Wait a frame so layout updates are applied
  await new Promise((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0))
  );

  const baseOpts = {
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    scale: 1,
    logging: false,
  };

  try {
    // 2) First attempt: let the browser handle CSS via foreignObjectRendering
    let canvas = await html2canvas(rootEl, {
      ...baseOpts,
      foreignObjectRendering: true,
      imageTimeout: 0,
    });

    // Some environments can produce a 0x0 canvas if something went wrong
    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error("Empty canvas after foreignObjectRendering.");
    }

    return toJPEG(canvas, quality, maxSide);
  } catch (err1) {
    console.warn(
      "[capture] foreignObjectRendering failed. Retrying with sanitization.",
      err1
    );
    try {
      // 3) Second attempt: sanitize the cloned DOM by removing unsupported backgrounds
      const canvas = await html2canvas(rootEl, {
        ...baseOpts,
        onclone: (doc) => {
          try {
            const win = doc.defaultView || window;
            doc.querySelectorAll("*").forEach((el) => {
              const cs = win.getComputedStyle(el);
              const bgImg = cs.backgroundImage || "";
              const bg = cs.background || "";
              if (hasUnsupportedColorFn(bgImg) || hasUnsupportedColorFn(bg)) {
                el.style.backgroundImage = "none";
                // Optional: also strip gradients entirely if you want to be extra safe
                // if ((cs.backgroundImage || "").includes("linear-gradient(")) el.style.backgroundImage = "none";
              }
            });
          } catch (cloneErr) {
            console.warn("[capture] onclone sanitization error:", cloneErr);
          }
        },
        ignoreElements: (el) => {
          // As a final safety net, skip elements that still have unsupported color() in computed background
          try {
            const cs = getComputedStyle(el);
            return (
              hasUnsupportedColorFn(cs.backgroundImage) ||
              hasUnsupportedColorFn(cs.background)
            );
          } catch {
            return false;
          }
        },
      });

      if (!canvas || !canvas.width || !canvas.height) {
        throw new Error("Empty canvas after sanitization.");
      }

      return toJPEG(canvas, quality, maxSide);
    } catch (err2) {
      console.error("Screen capture crashed:", err2);
      return null;
    }
  } finally {
    // 4) Restore assistant card
    if (assistEl) {
      assistEl.style.display = originalDisplay;
    }
  }
}

function toJPEG(canvas, quality, maxSide) {
  const w = canvas.width;
  const h = canvas.height;
  const side = Math.max(w, h);

  let finalCanvas = canvas;

  if (side > maxSide) {
    const scale = maxSide / side;
    const tmp = document.createElement("canvas");
    tmp.width = Math.round(w * scale);
    tmp.height = Math.round(h * scale);
    const ctx = tmp.getContext("2d");
    ctx.drawImage(canvas, 0, 0, tmp.width, tmp.height);
    finalCanvas = tmp;
  }

  return finalCanvas.toDataURL("image/jpeg", quality);
}
