"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormElement from '@/utils/FormElement/FormElement';
import Button from '@/utils/Button/Button';
import { authApi } from '@/api';
import "./Forgot.css";

export default function Forgot() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Calls /auth/customer/forgot-password
      const res = await authApi.customer.forgotPassword({ email });
      setSuccessMsg(res.data?.message || "Password reset instructions have been sent to your email.");
      setTimeout(() => {
        const params = new URLSearchParams({ from: "forgot", email });
        router.push(`/otp?${params.toString()}`);
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process forgot password request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-form-section">
          <h1 className="Poppins-bold">Forgot Password</h1>
          <p className="forgot-subtitle">
            Enter your email address and we&#39;ll send you instructions to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <FormElement
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg("");
              }}
              required
            />

            {errorMsg && <div className="auth-error-alert" style={{ margin: '8px 0' }}>{errorMsg}</div>}
            {successMsg && (
              <div style={{ color: '#10b981', fontSize: '13px', margin: '8px 0', fontWeight: '500' }}>
                {successMsg}
              </div>
            )}

            <div className="forgot-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Sending..." : "Continue"}
              </Button>
              <Link href="/signin" className="auth-forgot Poppins-regular text-decoration-none mt-2">
                Back to login
              </Link>
            </div>
          </form>
        </div>

        <div className="forgot-hero">
          <img
            src="/assets/images/forgot.png"
            alt="forgot"
            style={{ maxWidth: "90%", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}
