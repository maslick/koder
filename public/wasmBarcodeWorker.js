importScripts("wasm/barcode.js");
importScripts("wasm/helper.js");

const scanner = Scanner({ locateFile: file => 'wasm/' + file });

self.addEventListener('message', event => {
  const {data, width, height} = event.data;
  const scanRes = scanner.then(s => {
    const scanRes = s.scanCode(data, width, height);
    if (scanRes.length) postMessage({data: scanRes[scanRes.length-1]});
  });
});