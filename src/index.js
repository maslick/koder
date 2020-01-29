import React from 'react';
import ReactDom from "react-dom";
import * as serviceWorker from './serviceWorker';
import Scan from "./components/scan";
import {WORKER_TYPE} from "./helpers";


ReactDom.render((
    <div className="main">
      <Scan worker={WORKER_TYPE.QR} scanRate={250}/>
    </div>
), document.getElementById("app"));

serviceWorker.register();
