FROM emscripten/emsdk:3.1.1 as builder
ARG ZBAR_VERSION="0.23.90"

ADD https://linuxtv.org/downloads/zbar/zbar-$ZBAR_VERSION.tar.gz ./

RUN apt-get update && \
    apt-get install make autoconf autopoint pkg-config libtool -y && \
    tar zxvf zbar-$ZBAR_VERSION.tar.gz && \
    rm zbar-$ZBAR_VERSION.tar.gz && \
    cd zbar-$ZBAR_VERSION && \
    autoreconf -vfi && \
    emconfigure ./configure \
      --without-x \
      --without-xv \
      --without-libiconv-prefix \
      --without-jpeg \
      --without-imagemagick \
      --without-npapi \
      --without-gtk \
      --without-python \
      --without-qt \
      --without-xshm \
      --disable-video \
      --disable-pthread \
      --disable-x86asm \
      --disable-inline-asm \
      --disable-stripping \
      --disable-programs \
      --disable-doc \
      --disable-assert && \
    emmake make CFLAGS=-Os CXXFLAGS=-Os DEFS="-DZNO_MESSAGES -DHAVE_CONFIG_H" && \
    apt-get purge autoconf autopoint pkg-config libtool -y

FROM emscripten/emsdk:3.1.1
ARG ZBAR_VERSION="0.23.90"

RUN apt-get update && apt-get install make
COPY --from=builder /src/zbar-$ZBAR_VERSION/zbar /src/zbar-$ZBAR_VERSION/zbar
COPY --from=builder /src/zbar-$ZBAR_VERSION/include /src/zbar-$ZBAR_VERSION/include
WORKDIR /app