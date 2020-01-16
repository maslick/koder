import React from "react";
import jsQR from "jsqr";
import "../css/scan.css";

const BTN_TXT = {
  START: "START",
  STOP: "STOP",
  AGAIN: "START AGAIN"
};

const CANVAS_SIZE = {
  WIDTH: 320,
  HEIGHT: 430
};

class Scan extends React.Component {
  constructor(props) {
    super(props);
    this.video = document.createElement("video");
    this.state = {
      btnText: BTN_TXT.START,
      scanning: false
    };

    this.showFPS = this.props.fps !== false;
    this.decodeQR = this.props.decode !== false;
    this.allowBeep = this.props.beep !== false;

    this.debounceCounter = 0;  // initial counter
    this.divider = 11;         // scan code every 11th video frame
  }

  drawLine = (begin, end, color) => {
    this.canvas.beginPath();
    this.canvas.moveTo(begin.x, begin.y);
    this.canvas.lineTo(end.x, end.y);
    this.canvas.lineWidth = 4;
    this.canvas.strokeStyle = color;
    this.canvas.stroke();
  };

  startScan = () => {
    this.fpsTimestamp = new Date();
    this.debounceCounter = 0;

    this.setState({
      scanning: true,
      btnText: BTN_TXT.STOP,
      barcode: ""
    });
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
      this.video.srcObject = stream;
      this.video.setAttribute("playsinline", "true");
      this.video.play();
      requestAnimationFrame(this.tick);
    });
  };

  stopScan = () => {
    this.setState({
      scanning: false,
      btnText: BTN_TXT.AGAIN,
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, .2), 0 6px 20px 0 rgba(0, 0, 0, .19)"
    });
    this.video.pause();
    this.video.srcObject.getVideoTracks().forEach(track => track.stop());
    this.video.srcObject = null;
  };

  tick = (time) => {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      let fps = 1000 / (time - this.fpsTimestamp);
      this.fpsTimestamp = time;

      const sw = CANVAS_SIZE.WIDTH;
      const sh = CANVAS_SIZE.HEIGHT;
      const sx = (this.video.videoWidth - CANVAS_SIZE.WIDTH) / 2;
      const sy = (this.video.videoHeight - CANVAS_SIZE.HEIGHT) / 2;

      const dw = sw;
      const dh = sh;
      const dx = 0;
      const dy = 0;

      this.canvas.drawImage(this.video, sx, sy, sw, sh, dx, dy, dw, dh);
      if (this.decodeQR) this.recogniseQRcode();
      if (this.showFPS) this.drawFPS(fps);
    }
    if (this.state.scanning) requestAnimationFrame(this.tick);
  };

  recogniseQRcode = () => {
    if (this.debounceCounter%this.divider === 0) {
      let imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      let code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      if (code) {
        this.drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
        this.drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
        this.drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
        this.drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
        this.stopScan();
        this.setState({barcode: code.data});
        if (this.allowBeep) this.beep();
        return;
      }
    }
    this.debounceCounter++;
  };

  beep = (freq = 750, duration = 150, vol = 5) => {
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
  };

  drawFPS = (fps) => {
    this.canvas.font = "normal 16pt Arial";
    this.canvas.fillStyle = "#f8ff4c";
    this.canvas.fillText(Math.round(fps) + " fps", 10, CANVAS_SIZE.HEIGHT- 16);
  };

  componentDidMount() {
    this.canvasElement = document.getElementById("canvas");
    this.canvas = this.canvasElement.getContext("2d");
    this.canvasElement.width = CANVAS_SIZE.WIDTH;
    this.canvasElement.height = CANVAS_SIZE.HEIGHT;
  }

  onBtnClickHandler = (e) => {
    e.preventDefault();
    if (this.state.scanning) this.stopScan(); else this.startScan();

  };

  render() {
    return (
        <div className="scan">
          <div className="barcode">
            {this.state.barcode}
          </div>
          <canvas id="canvas" className="scanCanvas"/>
          <div className="scanBtn">
            <a href="!#" className="myHref" onClick={this.onBtnClickHandler}>{this.state.btnText}</a>
          </div>
        </div>
    );
  }

  componentWillUnmount() {
    if (this.state.scanning === true) this.stopScan();
  }
}

export default Scan;