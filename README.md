# =koder=
WebAssembly + ReactJS QR/barcode code scanner

[![Build Status](https://github.com/maslick/koder-react/workflows/build/badge.svg)](https://github.com/maslick/koder-react/actions?query=workflow%3Abuild)

<p align="center" >
  <img src="./screenshots/app_1.png" width="400px" />
  <img src="./screenshots/app_2.png" width="400px" />
</p>

## 🚀 Features
* QR module written in WebAssembly
* Uses Zbar C++ library (version [0.23.90](https://github.com/mchehab/zbar))
* Packaged as PWA (caching files with Service Worker, Add to Home Screen)
* Mobile first (can be used on a Laptop as well)
* Multiplatform (iOS, Android)
* QR recognition logic is performed inside a Web Worker (off the browser's Main thread)
* Support for UPN QR (Slovenia only)
* ReactJS component
* Vanilla JS example

## 🍭 Demo
https://qr.maslick.tech

## ✅ Installation

### 1. Builder image
```shell
docker build -t maslick/emscripten-zbar-sdk -f docker/Dockerfile docker
```

### 2. Build WASM artifacts (qr, barcode):
```shell
docker run -e INPUT_FILE=zbar/qr.cpp -e OUTPUT_FILE=qr -v $(pwd):/app maslick/emscripten-zbar-sdk make -B
docker run -e INPUT_FILE=zbar/barcode.cpp -e OUTPUT_FILE=barcode -v $(pwd):/app maslick/emscripten-zbar-sdk make -B
```

Override all defaults by specifying ``INPUT_FILE``, ``OUTPUT_FILE``, ``OUTPUT_DIR``, e.g. for barcode:
```shell
docker run \
  -e INPUT_FILE=zbar/barcode.cpp \
  -e OUTPUT_FILE=barcode \
  -e OUTPUT_DIR=test \
  -v $(pwd):/app \
  maslick/emscripten-zbar-sdk make -B
```

Clean the build artifacts:
```shell
OUTPUT_DIR=public/wasm OUTPUT_FILE=qr make clean
OUTPUT_DIR=public/wasm OUTPUT_FILE=barcode make clean
```

### 3. Use the resulting WASM artifacts

```shell
# Fetch dependencies
yarn install --frozen-lockfile

# Development mode
npm run start
open https://locahost:8080

# Production mode
npm run build
cd build && python3 -m http.server 8001 --bind 0.0.0.0
open http://localhost:8001
```


## 💡 BONUS: vanilla js example (qr + barcode)
```shell
# Build WASM artifacts
docker run \
  -e INPUT_FILE=zbar/all.cpp \
  -e OUTPUT_FILE=all \
  -e OUTPUT_DIR=vanilla-js/wasm \
  -v $(pwd):/app \
  maslick/emscripten-zbar-sdk make vanilla-js -B
  
docker run -e INPUT_FILE=zbar/all.cpp -e OUTPUT_FILE=all -e OUTPUT_DIR=vanilla-js/wasm -v $(pwd):/app maslick/emscripten-zbar-sdk make vanilla-js

# Serve static HTML app
cd vanilla-js && python3 -m http.server 8001 --bind 0.0.0.0
open http://localhost:8001
```

Clean the build artifacts:
```shell
OUTPUT_DIR=vanilla-js/wasm OUTPUT_FILE=all make clean-vanilla-js
```
