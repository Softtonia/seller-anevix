'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { WarningAmber, CheckCircle, Info, HighlightOff, Security } from '@mui/icons-material';
import StayUpdated from '../StayUpdated/StayUpdated';
import './LoginSecurity.css';

export default function LoginSecurity() {
  // Account Information State
  const [name, setName] = useState('Parneet Kaur');
  const [email, setEmail] = useState('abcdefg@gmail.com');
  const [mobile, setMobile] = useState('+91 9235678007');
  const [hasPasskey, setHasPasskey] = useState(true);
  const [is2FAGuardActive, setIs2FAGuardActive] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Inline Editing Form States
  const [editingField, setEditingField] = useState(null); // 'name', 'email', 'mobile', 'password'
  
  // Temp inputs
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Modal Wizard States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  
  const [showCompromisedModal, setShowCompromisedModal] = useState(false);
  const [auditStep, setAuditStep] = useState(0); // 0: Init, 1: Scan, 2: Done

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const handleEditClick = (field) => {
    setEditingField(field);
    if (field === 'name') setEditName(name);
    if (field === 'email') setEditEmail(email);
    if (field === 'mobile') setEditMobile(mobile);
    if (field === 'password') setPasswords({ current: '', new: '', confirm: '' });
  };

  const handleSaveField = (field) => {
    if (field === 'name') {
      if (!editName.trim()) {
        triggerToast('Name cannot be empty', 'error');
        return;
      }
      setName(editName);
      triggerToast('Name updated successfully', 'success');
    }
    
    if (field === 'email') {
      if (!editEmail.includes('@')) {
        triggerToast('Please enter a valid email address', 'error');
        return;
      }
      setEmail(editEmail);
      triggerToast('Email address updated successfully', 'success');
    }

    if (field === 'mobile') {
      if (editMobile.trim().length < 8) {
        triggerToast('Please enter a valid mobile number', 'error');
        return;
      }
      setMobile(editMobile);
      triggerToast('Mobile number updated successfully', 'success');
    }

    if (field === 'password') {
      if (!passwords.current || !passwords.new || !passwords.confirm) {
        triggerToast('Please fill out all password fields', 'error');
        return;
      }
      if (passwords.new !== passwords.confirm) {
        triggerToast('New passwords do not match', 'error');
        return;
      }
      triggerToast('Password changed successfully', 'success');
    }

    setEditingField(null);
  };

  // 2FA activation
  const handleToggle2FA = () => {
    if (is2FAGuardActive) {
      setIs2FAGuardActive(false);
      triggerToast('2-Step Verification deactivated', 'info');
    } else {
      setShow2FAModal(true);
      setOtpInput('');
      setOtpError('');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput === '123456' || otpInput.length === 6) {
      setIs2FAGuardActive(true);
      setShow2FAModal(false);
      triggerToast('2-Step Verification enabled successfully!', 'success');
    } else {
      setOtpError('Invalid OTP code. Please enter any 6-digit number.');
    }
  };

  // Compromised account wizard
  const runSecurityAudit = () => {
    setAuditStep(1);
    setTimeout(() => {
      setAuditStep(2);
      triggerToast('Security audit scan completed', 'success');
    }, 2000);
  };

  return (
    <>
      <div className="securityWrap">
        <div className="securityInner">
          {/* Header */}
          <header className="securityHeader">
            <h1 className='Poppins-bold'>Login & Security</h1>
          </header>

          {/* Core Security Table Panel */}
          <div className="securityCardPanel">
            
            {/* NAME ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">Name</h6>
                {editingField === 'name' ? (
                  <div className="inlineEditContainer">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="inlineInput"
                    />
                    <div className="editActions">
                      <button className="cancelActionBtn font-medium" onClick={() => setEditingField(null)}>Cancel</button>
                      <button className="saveActionBtn font-semibold" onClick={() => handleSaveField('name')}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="rowValue Poppins-regular">{name}</p>
                )}
              </div>
              {editingField !== 'name' && (
                <button className="rowPillBtn Poppins-medium" onClick={() => handleEditClick('name')}>Edit</button>
              )}
            </div>

            {/* EMAIL ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">Email</h6>
                {editingField === 'email' ? (
                  <div className="inlineEditContainer">
                    <input 
                      type="email" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="inlineInput"
                    />
                    <div className="editActions">
                      <button className="cancelActionBtn font-medium" onClick={() => setEditingField(null)}>Cancel</button>
                      <button className="saveActionBtn font-semibold" onClick={() => handleSaveField('email')}>Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="rowValue Poppins-regular">{email}</p>
                )}
              </div>
              {editingField !== 'email' && (
                <button className="rowPillBtn Poppins-medium" onClick={() => handleEditClick('email')}>Edit</button>
              )}
            </div>

            {/* MOBILE ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">Primary mobile number</h6>
                {editingField === 'mobile' ? (
                  <div className="inlineEditContainer">
                    <input 
                      type="text" 
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="inlineInput"
                    />
                    <div className="editActions">
                      <button className="cancelActionBtn font-medium" onClick={() => setEditingField(null)}>Cancel</button>
                      <button className="saveActionBtn font-semibold" onClick={() => handleSaveField('mobile')}>Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="rowValue Poppins-regular">{mobile}</p>
                    <p className="rowHelpText Poppins-regular">
                      Quickly sign in, easily recover passwords and receive security notifications with this mobile number.
                    </p>
                  </>
                )}
              </div>
              {editingField !== 'mobile' && (
                <button className="rowPillBtn Poppins-medium" onClick={() => handleEditClick('mobile')}>Edit</button>
              )}
            </div>

            {/* PASSKEY ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">Passkey</h6>
                <p className="rowHelpText Poppins-regular">
                  Sign in the same way you unlock your device by using your face, fingerprint, or PIN.
                </p>
                {hasPasskey && <span className="activeBadge badgeGreen Poppins-medium">Set Up Active</span>}
              </div>
              <div className="passkeyActionGroup">
                <button 
                  className="rowPillBtn Poppins-medium" 
                  onClick={() => {
                    setHasPasskey(true);
                    triggerToast('Passkey bound successfully', 'success');
                  }}
                >
                  Edit
                </button>
                {hasPasskey && (
                  <button 
                    className="rowPillBtn removeBtn Poppins-medium"
                    onClick={() => {
                      setHasPasskey(false);
                      triggerToast('Passkey binding removed', 'info');
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* PASSWORD ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">Password</h6>
                
                {editingField === 'password' ? (
                  <div className="passwordForm">
                    <div className="passwordFormGroup">
                      <label className="Poppins-medium">Current Password</label>
                      <input 
                        type="password" 
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="inlineInput passwordInput"
                      />
                    </div>
                    <div className="passwordFormGroup">
                      <label className="Poppins-medium">New Password</label>
                      <input 
                        type="password" 
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className="inlineInput passwordInput"
                      />
                    </div>
                    <div className="passwordFormGroup">
                      <label className="Poppins-medium">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className="inlineInput passwordInput"
                      />
                    </div>
                    <div className="editActions mt-3">
                      <button className="cancelActionBtn font-medium" onClick={() => setEditingField(null)}>Cancel</button>
                      <button className="saveActionBtn font-semibold" onClick={() => handleSaveField('password')}>Save Password</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="rowValue Poppins-regular">********</p>
                    <div className="rowAlert Poppins-regular">
                      <WarningAmber className="alertIcon" />
                      <span>To better protect your account, remove your password and use a passkey instead</span>
                    </div>
                  </>
                )}
              </div>
              {editingField !== 'password' && (
                <button className="rowPillBtn Poppins-medium" onClick={() => handleEditClick('password')}>Edit</button>
              )}
            </div>

            {/* 2-STEP VERIFICATION ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">2-Step Verification</h6>
                {is2FAGuardActive ? (
                  <div className="rowAlert successAlert Poppins-regular">
                    <CheckCircle className="alertIcon greenIcon" />
                    <span>2-Step Verification is active. Your account is secured.</span>
                  </div>
                ) : (
                  <div className="rowAlert Poppins-regular">
                    <WarningAmber className="alertIcon" />
                    <span>Require an additional layer of security when signing in</span>
                  </div>
                )}
              </div>
              <button 
                className={`rowPillBtn Poppins-medium ${is2FAGuardActive ? 'removeBtn' : ''}`}
                onClick={handleToggle2FA}
              >
                {is2FAGuardActive ? 'Turn off' : 'Turn on'}
              </button>
            </div>

            {/* COMPROMISED ACCOUNT ROW */}
            <div className="panelRow">
              <div className="rowMain">
                <h6 className="rowLabel Poppins-semibold">Compromised account?</h6>
                <p className="rowHelpText Poppins-regular">
                  Take steps like changing your password and signing out everywhere.
                </p>
              </div>
              <button className="rowPillBtn Poppins-medium" onClick={() => {
                setShowCompromisedModal(true);
                setAuditStep(0);
              }}>Start</button>
            </div>

          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />

      {/* 2FA Setup Modal */}
      {show2FAModal && (
        <div className="modalOverlay" onClick={() => setShow2FAModal(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h5 className="modalTitle Poppins-semibold">Activate 2-Step Verification</h5>
              <button className="modalCloseBtn" onClick={() => setShow2FAModal(false)}>
                <HighlightOff />
              </button>
            </div>
            <form onSubmit={handleVerifyOtp}>
              <div className="modalBody">
                <p className="Poppins-regular textCenter">
                  We have sent a verification code to your mobile number <strong>{mobile}</strong>. Enter any 6-digit code below to enable 2FA security.
                </p>
                <div className="otpFormGroup">
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    className="otpInputBox Poppins-semibold"
                    required
                  />
                  {otpError && <p className="errorText Poppins-medium">{otpError}</p>}
                </div>
              </div>
              <div className="modalFooter">
                <button type="button" className="cancelActionBtn Poppins-medium" onClick={() => setShow2FAModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="saveActionBtn Poppins-semibold">
                  Verify & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compromised Account Security Scan Modal */}
      {showCompromisedModal && (
        <div className="modalOverlay" onClick={() => setShowCompromisedModal(false)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h5 className="modalTitle Poppins-semibold">Secure Compromised Account</h5>
              <button className="modalCloseBtn" onClick={() => setShowCompromisedModal(false)}>
                <HighlightOff />
              </button>
            </div>
            <div className="modalBody textCenter">
              {auditStep === 0 && (
                <>
                  <Security style={{ fontSize: 60, color: 'var(--vermillion)', marginBottom: 16 }} />
                  <p className="Poppins-regular mb-4">
                    If you believe your account has been accessed without authorization, we will run a quick security diagnostic, revoke all active browser tokens, and enforce password resets.
                  </p>
                  <button className="scanActionBtn Poppins-semibold" onClick={runSecurityAudit}>
                    Begin Security Check
                  </button>
                </>
              )}

              {auditStep === 1 && (
                <div className="auditProgress">
                  <div className="spinner largeSpinner"></div>
                  <h6 className="Poppins-semibold mt-3">Revoking session permissions...</h6>
                  <p className="Poppins-regular textMuted">Checking for suspicious sign-ins and clearing tokens.</p>
                </div>
              )}

              {auditStep === 2 && (
                <div className="auditDone">
                  <CheckCircle style={{ fontSize: 60, color: 'var(--traditional-green)', marginBottom: 16 }} />
                  <h6 className="Poppins-semibold">Security Action Complete</h6>
                  <p className="Poppins-regular textCenter">
                    Successfully revoked 3 other browser session keys. Password reset links have been dispatched to <strong>{email}</strong>.
                  </p>
                  <button className="closeScanBtn Poppins-medium" onClick={() => {
                    setShowCompromisedModal(false);
                    handleEditClick('password'); // Direct them to change password next
                  }}>
                    Proceed to Reset Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast.show && (
        <div className={`toastContainer ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle /> : <Info />}
          <span className="toastMessage Poppins-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
