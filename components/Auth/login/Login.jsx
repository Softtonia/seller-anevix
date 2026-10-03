"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  EmailOutlined,
  PersonOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  Apple,
  Google,
} from '@mui/icons-material';
import FormElement from '@/utils/FormElement/FormElement';
import Button from '@/utils/Button/Button';
import toast from 'react-hot-toast';
import { authApi } from '@/api';
import './Login.css';

export default function Login() {
  const router = useRouter();

  const role = 'business'; // Hardcoded for seller portal
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please enter valid credentials.');
      return;
    }

    setLoading(true);

    try {
      // Calls /auth/business/login OR /auth/customer/login depending on role
      const res = await authApi.login(
        {
          email: form.email,
          password: form.password,
        },
        role
      );

      toast.success(res.data?.message || 'Logged in successfully!');

      // Save user session
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', role);
      }
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Redirect to onboarding if account is not active
        if (res.data.user.accountActive === false || res.data.user.accountactive === false) {
          router.push('/business/onboarding');
          return;
        }
      }

      // Redirect
      router.push('/business/dashboard');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-login-page">
      <div className="auth-card">
        <div className="auth-form-section">
          <h1 className="Poppins-bold">Business Login</h1>
          <p className="auth-subtitle">
            Please enter your business email and password to manage your seller store.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <FormElement
              name="email"
              type="email"
              placeholder="Enter Business Email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              icon={<EmailOutlined />}
            />

            <FormElement
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              icon={<PersonOutlined />}
              showPasswordToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              VisibilityIcon={VisibilityOutlined}
              VisibilityOffIcon={VisibilityOffOutlined}
            />

            <div className="auth-actions-row">
              <Link
                href="/forgot-password"
                className="auth-forgot Poppins-regular"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </Button>

            <div className="auth-divider">
              <span>Or continue with</span>
            </div>

            <div className="auth-social-row">
              <button type="button" className="social-button social-apple Poppins-regular">
                <Apple className="social-icon" /> Continue with Apple
              </button>
              <button type="button" className="social-button social-google Poppins-regular">
                <Google className="social-icon" /> Continue with Google
              </button>
            </div>

            <p className="auth-already Poppins-regular">
              Don’t have an account?{' '}
              <Link href="/signup">
                Sign up
              </Link>
            </p>
          </form>
        </div>

        <div className="auth-hero auth-hero-login">
          <img
            src="/assets/images/login.png"
            alt="login illustration"
            className="auth-login-image"
          />
        </div>
      </div>
    </div>
  );
}
