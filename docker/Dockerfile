FROM trzeci/emscripten:sdk-incoming-64bit
ADD https://netix.dl.sourceforge.net/project/zbar/zbar/0.10/zbar-0.10.tar.gz ./

RUN tar zxvf zbar-0.10.tar.gz && \
    rm zbar-0.10.tar.gz && \
    cd zbar-0.10 && \
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
    emmake make

WORKDIR /app