importScripts("wasm/all.js");
importScripts("wasm/helper.js");

const scanner = Scanner({locateFile: file => 'wasm/' + file});
let width = 0, height = 0;

self.addEventListener('message', event => {
  if ('width' in event.data && 'height' in event.data) {
    this.width = event.data.width;
    this.height = event.data.height;
  }

  const {data} = event.data;
  if (!data) return;
  const scanRes = scanner.then(s => {
    const t0 = new Date().getTime();
    const scanRes = s.scanCode(data, this.width, this.height);
    const t1 = new Date().getTime();
    if (scanRes.length) {
      console.log(`Scanned in ${t1-t0} ms`);
      postMessage({data: scanRes[scanRes.length - 1]});
    }
  })
});