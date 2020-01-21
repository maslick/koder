importScripts("https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js");

self.addEventListener('message', event => {
  const { eventType, eventData, eventId } = event.data;
  console.log(eventType);
  const {data, width, height} = event.data;
  const code = jsQR(data, width, height, { inversionAttempts: "dontInvert" });
  if (code != null) postMessage(code);
});