# koder-react
QR code scanner

[![Build Status](https://github.com/maslick/koder-react/workflows/build/badge.svg)](https://github.com/maslick/koder-react/actions?query=workflow%3Abuild)

## Build Zbar WASM
```shell
docker run -e INPUT_FILE=zbar/qr.cpp -e OUTPUT_FILE=qr -v $(pwd):/app maslick/emscripten-zbar-sdk:slim make
docker run -e INPUT_FILE=zbar/barcode.cpp -e OUTPUT_FILE=barcode -v $(pwd):/app maslick/emscripten-zbar-sdk:slim make
```

```shell
docker run \
  -e INPUT_FILE=zbar/barcode.cpp \
  -e OUTPUT_FILE=barcode \
  -e OUTPUT_DIR=test \
  -v $(pwd):/app \
  maslick/emscripten-zbar-sdk make
```
