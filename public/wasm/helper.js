const utf8BufferToString = (buffer, addr) => {
  let end = addr;
  while (buffer[end]) {
    ++end;
  }
  const str = new Uint8Array(buffer.slice(addr, end));
  const encodedString = String.fromCharCode.apply(null, str);
  return decodeURIComponent(escape(encodedString));
};

const Scanner = config => {
  const mod = Module(config);
  const api = {
    createBuffer: mod.cwrap('createBuffer', 'number', ['number']),
    deleteBuffer: mod.cwrap('deleteBuffer', '', ['number']),
    scanCode: mod.cwrap('scanCode', 'number', [
      'number',
      'number',
      'number'
    ]),
    getScanResults: mod.cwrap('getScanResults', 'number', [])
  };
  const scanner = {
    scanCode: (imgData, width, height) => {
      const buffer = api.createBuffer(width * height * 4);
      mod.HEAPU8.set(imgData, buffer);
      const results = [];
      if (api.scanCode(buffer, width, height)) {
        const resultAddress = api.getScanResults();
        results.push(utf8BufferToString(mod.HEAPU8, resultAddress));
        api.deleteBuffer(resultAddress);
      }
      return results;
    }
  };
  return new Promise((resolve, _) => {
    mod.then(() => {
      resolve(scanner);
    });
  });
};

