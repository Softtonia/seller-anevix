"use client";
import React, { useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import FormElement from '@/utils/FormElement/FormElement';
import Button from '@/utils/Button/Button';
import { authApi } from '@/api';
import './Forgot.css';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // Support token from dynamic route param (/reset-password/[token]) or query param (?token=XYZ)
  const token = params?.token || searchParams.get('token') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password) {
      setErrorMsg('Password is required');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!token) {
      setErrorMsg('Reset token is missing or invalid.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Calls /auth/customer/reset-password/TOKEN_HERE
      await authApi.customer.resetPassword(token, {
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccessMsg('Password has been successfully reset! Redirecting to sign in...');
      setTimeout(() => {
        router.push('/signin');
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-form-section">
          <h1 className="Poppins-bold">New Password</h1>
          <p className="forgot-subtitle">Please enter your secure password and keep it safe.</p>

          <form onSubmit={handleSubmit} className="auth-form reset-password-form">
            <FormElement
              name="password"
              type="password"
              placeholder="New password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <FormElement
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

            {errorMsg && <div className="auth-error-alert" style={{ margin: '8px 0' }}>{errorMsg}</div>}
            {successMsg && (
              <div style={{ color: '#10b981', fontSize: '13px', margin: '8px 0', fontWeight: '500' }}>
                {successMsg}
              </div>
            )}

            <div style={{ marginTop: 8 }}>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </div>

        <div className="forgot-hero">
          <img src="/assets/images/forgot.png" alt="reset" style={{ maxWidth: '90%', height: 'auto' }} />
        </div>
      </div>
    </div>
  );
}
