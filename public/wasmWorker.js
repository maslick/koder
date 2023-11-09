importScripts("wasm/zbar.js");
importScripts("wasm/koder.js");


(async () => {
  // Initialize Koder
  const koder = await new Koder().initialize({wasmDirectory: "./wasm"});

  // Listen for messages from JS main thread containing raw image data
  self.addEventListener('message', event => {
    if ('width' in event.data && 'height' in event.data) {
      this.width = event.data.width;
      this.height = event.data.height;
    }

    const {data} = event.data;
    if (!data) return;

    const t0 = new Date().getTime();
    const scanResult = koder.decode(data, this.width, this.height);
    const t1 = new Date().getTime();
    if (scanResult) {
      // Send data back to main JS thread if QR code was found
      postMessage({
        data: scanResult.code,
        type: scanResult.type,
        ms: t1-t0
      });
    }
    else {
      if (event.data.alwaysRespond) {
        // If alwaysRespond is true, send back empty result when scanning finished
        postMessage({
          data: undefined,
          type: undefined,
          ms: t1-t0
        });
      }
    }
  });
})();
