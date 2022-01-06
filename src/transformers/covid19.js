import {CODE_TYPE, fetchCovidCertDetails, formatCovidCert} from "../helpers";

class Covid19 {
  recognizer = "HC1:";

  codeType() {
    return CODE_TYPE.COVID19;
  }

  identified(raw) {
    return raw.includes(this.recognizer);
  }

  async transform(raw) {
    try {
      return formatCovidCert(await fetchCovidCertDetails(raw));
    } catch (e) {
      console.log(e);
      return "This EU Digital COVID Certificate is INVALID!";
    }
  }

  static buttonCaption() {
    return "COVID";
  }
}

export {Covid19};