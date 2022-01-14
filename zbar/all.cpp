#include <iostream>
#include <string.h>
#include <zbar.h>


#ifdef __EMSCRIPTEN__
  #include <emscripten.h>
#endif

zbar::ImageScanner scanner;
zbar::Image* image = NULL;
zbar::Image::SymbolIterator symb_p;

/*
 Tell compiler to not modify the names of  the functions
 that the JavaScript code will be calling
*/
#ifdef __cplusplus
extern "C" {
#endif

    #ifdef __EMSCRIPTEN__
      EMSCRIPTEN_KEEPALIVE
    #endif
    void* createBuffer(const int length) {
        return malloc(length * sizeof(uint8_t));
    }

    #ifdef __EMSCRIPTEN__
      EMSCRIPTEN_KEEPALIVE
    #endif
    void deleteBuffer(uint8_t* buf) {
        free(buf);
    }

    /**
     * Trigger scan/decoding. Takes 3 params as input (image buffer, image width and image height)
     * and returns an integer, which represents the outcome of the scan
     *
     * @param imgBuf 8 bit unsigned integer array with image data
     * @param width image width (16 bit unsigned integer)
     * @param height image height (16 bit unsigned integer)
     *
     * @return >0 if symbols were successfully decoded from the image
     *         0 if no symbols were found or
     *         -1 if an error occurred
     */
    #ifdef __EMSCRIPTEN__
      EMSCRIPTEN_KEEPALIVE
    #endif
    int triggerDecode(uint8_t* imgBuf, uint16_t width, uint16_t height) {
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

    /**
     * Returns the result of the scan in a string
     *
     * @return char* containing a decoded QR/bar code
     */
    #ifdef __EMSCRIPTEN__
      EMSCRIPTEN_KEEPALIVE
    #endif
    const char* getScanResults() {
        if (!image) {
            std::cerr << "Call triggerDecode first to get scan result\n";
            return NULL;
        }
        if (symb_p == image->symbol_end())
            return NULL;
        std::cout << "decoded " << symb_p->get_type_name() << std::endl;
        std::cout << symb_p->get_data() << std::endl;
        std::string data = symb_p->get_data();
        char* str = (char*)malloc(data.size() + 1);
        strcpy(str, data.c_str());
        ++ symb_p;
        return str;
    }

#ifdef __cplusplus
}
#endif

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
