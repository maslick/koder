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

const parseUpnQr = (obj) => {
  let res = "";
  let date = obj.rok_placila;
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  const rok = `${d}.${m}.${y}`;

  res += `Plačnik: ${obj.ime_placnika}\n`;
  res += `Naslov: ${obj.ulica_placnika}\n`;
  res += `Kraj: ${obj.kraj_placnika}\n\n`;
  res += `Znesek: ${obj.znesek}\n`;
  res += `Nujno: ${obj.nujno}\n`;
  res += `Koda namena: ${obj.koda_namena}\n`;
  res += `Namen: ${obj.namen_placila}\n`;
  res += `Rok plačila: ${rok}\n`;
  res += `IBAN: ${obj.IBAN_prejemnika}\n\n`;
  res += `Referenca: ${obj.referenca_prejemnika}\n`;
  res += `Naslov: ${obj.ulica_prejemnika}\n`;
  res += `Kraj: ${obj.kraj_prejemnika}`;
  return res;
};

const isUrl = (url) => {
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/;
  const regex = new RegExp(expression);
  return !!url.match(regex);
};

export {beep, WORKER_TYPE, parseUpnQr, isUrl};