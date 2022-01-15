import {CODE_TYPE, Transformer} from "./base";
import {decode} from "upnqr";

class Upnqr extends Transformer {
  recognizer = "UPNQR";

  codeType() {
    return CODE_TYPE.UPNQR;
  }

  identified(raw) {
    return raw.includes(this.recognizer);
  }

  async transform(raw) {
    try {
      return this.formatUpnQr(decode(raw));
    }
    catch (e) {
      console.log(e);
    }
  }

  static buttonCaption() {
    return "UPNQR";
  }

  formatUpnQr(obj){
    let res = "";
    let rok = "";
    let date = obj.rok_placila;
    if (date != null) {
      console.log("Date: " + date);
      const d = date.getDate();
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      rok = `${d}.${m}.${y}`;
    }

    if (obj.ime_placnika != null) res += `Plačnik: ${obj.ime_placnika}\n`;
    if (obj.ulica_placnika != null) res += `Naslov: ${obj.ulica_placnika}\n`;
    if (obj.kraj_placnika != null) res += `Kraj: ${obj.kraj_placnika}\n\n`;
    if (obj.znesek != null) res += `Znesek: ${obj.znesek} EUR\n`;
    if (obj.koda_namena != null) res += `Koda namena: ${obj.koda_namena}\n`;
    if (obj.namen_placila != null) res += `Namen: ${obj.namen_placila}\n`;
    if (rok.length > 0) res += `Rok plačila: ${rok}\n`;
    if (obj.IBAN_prejemnika != null) res += `IBAN: ${obj.IBAN_prejemnika}\n`;
    if (obj.nujno != null) res += `Nujno: ${obj.nujno ? "da" : "ne"}\n\n`;
    if (obj.ime_prejemnika != null) res += `Prejemnik: ${obj.ime_prejemnika}\n`;
    if (obj.referenca_prejemnika != null) res += `Referenca: ${obj.referenca_prejemnika}\n`;
    if (obj.ulica_prejemnika != null) res += `Naslov: ${obj.ulica_prejemnika}\n`;
    if (obj.kraj_prejemnika != null) res += `Kraj: ${obj.kraj_prejemnika}`;
    return res;
  };
}

export {Upnqr};
