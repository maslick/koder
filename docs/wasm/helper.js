class Scanner {
  async init() {
    // Load WASM file
    this.mod = await CreateKoder({
      locateFile: file => `wasm/${file}`,
    });

    // Initialize a glue API object (between JavaScript and C++ code)
    this.api = {
      createBuffer: this.mod.cwrap('createBuffer', 'number', ['number']),
      deleteBuffer: this.mod.cwrap('deleteBuffer', '', ['number']),
      triggerDecode: this.mod.cwrap('triggerDecode', 'number', ['number', 'number', 'number']),
      getScanResults: this.mod.cwrap('getScanResults', 'number', [])
    };

    return this;
  }

  decode(imgData, width, height) {
    const buffer = this.api.createBuffer(width * height * 4);
    this.mod.HEAPU8.set(imgData, buffer);
    const results = [];
    if (this.api.triggerDecode(buffer, width, height) > 0) {
      const resultAddress = this.api.getScanResults();
      results.push(this.mod.UTF8ToString(resultAddress));
      this.api.deleteBuffer(resultAddress);
    }
    return results;
  }
}