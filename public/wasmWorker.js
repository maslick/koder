importScripts("wasm/zbar.js");
importScripts("wasm/helper.js");

const scanner = Scanner({ locateFile: file => 'wasm/' + file });

self.addEventListener('message', event => {
  const {data, width, height} = event.data;
  const scanRes = scanner.then(s => {
    const scanRes = s.scanQrcode(data, width, height);
    if (scanRes.length) postMessage({data: scanRes[scanRes.length-1]});
  });
});