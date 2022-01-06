import {CODE_TYPE, formatUpnQr} from "../helpers";
import {decode} from "upnqr";

class Upnqr {
  recognizer = "UPNQR";

  codeType() {
    return CODE_TYPE.UPNQR;
  }

  identified(raw) {
    return raw.includes(this.recognizer);
  }

  transform(raw) {
    try {
      return formatUpnQr(decode(raw));
    }
    catch (e) {
      console.log(e);
    }
  }

  static buttonCaption() {
    return "UPNQR";
  }
}

export {Upnqr};