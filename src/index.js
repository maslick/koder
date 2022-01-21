import React from 'react';
import ReactDom from "react-dom";
import * as serviceWorker from './serviceWorker';
import Scan from "./components/scan";


ReactDom.render((
    <div className="main">
      <Scan scanRate={250}/>
    </div>
), document.getElementById("app"));

serviceWorker.register();
