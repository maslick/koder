import React from "react";
import "../css/scan.css";
import PropTypes from 'prop-types';
import {beep, WORKER_TYPE} from "../helpers";

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
      scanning: false,
      fpsOn: this.props.fps !== false
    };

    this.decodeQR = this.props.decode;
    this.allowBeep = this.props.beep;
    this.drawDecodedArea = this.props.drawDecodedArea;
    this.workerType = this.props.worker;
    this.scanRate = this.props.scanRate;

    this.qrworker = null;
    this.oldTime = 0;
  }

  initWorker = () => {
    this.qrworker = new Worker(this.workerType + "Worker.js");

    this.qrworker.onmessage = ev => {
      if (ev.data != null) {
        this.qrworker.terminate();
        const result = ev.data;
        if (this.drawDecodedArea && this.workerType === WORKER_TYPE.JS) {
          this.drawLine(result.location.topLeftCorner, result.location.topRightCorner, "#FF3B58");
          this.drawLine(result.location.topRightCorner, result.location.bottomRightCorner, "#FF3B58");
          this.drawLine(result.location.bottomRightCorner, result.location.bottomLeftCorner, "#FF3B58");
          this.drawLine(result.location.bottomLeftCorner, result.location.topLeftCorner, "#FF3B58");
        }
        this.stopScan();
        this.setState({barcode: result.data});
        if (this.allowBeep) beep();
      }
    };
  };

  drawLine = (begin, end, color) => {
    this.canvas.beginPath();
    this.canvas.moveTo(begin.x, begin.y);
    this.canvas.lineTo(end.x, end.y);
    this.canvas.lineWidth = 4;
    this.canvas.strokeStyle = color;
    this.canvas.stroke();
  };

  startScan = () => {
    this.initWorker();
    this.fpsTimestamp = new Date();

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
    }).catch(err => {
      this.stopScan();
      alert(err);
    });
  };

  stopScan = () => {
    this.setState({
      scanning: false,
      btnText: BTN_TXT.AGAIN,
      boxShadow: "0 4px 8px 0 rgba(0, 0, 0, .2), 0 6px 20px 0 rgba(0, 0, 0, .19)"
    });
    this.video.pause();
    if (this.video.srcObject) {
      this.video.srcObject.getVideoTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
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
      if (this.decodeQR) this.recogniseQRcode(time);
      if (this.state.fpsOn) this.drawFPS(fps);
    }
    if (this.state.scanning) requestAnimationFrame(this.tick);
  };

  recogniseQRcode = (time) => {
    if (time - this.oldTime > this.scanRate) {
      this.oldTime = time;
      let imageData = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      this.qrworker.postMessage({data: imageData.data, width: imageData.width, height: imageData.height});
    }
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

  onFPSClickHandler = (e) => {
    e.preventDefault();
    this.setState({fpsOn: !this.state.fpsOn});
  };

  startStyle = () => {
    if (this.state.scanning) return { backgroundColor: "red" };
    else return { backgroundColor: "" };
  };

  fpsStyle = () => {
    if (this.state.fpsOn) return { backgroundColor: "green" };
    else return { backgroundColor: "" };
  };

  render() {
    return (
        <div className="scan">
          <div className="barcode">
            {this.state.barcode}
          </div>
          <canvas id="canvas" className="scanCanvas"/>
          <div className="scanBtn">
            <a href="!#" className="myHref" onClick={this.onBtnClickHandler} style={this.startStyle()}>{this.state.btnText}</a>
            <a href="!#" className="myHref" onClick={this.onFPSClickHandler} style={this.fpsStyle()}>FPS</a>
          </div>
        </div>
    );
  }

  componentWillUnmount() {
    if (this.state.scanning === true) this.stopScan();
  }
}

Scan.propTypes = {
  beep: PropTypes.bool,
  fps: PropTypes.bool,
  decode: PropTypes.bool,
  drawDecodedArea: PropTypes.bool,
  worker: PropTypes.string,
  scanRate: PropTypes.number
};

Scan.defaultProps = {
  beep: true,
  fps: false,
  decode: true,
  drawDecodedArea: false,
  worker: "wasmBarcode",
  scanRate: 500
};

export default Scan;