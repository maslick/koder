importScripts("https://cdn.jsdelivr.net/npm/jsqr@1.2.0/dist/jsQR.min.js");

let width = 0, height = 0;

self.addEventListener('message', event => {
  if ('width' in event.data && 'height' in event.data) {
    this.width = event.data.width;
    this.height = event.data.height;
  }

  const {data} = event.data;
  if (!data) return;

  const t0 = new Date().getTime();
  const code = jsQR(data, this.width, this.height, { inversionAttempts: "dontInvert" });
  const t1 = new Date().getTime();
  if (code != null) {
    console.log(`Scanned in ${t1-t0} ms`);
    postMessage({
      data: code.data,
      ms: t1-t0
    });
  }
});