"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined
} from '@mui/icons-material';
import FormElement from '@/utils/FormElement/FormElement';
import Button from '@/utils/Button/Button';
import './Auth.css';

export default function Auth() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateField = (name, value) => {
    let error = '';
    if (name === 'firstName' && !value.trim()) {
      error = 'First name is required';
    } else if (name === 'lastName' && !value.trim()) {
      error = 'Last name is required';
    } else if (name === 'email') {
      if (!value) {
        error = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Please enter a valid email address';
      }
    } else if (name === 'phone') {
      if (!value) {
        error = 'Mobile number is required';
      } else if (!/^\+?[0-9]{10,14}$/.test(value)) {
        error = 'Please enter a valid mobile number';
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      }
    } else if (name === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== form.password) {
        error = 'Passwords do not match';
      }
    } else if (name === 'agreeToTerms' && !value) {
      error = 'You must agree to the Terms & Conditions';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGeneralError('');

    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const fieldError = validateField(key, form[key]);
      if (fieldError) {
        newErrors[key] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    router.push('/');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-hero">
          <Image
            src="/assets/images/signup.png"
            alt="signup illustration"
            width={500}
            height={400}
            priority
          />
        </div>
        <div className="auth-form-section">
          <h2>Sign Up to your account ...</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-row">
              <FormElement
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                icon={<PersonOutlined />}
              />
              <FormElement
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                icon={<PersonOutlined />}
              />
            </div>

            <FormElement
              name="email"
              type="email"
              placeholder="Enter Your Email Address"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              icon={<EmailOutlined />}
            />

            <FormElement
              name="phone"
              placeholder="Enter Your Mobile Number"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={<PhoneOutlined />}
            />

            <FormElement
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Set Password"
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

            <FormElement
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<PersonOutlined />}
              showPasswordToggle={true}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
              VisibilityIcon={VisibilityOutlined}
              VisibilityOffIcon={VisibilityOffOutlined}
            />

            <label className="auth-checkbox">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={form.agreeToTerms}
                onChange={handleChange}
              />
              <span>
                By signing up, you agree to our <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
              </span>
            </label>
            {errors.agreeToTerms && <span className="field-error-msg">{errors.agreeToTerms}</span>}

            {generalError && <div className="auth-error-alert">{generalError}</div>}

            <Button type="submit" variant="primary">Create Account</Button>
            <p className="auth-already">Already have an account? <a href="/signin">Sign In</a></p>
          </form>
        </div>
      </div>
    </div>
  );
}
