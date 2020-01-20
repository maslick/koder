importScripts("https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js");

onmessage = function (event) {
  const {data, width, height} = event.data;
  const code = jsQR(data, width, height, { inversionAttempts: "dontInvert" });
  if (code != null) postMessage(code);
};