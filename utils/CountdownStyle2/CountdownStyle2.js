"use client";

import React, { useState, useEffect } from 'react';
import './CountdownStyle2.css';

const CountdownStyle2 = ({ targetDate, label = 'LIMITED TIME ONLY' }) => {
  // Default to 2 days from now if no targetDate passed
  const resolvedTarget = targetDate
    ? new Date(targetDate)
    : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  const getTimeLeft = () => {
    const total = resolvedTarget - new Date();
    if (isNaN(total) || total <= 0)
      return { days: '00', hours: '00', mins: '00', secs: '00' };

    const pad = (n) => String(Math.floor(n)).padStart(2, '0');

    return {
      days:  pad(total / (1000 * 60 * 60 * 24)),
      hours: pad((total / (1000 * 60 * 60)) % 24),
      mins:  pad((total / (1000 * 60)) % 60),
      secs:  pad((total / 1000) % 60),
    };
  };

  const [timer, setTimer] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(getTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="countdownStyle2Wrapper">
      <span className="countdownStyle2Label">{label}</span>
      <div className="countdownStyle2Track">
        <div className="countdownStyle2Unit">
          <span className="countdownStyle2Value">{timer.days}</span>
          <span className="countdownStyle2Text">Days</span>
        </div>
        <div className="countdownStyle2Unit">
          <span className="countdownStyle2Value">{timer.hours}</span>
          <span className="countdownStyle2Text">Hours</span>
        </div>
        <div className="countdownStyle2Unit">
          <span className="countdownStyle2Value">{timer.mins}</span>
          <span className="countdownStyle2Text">Min</span>
        </div>
        <div className="countdownStyle2Unit">
          <span className="countdownStyle2Value">{timer.secs}</span>
          <span className="countdownStyle2Text">Sec</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownStyle2;