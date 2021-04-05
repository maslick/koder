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
      const buf = api.createBuffer(width * height * 4);
      mod.HEAP8.set(imgData, buf);
      const results = [];
      if (api.scanCode(buf, width, height)) {
        const res_addr = api.getScanResults();
        results.push(utf8BufferToString(mod.HEAP8, res_addr));
        api.deleteBuffer(res_addr);
      }
      return results;
    }
  };
  return new Promise((resolv, reject) => {
    mod.then(() => {
      resolv(scanner);
    });
  });
};

