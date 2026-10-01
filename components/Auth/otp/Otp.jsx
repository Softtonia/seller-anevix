"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/utils/Button/Button';
import './Otp.css';

const OTP_LENGTH = 6;

export default function Otp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));

  const from = searchParams?.get('from');
  const email = searchParams?.get('email');

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (from === 'forgot') {
      router.push('/reset-password');
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="auth-page auth-otp-page">
      <div className="auth-card auth-card-otp">
        <div className="auth-hero auth-hero-otp">
          <img
            src="/assets/images/otp.png"
            alt="otp illustration"
            width={520}
            height={520}
            priority
            className="object-fit-cover"
          />
        </div>

        <div className="auth-form-section auth-form-section-otp">
          <h2 className='Poppins-regular'>{from === 'forgot' ? 'Check your Email' : 'Check Your Phone'}</h2>
          <p className="auth-subtitle">{from === 'forgot' ? `We have sent the code to ${email || 'your email'}` : 'We have sent the code to your phone'}</p>

          <form className="otp-form" onSubmit={handleSubmit}>
            <div className="otp-input-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="otp-input"
                />
              ))}
            </div>

            <div className="otp-meta">
              <span>Code expires in:</span>
              <strong>03:42</strong>
            </div>

            <Button type="submit" variant="primary">Verify</Button>

            <p className="otp-resend">
              You didn’t receive any code? <a href={from === 'forgot' ? `/otp?from=forgot&email=${encodeURIComponent(email||'')}` : '#'}>Resend code</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
