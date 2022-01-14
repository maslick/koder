const WasmScanner = config => {
  const mod = Module(config);

  // Initialize a glue API object (between JavaScript and C++ code)
  const api = {
    createBuffer: mod.cwrap('createBuffer', 'number', ['number']),
    deleteBuffer: mod.cwrap('deleteBuffer', '', ['number']),
    triggerDecode: mod.cwrap('triggerDecode', 'number', ['number', 'number', 'number']),
    getScanResults: mod.cwrap('getScanResults', 'number', [])
  };

  // Main logic
  const scanner = {
    scanAndDecode: (imgData, width, height) => {
      const buffer = api.createBuffer(width * height * 4);
      mod.HEAPU8.set(imgData, buffer);
      const results = [];
      if (api.triggerDecode(buffer, width, height) > 0) {
        const resultAddress = api.getScanResults();
        results.push(mod.UTF8ToString(resultAddress));
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
