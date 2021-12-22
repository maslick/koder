#include <iostream>

#include <emscripten.h>
#include <string.h>
#include <zbar.h>

zbar::ImageScanner scanner;
zbar::Image* image = NULL;
zbar::Image::SymbolIterator symb_p;

extern "C" {

EMSCRIPTEN_KEEPALIVE
void* createBuffer(int length) {
    return malloc(length * sizeof(uint8_t));
}

EMSCRIPTEN_KEEPALIVE
void deleteBuffer(uint8_t* buf) {
    free(buf);
}

EMSCRIPTEN_KEEPALIVE
int scanCode(uint8_t* imgBuf, int width, int height) {
    uint8_t* grayImgBuf = (uint8_t*)malloc(width * height * sizeof(uint8_t));
    for (int i = 0; i < width; ++i) {
        for (int j = 0; j < height; ++j) {
            uint8_t* pixels = imgBuf + i * height * 4 + j * 4;
            grayImgBuf[i * height + j] = 0.3 * pixels[0] + 0.59 * pixels[1] + 0.11 * pixels[2];
        }
    }
    free(imgBuf);
    if (image) {
        delete image;
    }
    image = new zbar::Image(width, height, "Y800", grayImgBuf, width * height);
    int scan_res = scanner.scan(*image);
    free(grayImgBuf);
    symb_p = image->symbol_begin();
    return scan_res;
}

EMSCRIPTEN_KEEPALIVE
const char* getScanResults() {
    if (!image) {
        std::cerr << "Call scanCode first to get scan result\n";
        return NULL;
    }
    if (symb_p == image->symbol_end())
        return NULL;
    std::cout << "decoded " << symb_p->get_type_name() << ": " << symb_p->get_data() << std::endl;
    std::string data = symb_p->get_data();
    char* str = (char*)malloc(data.size() + 1);
    strcpy(str, data.c_str());
    ++ symb_p;
    return str;
}

}

int main(int argc, char** argv) {
    scanner.set_config(zbar::ZBAR_NONE, zbar::ZBAR_CFG_ENABLE, 0);
    scanner.set_config(zbar::ZBAR_QRCODE, zbar::ZBAR_CFG_ENABLE, 1);
    scanner.set_config(zbar::ZBAR_UPCA, zbar::ZBAR_CFG_ENABLE, 1);
    scanner.set_config(zbar::ZBAR_UPCE, zbar::ZBAR_CFG_ENABLE, 1);
    scanner.set_config(zbar::ZBAR_EAN8, zbar::ZBAR_CFG_ENABLE, 1);
    scanner.set_config(zbar::ZBAR_EAN13, zbar::ZBAR_CFG_ENABLE, 1);
    scanner.set_config(zbar::ZBAR_I25, zbar::ZBAR_CFG_ENABLE, 1);
    scanner.set_config(zbar::ZBAR_CODE128, zbar::ZBAR_CFG_ENABLE, 1);
    std::cout << "QR/Barcode scanner initialized" << std::endl;
}
