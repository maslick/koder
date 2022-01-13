importScripts("wasm/all.js");
importScripts("wasm/helper.js");

const scanner = WasmScanner({locateFile: file => 'wasm/' + file});

self.addEventListener('message', event => {
  if ('width' in event.data && 'height' in event.data) {
    this.width = event.data.width;
    this.height = event.data.height;
  }

  const {data} = event.data;
  if (!data) return;
  scanner.then(s => {
    const t0 = new Date().getTime();
    const scanResult = s.scanAndDecode(data, this.width, this.height);
    const t1 = new Date().getTime();
    if (scanResult.length) {
      console.log(`Scanned in ${t1-t0} ms`);
      postMessage({
        data: scanResult[scanResult.length - 1],
        ms: t1-t0
      });
    }
  })
});