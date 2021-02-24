FROM trzeci/emscripten-slim:sdk-tag-1.39.4-64bit as builder
ADD https://linuxtv.org/downloads/zbar/zbar-0.23.90.tar.gz ./

RUN apt-get update && \
    apt-get install make autoconf autopoint pkg-config libtool -y && \
    tar zxvf zbar-0.23.90.tar.gz && \
    rm zbar-0.23.90.tar.gz && \
    cd zbar-0.23.90 && \
    autoreconf -vfi && \
    emconfigure ./configure \
      --without-x \
      --without-jpeg \
      --without-imagemagick \
      --without-npapi \
      --without-gtk \
      --without-python \
      --without-qt \
      --without-xshm \
      --disable-video \
      --disable-pthread && \
    emmake make && \
    apt-get purge autoconf autopoint pkg-config libtool -y

FROM trzeci/emscripten-slim:sdk-tag-1.39.4-64bit
RUN apt-get update && apt-get install make
COPY --from=builder /src/zbar-0.23.90/zbar /src/zbar-0.23.90/zbar
COPY --from=builder /src/zbar-0.23.90/include /src/zbar-0.23.90/include
WORKDIR /app