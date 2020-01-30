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
      fpsOn: this.props.fps,
      bw: this.props.bw,
      beam: this.props.beam,
      crosshair: this.props.crosshair
    };

    this.decodeQR = this.props.decode;
    this.allowBeep = this.props.beep;
    this.drawDecodedArea = this.props.drawDecodedArea;
    this.workerType = this.props.worker;
    this.scanRate = this.props.scanRate;

    this.qrworker = null;
    this.oldTime = 0;

    this.beamPosition = 0;
    this.beamDirectionBottom = true;
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
      btnText: BTN_TXT.START,
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
      if (this.state.bw) this.monochromize();
      if (this.state.beam) this.drawLaserBeam();
      if (this.state.crosshair) this.drawCrosshair();
      if (this.decodeQR) this.recogniseQRcode(time);
      if (this.state.fpsOn) this.drawFPS(fps);
    }
    if (this.state.scanning) requestAnimationFrame(this.tick);
  };

  monochromize = () => {
    let imgd = this.canvas.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
    let pix = imgd.data;
    for (let i = 0; i < pix.length; i += 4) {
      let gray = pix[i] * 0.3 + pix[i + 1] * 0.59 + pix[i + 2] * 0.11;
      pix[i] = gray;
      pix[i + 1] = gray;
      pix[i + 2] = gray;
    }
    this.canvas.putImageData(imgd, 0, 0);
  };

  drawLaserBeam = () => {
    if (this.beamPosition <= 0) this.beamDirectionBottom = true;
    if (this.beamPosition >= CANVAS_SIZE.HEIGHT) this.beamDirectionBottom = false;
    if (this.beamDirectionBottom) this.beamPosition+=3;
    else this.beamPosition-=3;
    this.canvas.fillStyle = "rgba(255,26,26,0.4)";
    this.canvas.fillRect(0, this.beamPosition, CANVAS_SIZE.WIDTH, 4);
  };

  drawCrosshair = () => {
    this.canvas.fillStyle = "rgba(255,255,255,0.4)";
    const shape = new Path2D("M77.125 148.02567c0-3.5774 2.73862-6.27567 6.37076-6.27567H119V117H84.0192C66.50812 117 52 130.77595 52 148.02567V183h25.125v-34.97433zM237.37338 117H202v24.75h35.18494c3.63161 0 6.69006 2.69775 6.69006 6.27567V183H269v-34.97433C269 130.77595 254.88446 117 237.37338 117zM243.875 285.4587c0 3.5774-2.73863 6.27567-6.37076 6.27567H202V317h35.50424C255.01532 317 269 302.70842 269 285.4587V251h-25.125v34.4587zM83.49576 291.73438c-3.63213 0-6.37076-2.69776-6.37076-6.27568V251H52v34.4587C52 302.70842 66.50812 317 84.0192 317H119v-25.26563H83.49576z");
    this.canvas.fill(shape);
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

  onBWClickHandler = (e) => {
    e.preventDefault();
    this.setState({bw: !this.state.bw});
  };

  onStyleHandler = (e) => {
    e.preventDefault();
    this.setState({beam: !this.state.beam, crosshair: !this.state.crosshair});
  };

  startStyle = () => {
    const style = {width: 64, textAlign: "center"};
    if (this.state.scanning) return { backgroundColor: "red", ...style };
    else return { backgroundColor: "", ...style };
  };

  fpsStyle = () => {
    if (this.state.fpsOn) return { backgroundColor: "green" };
    else return { backgroundColor: "" };
  };

  bwStyle = () => {
    if (this.state.bw) return { backgroundColor: "green" };
    else return { backgroundColor: "" };
  };

  styleStyle = () => {
    if (this.state.beam) return { backgroundColor: "green" };
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
            <a href="!#" className="myHref" onClick={this.onBWClickHandler} style={this.bwStyle()}>B/W</a>
            <a href="!#" className="myHref" onClick={this.onStyleHandler} style={this.styleStyle()}>BEAM</a>
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
  scanRate: PropTypes.number,
  bw: PropTypes.bool,
  beam: PropTypes.bool,
  crosshair: PropTypes.bool
};

Scan.defaultProps = {
  beep: true,
  fps: false,
  decode: true,
  drawDecodedArea: false,
  worker: "wasmBarcode",
  scanRate: 500,
  bw: true,
  beam: true,
  crosshair: false
};

export default Scan;