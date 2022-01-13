const WasmScanner = config => {
  const mod = Module(config);

  // Initialize a glue API object (between JavaScript and C++ code)
  const api = {
    createBuffer: mod.cwrap('createBuffer', 'number', ['number']),
    deleteBuffer: mod.cwrap('deleteBuffer', '', ['number']),
    triggerDecode: mod.cwrap('triggerDecode', 'number', ['number', 'number', 'number']),
    getScanResults: mod.cwrap('getScanResults', 'number', [])
  };

  // Convert a utf8 buffer (char*) to Javascript string
  const utf8BufferToString = (buffer, addr) => {
    let end = addr;
    while (buffer[end]) {
      ++end;
    }
    const str = new Uint8Array(buffer.slice(addr, end));
    const encodedString = String.fromCharCode.apply(null, str);
    return decodeURIComponent(escape(encodedString));
  };

  // Main logic
  const scanner = {
    scanAndDecode: (imgData, width, height) => {
      const buffer = api.createBuffer(width * height * 4);
      mod.HEAPU8.set(imgData, buffer);
      const results = [];
      if (api.triggerDecode(buffer, width, height) > 0) {
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
