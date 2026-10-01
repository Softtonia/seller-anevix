"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  BadgeOutlined,
} from '@mui/icons-material';
import FormElement from '@/utils/FormElement/FormElement';
import Button from '@/utils/Button/Button';
import toast from 'react-hot-toast';
import { authApi } from '@/api';
import './Signup.css';

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role: 'business'
  const [role, setRole] = useState('business');

  // Default to business always
  useEffect(() => {
    setRole('business');
  }, [searchParams]);

  // Roles fetched from http://localhost:5000/roles
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  // Fetch roles when on business registration
  useEffect(() => {
    if (role === 'business') {
      const fetchRoles = async () => {
        try {
          const res = await authApi.getRoles();
          const rolesData = res.data?.data || res.data?.roles || res.data || [];
          if (Array.isArray(rolesData)) {
            setAvailableRoles(rolesData);
            // Do not pre-select automatically; user will explicitly select their role(s)
          }
        } catch (err) {
          console.error('Failed to fetch roles:', err);
        }
      };
      fetchRoles();
    }
  }, [role]);

  const handleAddRole = (roleId) => {
    if (!roleId) return;
    const strId = String(roleId);
    if (!selectedRoleIds.includes(strId)) {
      setSelectedRoleIds((prev) => [...prev, strId]);
      if (errors.roles) {
        setErrors((prev) => ({ ...prev, roles: '' }));
      }
    }
  };

  const handleRemoveRole = (roleId) => {
    const strId = String(roleId);
    setSelectedRoleIds((prev) => prev.filter((id) => id !== strId));
  };

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verification state for Email and Phone with 30-second resend timer
  const [emailVerification, setEmailVerification] = useState({
    sent: false,
    otp: '',
    verified: false,
    loading: false,
    error: '',
    resendTimer: 0,
  });

  const [phoneVerification, setPhoneVerification] = useState({
    sent: false,
    otp: '',
    verified: false,
    loading: false,
    error: '',
    resendTimer: 0,
  });

  // Countdown timer for email OTP resend
  useEffect(() => {
    let timer;
    if (emailVerification.resendTimer > 0) {
      timer = setInterval(() => {
        setEmailVerification((prev) => ({
          ...prev,
          resendTimer: prev.resendTimer > 0 ? prev.resendTimer - 1 : 0,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailVerification.resendTimer]);

  // Countdown timer for phone OTP resend
  useEffect(() => {
    let timer;
    if (phoneVerification.resendTimer > 0) {
      timer = setInterval(() => {
        setPhoneVerification((prev) => ({
          ...prev,
          resendTimer: prev.resendTimer > 0 ? prev.resendTimer - 1 : 0,
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneVerification.resendTimer]);

  const validateField = (name, value, currentForm = form) => {
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
    } else if (name === 'phoneNumber') {
      if (!value) {
        error = 'Phone number is required';
      } else if (!/^[0-9]{10}$/.test(value)) {
        error = 'Phone number must be exactly 10 digits';
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
      } else if (value !== currentForm.password) {
        error = 'Passwords do not match';
      }
    } else if (name === 'agreeToTerms' && !value) {
      error = 'You must agree to the Terms & Conditions';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    // Restrict phone number to numbers only and max 10 digits
    if (name === 'phoneNumber') {
      val = val.replace(/\D/g, '').slice(0, 10);
    }

    const updatedForm = { ...form, [name]: val };
    setForm(updatedForm);

    // Reset verification if user changes email or phone
    if (name === 'email') {
      setEmailVerification({ sent: false, otp: '', verified: false, loading: false, error: '' });
    }
    if (name === 'phoneNumber') {
      setPhoneVerification({ sent: false, otp: '', verified: false, loading: false, error: '' });
    }

    // Dynamic validation on typing for password and confirmPassword
    if (name === 'password') {
      const pwdError = validateField('password', val, updatedForm);
      const confirmError = updatedForm.confirmPassword
        ? validateField('confirmPassword', updatedForm.confirmPassword, updatedForm)
        : '';
      setErrors((prev) => ({
        ...prev,
        password: pwdError,
        confirmPassword: confirmError,
      }));
    } else if (name === 'confirmPassword') {
      const confirmError = validateField('confirmPassword', val, updatedForm);
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    } else if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Send OTP for Email using live backend API
  const handleSendEmailOtp = async () => {
    const err = validateField('email', form.email);
    if (err) {
      setErrors((prev) => ({ ...prev, email: err }));
      toast.error(err);
      return;
    }
    setEmailVerification((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await authApi.sendEmailOtp({ email: form.email }, role);
      setEmailVerification((prev) => ({
        ...prev,
        sent: true,
        loading: false,
        error: '',
        resendTimer: 30,
      }));
      toast.success(res.data?.message || 'OTP sent to your email successfully!');
    } catch (e) {
      const msg = e.message || 'Failed to send email OTP.';
      setEmailVerification((prev) => ({
        ...prev,
        sent: true,
        loading: false,
        error: msg,
      }));
      toast.error(msg);
    }
  };

  // Confirm OTP for Email using live backend API
  const handleConfirmEmailOtp = async () => {
    if (!emailVerification.otp) {
      const msg = 'Please enter OTP';
      setEmailVerification((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
      return;
    }
    setEmailVerification((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await authApi.verifyEmailOtp({
        email: form.email,
        otp: emailVerification.otp,
      }, role);
      setEmailVerification((prev) => ({ ...prev, verified: true, sent: false, loading: false, error: '' }));
      toast.success(res.data?.message || 'Email verified successfully!');
    } catch (e) {
      const msg = e.message || 'Invalid or expired OTP';
      setEmailVerification((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
      toast.error(msg);
    }
  };

  // Resend Email OTP using {{live}}/auth/business/resend-email-otp or customer endpoint
  const handleResendEmailOtp = async () => {
    if (emailVerification.resendTimer > 0) return;
    setEmailVerification((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await authApi.resendEmailOtp({ email: form.email }, role);
      setEmailVerification((prev) => ({
        ...prev,
        loading: false,
        error: '',
        resendTimer: 30,
      }));
      toast.success(res.data?.message || 'OTP resent to your email!');
    } catch (e) {
      const msg = e.message || 'Failed to resend OTP';
      setEmailVerification((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
      toast.error(msg);
    }
  };

  // Send OTP for Mobile using live backend API
  const handleSendPhoneOtp = async () => {
    const err = validateField('phoneNumber', form.phoneNumber);
    if (err) {
      setErrors((prev) => ({ ...prev, phoneNumber: err }));
      toast.error(err);
      return;
    }
    setPhoneVerification((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await authApi.sendMobileOtp({ phoneNumber: form.phoneNumber }, role);
      setPhoneVerification((prev) => ({
        ...prev,
        sent: true,
        loading: false,
        error: '',
        resendTimer: 30,
      }));
      toast.success(res.data?.message || 'OTP sent to your mobile successfully!');
    } catch (e) {
      const msg = e.message || 'Failed to send mobile OTP.';
      setPhoneVerification((prev) => ({
        ...prev,
        sent: true,
        loading: false,
        error: msg,
      }));
      toast.error(msg);
    }
  };

  // Confirm OTP for Mobile using live backend API
  const handleConfirmPhoneOtp = async () => {
    if (!phoneVerification.otp) {
      const msg = 'Please enter OTP';
      setPhoneVerification((prev) => ({ ...prev, error: msg }));
      toast.error(msg);
      return;
    }
    setPhoneVerification((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await authApi.verifyMobileOtp({
        phoneNumber: form.phoneNumber,
        otp: phoneVerification.otp,
      }, role);
      setPhoneVerification((prev) => ({ ...prev, verified: true, sent: false, loading: false, error: '' }));
      toast.success(res.data?.message || 'Phone number verified successfully!');
    } catch (e) {
      const msg = e.message || 'Invalid or expired OTP';
      setPhoneVerification((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
      toast.error(msg);
    }
  };

  // Resend Mobile OTP using {{live}}/auth/business/resend-mobile-otp or customer endpoint
  const handleResendPhoneOtp = async () => {
    if (phoneVerification.resendTimer > 0) return;
    setPhoneVerification((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await authApi.resendMobileOtp({ phoneNumber: form.phoneNumber }, role);
      setPhoneVerification((prev) => ({
        ...prev,
        loading: false,
        error: '',
        resendTimer: 30,
      }));
      toast.success(res.data?.message || 'OTP resent to your mobile!');
    } catch (e) {
      const msg = e.message || 'Failed to resend mobile OTP';
      setPhoneVerification((prev) => ({
        ...prev,
        loading: false,
        error: msg,
      }));
      toast.error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    const newErrors = {};
    const fieldsToValidate = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'password',
      'confirmPassword',
      'agreeToTerms',
    ];

    fieldsToValidate.forEach((key) => {
      const fieldError = validateField(key, form[key]);
      if (fieldError) {
        newErrors[key] = fieldError;
      }
    });

    if (role === 'business' && selectedRoleIds.length === 0) {
      newErrors.roles = 'Please select at least one business role.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError || 'Please fix the errors in the form.');
      return;
    }

    setLoading(true);

    try {
      // Resolve selected role objects
      const selectedRoleObjs = availableRoles.filter((r) =>
        selectedRoleIds.includes(String(r._id || r.id || r.role_id))
      );
      const roleSlugsOrNames = selectedRoleObjs.map(
        (r) => r.slug || r.name || r.roleName || 'b2c-seller'
      );

      // Primary role_id: prefer mongo _id, then id
      const primaryRoleObj = selectedRoleObjs[0] || availableRoles.find(
        (r) => String(r._id || r.id || r.role_id) === String(selectedRoleIds[0])
      );
      const primaryRoleId = primaryRoleObj?._id || primaryRoleObj?.id || selectedRoleIds[0] || undefined;

      // Exact payload formatting
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        ...(role === 'business' && {
          roles: roleSlugsOrNames.length > 0 ? roleSlugsOrNames : ['b2c-seller'],
          role_id: primaryRoleId,
          role_ids: selectedRoleIds,
        }),
      };

      // Calls /customer/signup or /business/signup
      const res = await authApi.signup(payload, role);

      toast.success('Account created successfully!');

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userRole', role);
      }
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      if (role === 'business') {
        router.push('/business/onboarding');
      } else {
        router.push('/my-account');
      }
    } catch (err) {
      const msg = err.message || 'Signup failed. Please try again.';
      setGeneralError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-hero">
          <Image
            src="/assets/images/signup.png"
            alt="signup illustration"
            width={650}
            height={650}
            priority
          />
        </div>
        <div className="auth-form-section">
          <h1 className="Poppins-bold">
            {role === 'business' ? 'Register Business Account' : 'Create Customer Account'}
          </h1>
          <p className="auth-subtitle" style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
            {role === 'business'
              ? 'Join as an Anevix partner or seller to grow your business.'
              : 'Sign up as a customer to explore exclusive deals and track your orders.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {role === 'business' && availableRoles.length > 0 && (
              <div className="business-roles-field">
                {/* Select dropdown to pick / add roles */}
                <div className="add-role-select-wrapper">
                  <select
                    className="add-role-select"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddRole(e.target.value);
                      }
                    }}
                  >
                    <option value="">
                      {selectedRoleIds.length === 0
                        ? 'Select Business Account Role'
                        : '+ Select / Add another role...'}
                    </option>
                    {availableRoles
                      .filter(
                        (r) => !selectedRoleIds.includes(String(r._id || r.id || r.role_id))
                      )
                      .map((r) => {
                        const id = String(r._id || r.id || r.role_id);
                        const label = r.name || r.roleName || r.title || r.slug;
                        return (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Selected Roles Chips / Tags rendered BELOW the select */}
                {selectedRoleIds.length > 0 && (
                  <div className="selected-roles-container">
                    {selectedRoleIds.map((id) => {
                      const roleObj = availableRoles.find(
                        (r) => String(r._id || r.id || r.role_id) === String(id)
                      );
                      const label =
                        roleObj?.name || roleObj?.roleName || roleObj?.title || roleObj?.slug || id;
                      return (
                        <span key={id} className="role-chip">
                          <span className="role-chip-text">{label}</span>
                          <button
                            type="button"
                            className="role-chip-remove"
                            onClick={() => handleRemoveRole(id)}
                            title="Remove role"
                            aria-label={`Remove ${label}`}
                          >
                            <CloseOutlined style={{ fontSize: '13px' }} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                {errors.roles && (
                  <span className="error-message" style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: '#ff4d4f' }}>
                    {errors.roles}
                  </span>
                )}
              </div>
            )}

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

            {/* Email with Verify Button */}
            <div className="auth-verify-field">
              <div className="auth-input-with-verify">
                <FormElement
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={<EmailOutlined />}
                />
                <button
                  type="button"
                  className={`verify-btn ${emailVerification.verified ? 'verified' : ''}`}
                  onClick={handleSendEmailOtp}
                  disabled={emailVerification.loading || emailVerification.verified}
                >
                  {emailVerification.verified ? (
                    <>
                      <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px' }} />
                      Verified
                    </>
                  ) : emailVerification.loading ? (
                    'Sending...'
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>

              {/* Email OTP Verification Input */}
              {emailVerification.sent && !emailVerification.verified && (
                <div className="otp-inline-box">
                  <input
                    type="text"
                    placeholder="Enter Email OTP"
                    className="otp-inline-input"
                    maxLength={6}
                    value={emailVerification.otp}
                    onChange={(e) =>
                      setEmailVerification((prev) => ({ ...prev, otp: e.target.value, error: '' }))
                    }
                  />
                  <button
                    type="button"
                    className="otp-inline-btn"
                    onClick={handleConfirmEmailOtp}
                    disabled={emailVerification.loading}
                  >
                    Confirm OTP
                  </button>
                  <button
                    type="button"
                    className="otp-cancel-btn otp-resend-btn"
                    onClick={handleResendEmailOtp}
                    disabled={emailVerification.loading || emailVerification.resendTimer > 0}
                  >
                    {emailVerification.resendTimer > 0
                      ? `Resend (${emailVerification.resendTimer}s)`
                      : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    className="otp-cancel-btn"
                    onClick={() =>
                      setEmailVerification((prev) => ({ ...prev, sent: false, otp: '', error: '' }))
                    }
                  >
                    ✕
                  </button>
                </div>
              )}
              {emailVerification.error && (
                <span className="field-error-msg">{emailVerification.error}</span>
              )}
            </div>

            {/* Phone Number with Verify Button */}
            <div className="auth-verify-field">
              <div className="auth-input-with-verify">
                <FormElement
                  name="phoneNumber"
                  type="tel"
                  placeholder="10-digit Phone Number"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  error={errors.phoneNumber}
                  icon={<PhoneOutlined />}
                  maxLength={10}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className={`verify-btn ${phoneVerification.verified ? 'verified' : ''}`}
                  onClick={handleSendPhoneOtp}
                  disabled={phoneVerification.loading || phoneVerification.verified}
                >
                  {phoneVerification.verified ? (
                    <>
                      <CheckCircleOutlined style={{ fontSize: '14px', marginRight: '4px' }} />
                      Verified
                    </>
                  ) : phoneVerification.loading ? (
                    'Sending...'
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>

              {/* Phone OTP Verification Input */}
              {phoneVerification.sent && !phoneVerification.verified && (
                <div className="otp-inline-box">
                  <input
                    type="text"
                    placeholder="Enter Mobile OTP"
                    className="otp-inline-input"
                    maxLength={6}
                    value={phoneVerification.otp}
                    onChange={(e) =>
                      setPhoneVerification((prev) => ({ ...prev, otp: e.target.value, error: '' }))
                    }
                  />
                  <button
                    type="button"
                    className="otp-inline-btn"
                    onClick={handleConfirmPhoneOtp}
                    disabled={phoneVerification.loading}
                  >
                    Confirm OTP
                  </button>
                  <button
                    type="button"
                    className="otp-cancel-btn otp-resend-btn"
                    onClick={handleResendPhoneOtp}
                    disabled={phoneVerification.loading || phoneVerification.resendTimer > 0}
                  >
                    {phoneVerification.resendTimer > 0
                      ? `Resend (${phoneVerification.resendTimer}s)`
                      : 'Resend OTP'}
                  </button>
                  <button
                    type="button"
                    className="otp-cancel-btn"
                    onClick={() =>
                      setPhoneVerification((prev) => ({ ...prev, sent: false, otp: '', error: '' }))
                    }
                  >
                    ✕
                  </button>
                </div>
              )}
              {phoneVerification.error && (
                <span className="field-error-msg">{phoneVerification.error}</span>
              )}
            </div>

            <FormElement
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
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
              type={showConfirmPassword ? 'text' : 'password'}
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
                By signing up, you agree to our <Link href="/terms">Terms & Conditions</Link> and{' '}
                <Link href="/privacy">Privacy Policy</Link>
              </span>
            </label>
            {errors.agreeToTerms && <span className="field-error-msg">{errors.agreeToTerms}</span>}

            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? 'Creating Account...'
                : role === 'business'
                ? 'Register as Seller'
                : 'Create Account'}
            </Button>
            <p className="auth-already">
              Already have an account?{' '}
              <Link href="/signin">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
