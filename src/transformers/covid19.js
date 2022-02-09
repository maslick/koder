import {cachedCerts} from "./certs";
import {CODE_TYPE, Transformer} from "./base";
import {addCachedCerts, unpackAndVerify} from "@pathcheck/dcc-sdk";

class Covid19 extends Transformer {
  recognizer = "HC1:";

  constructor() {
    super();
    addCachedCerts(cachedCerts);
  }

  codeType() {
    return CODE_TYPE.COVID19;
  }

  identified(raw) {
    return raw.includes(this.recognizer);
  }

  async transform(raw) {
    try {
      return this.formatCovidCert(await this.fetchCovidCertDetails(raw));
    } catch (e) {
      console.log(e);
      return "This EU Digital COVID Certificate is INVALID!";
    }
  }

  async fetchCovidCertDetails(code) {
    const cwtPayload = await unpackAndVerify(code);
    const record = cwtPayload.get(-260).get(1);

    const dob = record.dob;
    const name =  record["nam"]["fnt"] + "<<" + record["nam"]["gnt"];
    const national_name = record["nam"]["fn"] + " " + record["nam"]["gn"];

    const vaccination = this.extractVaccine(record);
    const test = this.extractTest(record);

    return {name, national_name, dob, vaccination, test};
  };

  extractTest(record) {
    if (!record.t) return null;
    const unique_cert_id = record.t[0]["ci"];
    const issued_on = record.t[0]["sc"];
    const issuer = record.t[0]["is"];
    const test_type = record.t[0]["tt"];
    const test_result = record.t[0]["tr"];
    const country = record.t[0]["co"];

    return {unique_cert_id, issued_on, issuer, test_type, test_result, country};
  };

  extractVaccine(record) {
    if (!record["v"]) return null;
    const unique_cert_id = record["v"][0]["ci"];
    const issued_on = record["v"][0]["dt"];
    const issuer = record["v"][0]["is"];
    const vaccine_type = record["v"][0]["mp"];
    const doses = record["v"][0]["dn"];
    const dose_series = record["v"][0]["sd"];
    const country = record["v"][0]["co"];

    return {unique_cert_id, issued_on, issuer, vaccine_type, doses, dose_series, country};
  };

  formatCovidCert(json) {
    const format_date = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    });
    const format_datetime = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });
    const formatISO8601Date = (ts) => format_date.format(new Date(ts));
    const formatISO8601DateTime = (ts) => format_datetime.format(new Date(ts));

    let res = "";
    res += `Name: ${json.name}\n`;
    res += `National name: ${json.national_name}\n`;
    res += `Born: ${formatISO8601Date(json.dob)}\n`;

    if (json.vaccination) {
      let vaccine_type;
      switch (json.vaccination.vaccine_type) {
        case "EU/1/20/1528":
          vaccine_type = "Comirnaty (Pfizer)";
          break;
        case "EU/1/20/1507":
          vaccine_type = "Spikevax";
          break;
        case "EU/1/20/1525":
          vaccine_type = "Janssen";
          break;
        case "EU/1/21/1529":
          vaccine_type = "Vaxzevria";
          break;
        default:
          vaccine_type = json.vaccination.product;
      }

      res += `Country: ${json.vaccination.country}\n\n`;
      res += `Issued on: ${formatISO8601Date(json.vaccination.issued_on)}\n`;
      res += `Issuer: ${json.vaccination.issuer}\n\n`;
      res += `Vaccine: ${vaccine_type}\n`;
      res += `Dose: ${json.vaccination.doses}/${json.vaccination.dose_series}\n`;
      res += `\n${json.vaccination.unique_cert_id}\n`;
    }

    if (json.test) {
      let test_type;
      switch (json.test.test_type) {
        case "LP217198-3":
          test_type = "Rapid immunoassay";
          break;
        case "LP6464-4":
          test_type = "PCR";
          break;
        default:
          test_type = json.test.test_type;
      }

      let test_result;
      switch (json.test.test_result) {
        case "260415000":
          test_result = "Negative";
          break;
        case "260373001":
          test_result = "Positive";
          break;
        case "261665006":
          test_result = "Unknown";
          break;
        default:
          test_result = json.test.test_result;
      }

      res += `Country: ${json.test.country}\n\n`;
      res += `Issued: ${formatISO8601DateTime(json.test.issued_on)}\n`;
      res += `Issuer: ${json.test.issuer}\n\n`;
      res += `Test type: ${test_type}\n`;
      res += `Test result: ${test_result}\n`;
      res += `\n${json.test.unique_cert_id}\n`;
    }

    return res;
  };

  static buttonCaption() {
    return "COVID";
  }
}

export {Covid19};