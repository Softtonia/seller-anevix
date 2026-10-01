'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowForwardOutlined,
  ArrowBackOutlined,
  CheckCircle,
  InfoOutlined,
  FileUploadOutlined,
  AssignmentTurnedInOutlined,
  PersonOutlineOutlined,
  DescriptionOutlined,
  AccountBalanceOutlined,
  CheckCircleOutlined
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { sellerApi } from '@/api';
import apiClient from '@/api/axiosClient';
import './Onboarding.css';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Profile & Business
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    dob: '',
    companyName: '',
    businessType: 'PRIVATE_LIMITED',
    sellerType: 'RETAILER',
    street: '',
    city: '',
    state: '',
    pinCode: '',

    // Step 2: PAN
    panNumber: '',
    nameOnPan: '',
    isPanVerified: false,

    // Step 3: GSTIN
    gstinNumber: '',
    businessName: '',
    isGstinVerified: false,

    // Step 4: Bank Account
    accountHolderName: '',
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: '',
    isBankPending: false,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        const user = response.data?.profile || response.data?.user || response.data;
        if (user) {
          setFormData((prev) => ({
            ...prev,
            fullName: user.name || user.firstName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : prev.fullName,
            mobileNumber: user.phoneNumber || user.mobileNumber || user.phone || prev.mobileNumber,
            emailAddress: user.email || prev.emailAddress,
          }));
        }
      } catch (err) {
        // Fallback to localStorage if API fails
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const u = JSON.parse(storedUser);
            setFormData((prev) => ({
              ...prev,
              fullName: u.name || u.firstName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : prev.fullName,
              mobileNumber: u.mobileNumber || u.phone || prev.mobileNumber,
              emailAddress: u.email || prev.emailAddress,
            }));
          }
        } catch (e) {}
      }
    };
    fetchProfile();
  }, []);

  const handleRootChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyPan = async (e) => {
    e.preventDefault();
    if (!formData.panNumber.trim() || !formData.nameOnPan.trim()) {
      toast.error('PAN Number and Name on PAN are required.');
      return;
    }
    setLoading(true);
    try {
      await sellerApi.verifyPan({
        panNumber: formData.panNumber.toUpperCase(),
        nameOnPan: formData.nameOnPan,
      });
      toast.success('PAN Verification successful!');
      setFormData(prev => ({ ...prev, isPanVerified: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'PAN Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateGstin = async (e) => {
    e.preventDefault();
    if (!formData.gstinNumber.trim()) {
      toast.error('GSTIN Number is required.');
      return;
    }
    setLoading(true);
    try {
      await sellerApi.verifyGstin({
        gstinNumber: formData.gstinNumber.toUpperCase(),
        businessName: formData.businessName || 'Anevix Traders',
      });
      toast.success('GSTIN Verification successful!');
      setFormData(prev => ({ ...prev, isGstinVerified: true }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'GSTIN Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      if (!formData.fullName.trim() || !formData.mobileNumber.trim() || !formData.emailAddress.trim() || !formData.companyName.trim() || !formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pinCode.trim()) {
        toast.error('Please fill in all required personal and business information.');
        return;
      }
      // Allow proceeding to next step
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.isPanVerified) {
        toast.error('Please verify your PAN before continuing.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.isGstinVerified) {
        toast.error('Please validate your GSTIN before continuing.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      if (!formData.accountNumber.trim() || !formData.ifscCode.trim() || !formData.accountHolderName.trim()) {
        toast.error('All bank account fields are required.');
        return;
      }
      setLoading(true);
      try {
        await sellerApi.verifyBank({
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName,
        });
        
        setFormData(prev => ({ ...prev, isBankPending: true }));
        
        try {
          localStorage.setItem('sellerOnboardingCompleted', 'true');
        } catch (e) {}
        
        toast.success('🎉 Registration submitted successfully!');
        router.push('/business/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Bank Account Verification failed.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Helper for Stepper UI
  const steps = [
    { num: 1, title: 'Profile & Business', desc: 'Complete your personal and business details' },
    { num: 2, title: 'PAN Verification', desc: 'Verify your PAN details' },
    { num: 3, title: 'GSTIN Verification', desc: 'Verify your GSTIN details' },
    { num: 4, title: 'Bank Account', desc: 'Verify your bank account details' },
  ];

  return (
    <div className="onboarding-page-container">
      {/* Top Branding (Since Sidebar is hidden) */}
      <div className="onboarding-brand-header">
        <img src="/logo.png" alt="Anevix" className="onboarding-brand-logo" onError={(e) => e.target.style.display='none'} />
        <span className="onboarding-brand-text">Anevix <span className="badge">Seller</span></span>
      </div>

      <div className="onboarding-content-wrapper">
        {/* LEFT COLUMN: Main Form */}
      <div className="onboarding-main-content">
        <div className="onboarding-header">
          <h2 className="onboarding-title">Seller Registration</h2>
          <p className="onboarding-subtitle">
            Complete your registration to start selling on Anevix. It only takes a few minutes.
          </p>
        </div>

        {/* Horizontal Stepper */}
        <div className="h-stepper">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className={`h-step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}>
                <div className={`h-step-circle ${currentStep > step.num ? 'completed-icon' : ''}`}>
                  {currentStep > step.num ? <CheckCircle fontSize="inherit" color="inherit" style={{ fontSize: '18px' }} /> : step.num}
                </div>
                <span>{step.title}</span>
              </div>
              {idx < steps.length - 1 && <div className="h-step-divider"></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="onboarding-form-card">
          <form onSubmit={handleNextStep}>
            
            {/* STEP 1: Profile & Business Information */}
            {currentStep === 1 && (
              <>
                <h3 className="form-step-title">
                  <PersonOutlineOutlined className="step-icon" /> 1. Personal Information
                </h3>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>Full Name <span className="required">*</span></label>
                    <input type="text" name="fullName" placeholder="e.g. John Doe" value={formData.fullName} onChange={handleRootChange} required />
                  </div>
                  <div className="form-field">
                    <label>Mobile Number <span className="required">*</span></label>
                    <input type="text" name="mobileNumber" placeholder="+91 98765 43210" value={formData.mobileNumber} onChange={handleRootChange} required />
                  </div>
                  <div className="form-field">
                    <label>Email Address <span className="required">*</span></label>
                    <input type="email" name="emailAddress" placeholder="you@domain.com" value={formData.emailAddress} onChange={handleRootChange} disabled required />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>Date of Birth <span className="required">(Optional)</span></label>
                    <input type="text" name="dob" placeholder="DD / MM / YYYY" value={formData.dob} onChange={handleRootChange} />
                  </div>
                </div>

                <h3 className="form-step-title" style={{ marginTop: '32px' }}>
                  <DescriptionOutlined className="step-icon" /> Business Information
                </h3>

                <div className="form-grid-3">
                  <div className="form-field" style={{ gridColumn: 'span 3' }}>
                    <label>Business Name <span className="required">*</span></label>
                    <input type="text" name="companyName" placeholder="e.g. Acme Corp" value={formData.companyName} onChange={handleRootChange} required />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Business Type <span className="required">*</span></label>
                    <select name="businessType" value={formData.businessType} onChange={handleRootChange} required>
                      <option value="PRIVATE_LIMITED">Private Limited</option>
                      <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                      <option value="PARTNERSHIP">Partnership Firm</option>
                      <option value="LLP">Limited Liability Partnership</option>
                      <option value="PUBLIC_LIMITED">Public Limited</option>
                      <option value="INDIVIDUAL">Individual / Freelancer</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Seller Type <span className="required">*</span></label>
                    <select name="sellerType" value={formData.sellerType} onChange={handleRootChange} required>
                      <option value="RETAILER">Retailer</option>
                      <option value="WHOLESALER">Wholesaler</option>
                      <option value="MANUFACTURER">Manufacturer</option>
                      <option value="DISTRIBUTOR">Distributor</option>
                      <option value="BRAND_OWNER">Brand Owner</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>Business Address <span className="required">*</span></label>
                  <input type="text" name="street" placeholder="House no., Street, Area" value={formData.street} onChange={handleRootChange} required />
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>City <span className="required">*</span></label>
                    <input type="text" name="city" placeholder="e.g. Bangalore" value={formData.city} onChange={handleRootChange} required />
                  </div>
                  <div className="form-field">
                    <label>State <span className="required">*</span></label>
                    <select name="state" value={formData.state} onChange={handleRootChange} required>
                      <option value="">Select State</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Chandigarh">Chandigarh</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>PIN Code <span className="required">*</span></label>
                    <input type="text" name="pinCode" placeholder="e.g. 560001" value={formData.pinCode} onChange={handleRootChange} required />
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: PAN Verification */}
            {currentStep === 2 && (
              <>
                <h3 className="form-step-title">
                  <DescriptionOutlined className="step-icon" /> 2. PAN Verification
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                  Enter your PAN details and verify it. This helps us ensure a safe and trusted marketplace.
                </p>

                <div className="verify-input-group">
                  <div className="form-field">
                    <label>PAN Number (Max 10 digits) <span className="required">*</span></label>
                    <input type="text" name="panNumber" placeholder="e.g. ABCDE1234F" maxLength={10} value={formData.panNumber} onChange={handleRootChange} disabled={formData.isPanVerified} required />
                  </div>
                  <div className="form-field">
                    <label>Name as per PAN <span className="required">*</span></label>
                    <input type="text" name="nameOnPan" placeholder="e.g. John Doe" value={formData.nameOnPan} onChange={handleRootChange} disabled={formData.isPanVerified} required />
                  </div>
                  {!formData.isPanVerified && (
                    <button type="button" className="btn-verify" onClick={handleVerifyPan} disabled={loading}>
                      Verify PAN
                    </button>
                  )}
                </div>

                {formData.isPanVerified && (
                  <div className="verified-card">
                    <div className="verified-card-header">
                      <CheckCircle fontSize="small" /> PAN Verified
                    </div>
                    <div className="verified-details-grid">
                      <div className="verified-detail-item">
                        <span className="label">Name</span>
                        <span className="value">{formData.nameOnPan || 'John Doe'}</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">PAN Number</span>
                        <span className="value">{formData.panNumber || 'ABCDE1234F'}</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Verification Date</span>
                        <span className="value">01 Oct 2026, 11:45 AM</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Reference ID</span>
                        <span className="value">PANV-001234</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="info-alert">
                  <InfoOutlined fontSize="small" />
                  <span>Your PAN details are secure. We use a trusted third-party KYC provider to verify your identity.</span>
                </div>
              </>
            )}

            {/* STEP 3: GSTIN Verification */}
            {currentStep === 3 && (
              <>
                <h3 className="form-step-title">
                  <DescriptionOutlined className="step-icon" /> 3. GSTIN Verification
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                  GST requirement may vary based on your business type and category. Please provide your GSTIN details.
                </p>

                <div className="requirement-alert">
                  <InfoOutlined style={{ color: '#0f172a' }} />
                  <div className="req-content">
                    <h4>GST Requirement <span className="req-badge">Required</span></h4>
                    <p>Your selected business type and category require GSTIN.</p>
                  </div>
                </div>

                <div className="verify-input-group" style={{ marginBottom: '24px', maxWidth: '600px' }}>
                  <div className="form-field">
                    <label>GSTIN <span className="required">*</span></label>
                    <input type="text" name="gstinNumber" placeholder="e.g. 22AAAAA0000A1Z5" value={formData.gstinNumber} onChange={handleRootChange} disabled={formData.isGstinVerified} required />
                  </div>
                  {!formData.isGstinVerified && (
                    <button type="button" className="btn-verify" onClick={handleValidateGstin} disabled={loading}>
                      Validate GSTIN
                    </button>
                  )}
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label>Legal Business Name <span className="required">*</span></label>
                    <input type="text" placeholder="e.g. Anevix Traders" value="Anevix Traders" disabled />
                  </div>
                  <div className="form-field">
                    <label>Trade Name <span className="required">(Optional)</span></label>
                    <input type="text" placeholder="e.g. Anevix" value="Anevix" disabled />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>Registration Status <span className="required">*</span></label>
                    <select disabled><option>Active</option></select>
                  </div>
                  <div className="form-field">
                    <label>State <span className="required">*</span></label>
                    <select disabled><option>Karnataka</option></select>
                  </div>
                  <div className="form-field">
                    <label>Registration Date</label>
                    <input type="text" placeholder="DD / MM / YYYY" value="01 / 10 / 2024" disabled />
                  </div>
                </div>

                {formData.isGstinVerified && (
                  <div className="verified-card">
                    <div className="verified-card-header">
                      <CheckCircle fontSize="small" /> GSTIN Verified
                    </div>
                    <div className="verified-details-grid">
                      <div className="verified-detail-item">
                        <span className="label">Legal Name</span>
                        <span className="value">Anevix Traders</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Trade Name</span>
                        <span className="value">Anevix</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">State</span>
                        <span className="value">Karnataka</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Status</span>
                        <span className="value" style={{ color: '#16a34a' }}>Active</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Ref ID</span>
                        <span className="value">GSTV-001234</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STEP 4: Bank Account */}
            {currentStep === 4 && (
              <>
                <h3 className="form-step-title">
                  <AccountBalanceOutlined className="step-icon" /> Bank Account Verification
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
                  Your bank account must be verified before you can withdraw your marketplace earnings.
                </p>

                <div className="form-grid-3">
                  <div className="form-field">
                    <label>Account Holder Name <span className="required">*</span></label>
                    <input type="text" name="accountHolderName" placeholder="e.g. John Doe" value={formData.accountHolderName} onChange={handleRootChange} required />
                  </div>
                  <div className="form-field">
                    <label>Bank Name <span className="required">*</span></label>
                    <select name="bankName" value={formData.bankName} onChange={handleRootChange}>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Account Number <span className="required">*</span></label>
                    <input type="text" name="accountNumber" placeholder="e.g. 123456789012" value={formData.accountNumber} onChange={handleRootChange} required />
                  </div>
                </div>

                <div className="form-grid-2" style={{ gridTemplateColumns: '1fr 2fr' }}>
                  <div className="form-field">
                    <label>IFSC <span className="required">*</span></label>
                    <input type="text" name="ifscCode" placeholder="e.g. SBIN0001234" value={formData.ifscCode} onChange={handleRootChange} required />
                  </div>
                  <div className="form-field">
                    <label>Cancelled Cheque / Bank Document <span className="required">*</span></label>
                    <div className="file-upload-box">
                      <FileUploadOutlined className="upload-icon" />
                      <span className="upload-text">Click to upload or drag and drop</span>
                      <span className="upload-subtext">PDF, JPG, PNG (Max 5MB)</span>
                    </div>
                  </div>
                </div>

                {formData.isBankPending && (
                  <div className="verified-card pending">
                    <div className="verified-card-header">
                      <DescriptionOutlined fontSize="small" /> Bank Account: Pending
                    </div>
                    <div className="verified-details-grid">
                      <div className="verified-detail-item">
                        <span className="label">Account Holder</span>
                        <span className="value">{formData.accountHolderName}</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Bank Name</span>
                        <span className="value">{formData.bankName}</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Account Number</span>
                        <span className="value">*******{formData.accountNumber.slice(-4)}</span>
                      </div>
                      <div className="verified-detail-item">
                        <span className="label">Verification Date</span>
                        <span className="value">-</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="info-alert warning">
                  <InfoOutlined fontSize="small" />
                  <span>Payouts will be enabled after your bank account is verified.</span>
                </div>
              </>
            )}

            <div className="form-actions">
              {currentStep > 1 ? (
                <button type="button" className="btn-back" onClick={handlePrevStep}>
                  <ArrowBackOutlined fontSize="small" /> Back
                </button>
              ) : (
                <div></div>
              )}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Processing...' : (currentStep === 4 ? 'Submit Registration' : 'Save & Continue')}
                {currentStep < 4 && <ArrowForwardOutlined fontSize="small" />}
              </button>
            </div>
            
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Sidebar Progress */}
      <div className="onboarding-sidebar">
        <div className="progress-sidebar-card">
          <h3>
            <AssignmentTurnedInOutlined style={{ color: '#ff6a00' }} />
            Registration Progress
          </h3>
          <div className="v-stepper">
            {steps.map((step, idx) => {
              const isCompleted = currentStep > step.num;
              const isActive = currentStep === step.num;
              return (
                <div key={step.num} className={`v-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  {idx < steps.length - 1 && <div className="v-step-line"></div>}
                  <div className="v-step-circle">
                    {isCompleted ? <CheckCircle fontSize="inherit" /> : step.num}
                  </div>
                  <div className="v-step-content">
                    <div className="v-step-title">
                      {step.title}
                      {isCompleted && <CheckCircleOutlined className="status-icon" fontSize="small" />}
                    </div>
                    <div className="v-step-desc">
                      {step.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
