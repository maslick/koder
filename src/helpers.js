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

const formatCovidCertificate = async (code) => {
  const base_url = "https://0bxnzxkgfe.execute-api.eu-central-1.amazonaws.com";
  const data = await fetch(base_url + "/validate", {
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    method: 'POST',
    body: JSON.stringify({code: code})
  });
  return data.json();
};

const syntaxHighlight = (json) => {
  let res = "";
  res += `Name: ${json.std_name}\n`;
  res += `National name: ${json.name}\n`;
  res += `Born: ${json.dob}\n`;

  if (json.vaccinations) {
    let vaccine_type = "";
    switch (json.vaccinations[0].product) {
      case "EU/1/20/1528":
        vaccine_type = "Comirnaty";
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
        vaccine_type = json.vaccinations[0].product;
    }

    res += `Issued on: ${json.vaccinations[0].date}\n`;
    res += `Issuer: ${json.vaccinations[0].issuer}\n`;
    res += `Vaccine: ${vaccine_type}\n`;
    res += `Doses: ${json.vaccinations[0].doses}/${json.vaccinations[0].dose_series}\n`;
    res += `Country: ${json.vaccinations[0].country}\n`;
  }

  if (json.tests) {
    let test_type = "";
    switch (json.tests[0].test_type) {
      case "LP217198-3":
        test_type = "Rapid immunoassay";
        break;
      case "LP6464-4":
        test_type = "PCR";
        break;
      default:
        test_type = json.tests[0].test_type;
    }

    let test_result = "";
    switch (json.tests[0].test_result) {
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
        test_result = json.tests[0].test_result;
    }

    res += `Issued on: ${json.tests[0].sample_datetime}\n`;
    res += `Issuer: ${json.tests[0].issuer}\n`;
    res += `Test type: ${test_type}\n`;
    res += `Test result: ${test_result}\n`;
    res += `Country: ${json.tests[0].country}\n`;
  }

  return res;
};



export {beep, WORKER_TYPE, formatUpnQr, formatCovidCertificate, syntaxHighlight};