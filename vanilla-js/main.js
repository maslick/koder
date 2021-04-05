////////////////
// Worker
////////////////
let worker = null;
if (navigator.serviceWorker) {
  navigator.serviceWorker.register('sw.js').then(function(registration) {
    console.log('ServiceWorker registration successful with scope:',  registration.scope);
  }).catch(function(error) {
    console.log('ServiceWorker registration failed:', error);
  });
}

function initWorker() {
  worker = new Worker("wasmWorker.js");
  worker.onmessage = (ev) => terminateWorker(ev, "");
}

const terminateWorker = (ev, prefix) => {
  if (ev.data != null) {
    worker.terminate();
    const result = ev.data;
    beep();
    stopVideo();
    showCode(prefix + result.data);
  }
};

////////////////
// Constants
////////////////
const CANVAS_SIZE = {
  WIDTH: window.innerWidth,
  HEIGHT: window.innerHeight
};
const focusBoxWidth = 200;
const focusBoxHeight = 200;

////////////////
// Elements
////////////////
const container = document.getElementById("canvas");
const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const barcodeEl = document.getElementById("result");

function init() {
  showElement(btnStart);
  hideElement(btnStop);
  btnStart.onclick = startVideo;
  btnStop.onclick = stopVideo;
  hideCanvas();
}

init();
hideElement(barcodeEl);

////////////////
// Canvas
////////////////
let ctx = container.getContext('2d');

////////////////
// Video
////////////////
let video = null;
let oldTime = 0;

function tick(time) {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    showElement(btnStop);
    container.width = Math.min(CANVAS_SIZE.WIDTH, video.videoWidth);
    container.height = Math.min(CANVAS_SIZE.HEIGHT, video.videoHeight);

    const sx = (container.width - focusBoxWidth) / 2;
    const sy = (container.height - focusBoxHeight) / 2;

    ctx.drawImage(video, 0, 0);
    ctx.fillStyle = "black";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(0,0, container.width, container.height);
    ctx.drawImage(video, sx, sy, focusBoxWidth, focusBoxHeight, sx, sy, focusBoxWidth, focusBoxHeight);

    if (time - oldTime > 600) {
      oldTime = time;
      let imageData = ctx.getImageData(sx, sy, focusBoxWidth, focusBoxHeight);
      worker.postMessage({data: imageData.data, width: imageData.width, height: imageData.height});
    }
  }
  requestAnimationFrame(tick);
}

////////////////
// Helpers
////////////////
function startVideo() {
  video = document.createElement("video");
  hideElement(btnStart);
  hideElement(barcodeEl);
  showCanvas();

  initWorker();
  navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: "environment"}}).then(stream => {
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.play();
    requestAnimationFrame(tick);
  });
}

function stopVideo() {
  hideElement(btnStop);
  video.pause();
  video.srcObject.getVideoTracks().forEach(track => track.stop());
  video.srcObject = null;
  init();
}

function beep(freq = 750, duration = 150, vol = 5) {
  const AudioContext = window.AudioContext || window.webkitAudioContext || false;
  if (!AudioContext) {
    console.warn("Sorry, but the Web Audio API is not supported by your browser");
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
}

////////////////
// DOM
////////////////
function hideElement(el) {
  el.style.display = "none";
}

function showElement(el) {
  el.style.display = "initial";
}

function hideCanvas() {
  container.hidden = true;
}

function showCanvas() {
  container.hidden = false;
}

function showCode(qr) {
  barcodeEl.style.display = "flex";
  barcodeEl.innerText = qr;
}