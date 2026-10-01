import React from 'react';
import './CountdownStyle1.css';

const CountdownStyle1 = ({ timer, label = 'Limited Time only!' }) => {
  if (!timer) return null;

  return (
    <div className="countdownStyle1Wrapper">
      <span className="countdownLabel">{label}</span>
      <div className="countdownStyle1Timer">
        <div className="countdownUnit">
          <span className="countdownValue">{timer.days}</span>
          <span className="countdownText">Days</span>
        </div>
        <span className="countdownSeparator">:</span>
        <div className="countdownUnit">
          <span className="countdownValue">{timer.hours}</span>
          <span className="countdownText">Hours</span>
        </div>
        <span className="countdownSeparator">:</span>
        <div className="countdownUnit">
          <span className="countdownValue">{timer.mins}</span>
          <span className="countdownText">Min</span>
        </div>
        <span className="countdownSeparator">:</span>
        <div className="countdownUnit">
          <span className="countdownValue">{timer.secs}</span>
          <span className="countdownText">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownStyle1;
