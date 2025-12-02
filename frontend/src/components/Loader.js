import React from "react";
import "./Loader.css";

function Loader({ size = "medium", message = "Loading..." }) {
  return (
    <div className="loader-container">
      <div className={`spinner spinner-${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  );
}

export default Loader;

