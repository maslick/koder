# =koder=
QR/bar code scanner for the Browser

[![Build Status](https://github.com/maslick/koder-react/workflows/build/badge.svg)](https://github.com/maslick/koder-react/actions?query=workflow%3Abuild)

## :bulb: Demo
* React JS: https://qr.maslick.tech
* Vanilla JS: https://maslick.github.io/koder/


## 🚀 Features
* QR/barcode module implemented in WebAssembly
* Uses Zbar C++ library (version [0.23.90](https://github.com/mchehab/zbar))
* Packaged as PWA (caching files with Service Worker, Add to Home Screen)
* Mobile first (can be used on a Laptop as well)
* Multiplatform (iOS, Android, Desktop)
* QR recognition logic is performed off the browser's Main thread (i.e. Web Worker)
* *koder* React component supports a [jsqr](https://www.npmjs.com/package/jsqr) based Web Worker (see [jsQrWorker.js](./public/jsQrWorker.js))  
* Barcode support (UPC-A, UPC-E, EAN-8, EAN-13, I25, CODE-128)
* Support for UPN QR (Slovenia only)
* :new: EU Digital Covid Certificate validator (vaccination, test), works in ``offline`` mode!
* Emscripten-zbar-sdk [Docker image](https://hub.docker.com/r/maslick/emscripten-zbar-sdk), [Dockerfile](./docker/Dockerfile)
* ReactJS [component](./src/components/scan.js)
* Vanilla JS [example](./docs)

<p align="center" >
  <img src="./screenshots/app_1.png" width="400px" />
  <img src="./screenshots/app_2.png" width="400px" />
</p>

## ⚡ Installation

### 1. Builder image
```shell
docker build -t maslick/emscripten-zbar-sdk -f docker/Dockerfile docker
```

### 2. Build WASM artifacts (qr, barcode):
```shell
docker run \
  -e INPUT_FILE=zbar/all.cpp \
  -e OUTPUT_FILE=all \
  -e OUTPUT_DIR=public/wasm \
  -v $(pwd):/app \
  maslick/emscripten-zbar-sdk make -B
```

Clean the build artifacts:
```shell
OUTPUT_DIR=public/wasm OUTPUT_FILE=all make clean
```

### 3. Use the resulting WASM artifacts

```shell
# Fetch dependencies
yarn install --frozen-lockfile

# Development mode (can be accessed from any device on local wifi)
npm run start
open https://locahost:8080

# Production mode (build and serve static web app, localhost only)
npm run build
npm run build-and-serve
open http://localhost:8082
```


## :gem: BONUS: vanilla js example (qr + barcode)
```shell
# Build WASM artifacts
docker run \
  -e INPUT_FILE=zbar/all.cpp \
  -e OUTPUT_FILE=all \
  -e OUTPUT_DIR=docs/wasm \
  -v $(pwd):/app \
  maslick/emscripten-zbar-sdk make -B

# Serve static HTML app (TODO: should serve via https)
yarn run vanilla-js-live
open http://localhost:8081
```

Clean the build artifacts:
```shell
OUTPUT_DIR=docs/wasm OUTPUT_FILE=all make clean
```

## 🔭 References
* [WebAssembly at Ebay](https://tech.ebayinc.com/engineering/webassembly-at-ebay-a-real-world-use-case/)
* [Barcode Scanner WebAssembly](https://barkeywolf.consulting/posts/barcode-scanner-webassembly/)
* [zbar.wasm](https://github.com/samsam2310/zbar.wasm)
