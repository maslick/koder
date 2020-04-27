# koder-react
QR code scanner

[![Build Status](https://github.com/maslick/koder-react/workflows/build/badge.svg)](https://github.com/maslick/koder-react/actions?query=workflow%3Abuild)

## Nginx installation 
```
sudo cp deploy/koder-react.nginx /etc/nginx/sites-available/koder-react.nginx
sudo ln -s /etc/nginx/sites-available/koder-react.nginx /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Build Zbar WASM
```
docker run -v $(pwd):/app maslick/emscripten-zbar-sdk make
docker run -v $(pwd):/app maslick/emscripten-zbar-sdk make clean

docker run -e INPUT_FILE=zbar/qr.cpp -e OUTPUT_FILE=qr -v $(pwd):/app maslick/emscripten-zbar-sdk make
docker run -e INPUT_FILE=zbar/barcode.cpp -e OUTPUT_FILE=barcode -v $(pwd):/app maslick/emscripten-zbar-sdk make

docker run \
  -e INPUT_FILE=zbar/barcode.cpp \
  -e OUTPUT_FILE=barcode \
  -e OUTPUT_DIR=test \
  -v $(pwd):/app \
  maslick/emscripten-zbar-sdk make
```
