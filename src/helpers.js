import {unpackAndVerify, addCachedCerts} from "@pathcheck/dcc-sdk";
import {cachedCerts} from "./certs";

const beep = (freq = 750, duration = 150, vol = 5) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext || false;
  if (!AudioContext) {
    console.warn("Sorry, Web Audio API is not supported by your browser");
    return;
  }
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  oscillator.frequency.value = freq;
  oscillator.type = "square";
  gain.connect(context.destination);
  gain.gain.value = vol * 0.01;
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration * 0.001);
};

const WORKER_TYPE = {
  BARCODE: "wasmBarcode",
  QR: "wasmQr",
  JS: "jsQr"
};

const formatUpnQr = (obj) => {
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
  if (obj.referenca_prejemnika != null) res += `Referenca: ${obj.referenca_prejemnika}\n`;
  if (obj.ulica_prejemnika != null) res += `Naslov: ${obj.ulica_prejemnika}\n`;
  if (obj.kraj_prejemnika != null) res += `Kraj: ${obj.kraj_prejemnika}`;
  return res;
};

addCachedCerts(cachedCerts);

const fetchCovidCertDetails = async (code) => {
  const cwtPayload = await unpackAndVerify(code);
  const record = cwtPayload.get(-260).get(1);

  const dob = record.dob;
  const name =  record.nam.fnt + "<<" + record.nam.gnt;
  const national_name = record.nam.fn + " " + record.nam.gn;

  const vaccination = extractVaccine(record);
  const test = extractTest(record);

  return {name, national_name, dob, vaccination, test};
};

const extractTest = (record) => {
  if (!record.t) return null;
  const unique_cert_id = record.t[0].ci;
  const issued_on = record.t[0].sc;
  const issuer = record.t[0].is;
  const test_type = record.t[0].tt;
  const test_result = record.t[0].tr;
  const country = record.t[0].co;

  return {unique_cert_id, issued_on, issuer, test_type, test_result, country};
};

const extractVaccine = (record) => {
  if (!record.v) return null;
  const unique_cert_id = record.v[0].ci;
  const issued_on = record.v[0].dt;
  const issuer = record.v[0].is;
  const vaccine_type = record.v[0].mp;
  const doses = record.v[0].dn;
  const dose_series = record.v[0].sd;
  const country = record.v[0].co;

  return {unique_cert_id, issued_on, issuer, vaccine_type, doses, dose_series, country};
};

const formatCovidCert = (json) => {
  let res = "";
  res += `Name: ${json.name}\n`;
  res += `National name: ${json.national_name}\n`;
  res += `Born: ${json.dob}\n`;

  if (json.vaccination) {
    const format = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeZone: 'UTC',
    });
    const formatISO8601Timestamp = (ts) => format.format(new Date(ts));

    let vaccine_type = "";
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
    res += `Issued on: ${formatISO8601Timestamp(json.vaccination.issued_on)}\n`;
    res += `Issuer: ${json.vaccination.issuer}\n\n`;
    res += `Vaccine: ${vaccine_type}\n`;
    res += `Dose: ${json.vaccination.doses}/${json.vaccination.dose_series}\n`;
  }

  if (json.test) {
    const format = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    });
    const formatISO8601Timestamp = (ts) => format.format(new Date(ts));

    let test_type = "";
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

    let test_result = "";
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
    res += `Issued: ${formatISO8601Timestamp(json.test.issued_on)}\n`;
    res += `Issuer: ${json.test.issuer}\n\n`;
    res += `Test type: ${test_type}\n`;
    res += `Test result: ${test_result}\n`;
  }

  return res;
};



export {beep, WORKER_TYPE, formatUpnQr, fetchCovidCertDetails, formatCovidCert};