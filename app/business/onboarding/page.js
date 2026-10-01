'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowForwardOutlined,
  ArrowBackOutlined,
  CheckCircle,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { sellerApi } from '@/api';
import './Onboarding.css';

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(false);

  // Form State matching the {{live}}/seller/onboarding/step1 contract
  const [formData, setFormData] = useState({
    // Step 1 Fields
    companyName: '',
    businessType: 'PRIVATE_LIMITED',
    sellerType: 'RETAILER',

    businessAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },

    residentialAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },

    // Step 2 & 3 state (for future steps)
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  // Prepopulate company name if user is stored in localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.firstName || u.name) {
          setFormData((prev) => ({
            ...prev,
            companyName: prev.companyName || `${u.firstName || u.name}'s Enterprise`,
          }));
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleRootChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBusinessAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedBusiness = { ...prev.businessAddress, [name]: value };
      return {
        ...prev,
        businessAddress: updatedBusiness,
        ...(sameAsBusinessAddress ? { residentialAddress: { ...updatedBusiness } } : {}),
      };
    });
  };

  const handleResidentialAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      residentialAddress: {
        ...prev.residentialAddress,
        [name]: value,
      },
    }));
  };

  const handleSameAddressToggle = (e) => {
    const isChecked = e.target.checked;
    setSameAsBusinessAddress(isChecked);
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        residentialAddress: { ...prev.businessAddress },
      }));
    }
  };

  const handleSubmitStep1 = async () => {
    // Validate Step 1
    if (!formData.companyName.trim()) {
      toast.error('Company name is required.');
      return;
    }
    if (!formData.businessAddress.street.trim()) {
      toast.error('Business street address is required.');
      return;
    }
    if (!formData.businessAddress.city.trim() || !formData.businessAddress.state.trim()) {
      toast.error('Business city and state are required.');
      return;
    }
    if (!formData.businessAddress.zipCode.trim()) {
      toast.error('Business ZIP/PIN code is required.');
      return;
    }

    if (!formData.residentialAddress.street.trim()) {
      toast.error('Residential street address is required.');
      return;
    }
    if (!formData.residentialAddress.city.trim() || !formData.residentialAddress.state.trim()) {
      toast.error('Residential city and state are required.');
      return;
    }
    if (!formData.residentialAddress.zipCode.trim()) {
      toast.error('Residential ZIP/PIN code is required.');
      return;
    }

    // Exact Payload formatting as specified:
    const payload = {
      companyName: formData.companyName,
      businessType: formData.businessType,
      sellerType: formData.sellerType,
      businessAddress: {
        street: formData.businessAddress.street,
        city: formData.businessAddress.city,
        state: formData.businessAddress.state.toUpperCase(),
        zipCode: formData.businessAddress.zipCode,
        country: formData.businessAddress.country || 'India',
      },
      residentialAddress: {
        street: formData.residentialAddress.street,
        city: formData.residentialAddress.city,
        state: formData.residentialAddress.state.toUpperCase(),
        zipCode: formData.residentialAddress.zipCode,
        country: formData.residentialAddress.country || 'India',
      },
    };

    setLoading(true);
    try {
      const res = await sellerApi.submitStep1(payload);
      toast.success(res.data?.message || 'Step 1: Profile & addresses completed successfully!');
      // Move to step 2
      setCurrentStep(2);
    } catch (err) {
      const msg = err.message || 'Failed to submit onboarding step 1. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();

    if (currentStep === 1) {
      handleSubmitStep1();
    } else if (currentStep === 2) {
      toast.success('Pickup preferences saved! Proceeding to bank details.');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.accountNumber.trim()) {
        toast.error('Bank account number is required.');
        return;
      }
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        toast.error('Bank account numbers do not match.');
        return;
      }
      if (!formData.ifscCode.trim()) {
        toast.error('IFSC code is required.');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        try {
          localStorage.setItem('sellerOnboardingCompleted', 'true');
        } catch (e) {}
        toast.success('🎉 Congratulations! Store onboarding completed successfully.');
        router.push('/business/dashboard');
      }, 1000);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="onboarding-container">
      {/* Header */}
      <div className="onboarding-header">
        <div>
          <h2 className="onboarding-title">Seller Onboarding</h2>
          <p className="onboarding-subtitle">
            Complete your store registration to start listing and selling on Anevix.
          </p>
        </div>
        <div className="onboarding-badge">Step {currentStep} of 3</div>
      </div>

      {/* Stepper Bar */}
      <div className="onboarding-stepper">
        <div
          className={`step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}
          onClick={() => setCurrentStep(1)}
        >
          <div className="step-circle">
            {currentStep > 1 ? '✓' : '1'}
          </div>
          <div className="step-info">
            <span className="step-number">Step 1</span>
            <span className="step-name">Complete Your Profile</span>
          </div>
        </div>

        <div className={`step-divider ${currentStep > 1 ? 'completed' : ''}`}></div>

        <div
          className={`step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}
          onClick={() => currentStep > 1 && setCurrentStep(2)}
        >
          <div className="step-circle">
            {currentStep > 2 ? '✓' : '2'}
          </div>
          <div className="step-info">
            <span className="step-number">Step 2</span>
            <span className="step-name">Shipping & Logistics</span>
          </div>
        </div>

        <div className={`step-divider ${currentStep > 2 ? 'completed' : ''}`}></div>

        <div
          className={`step-item ${currentStep === 3 ? 'active' : ''}`}
          onClick={() => currentStep > 2 && setCurrentStep(3)}
        >
          <div className="step-circle">3</div>
          <div className="step-info">
            <span className="step-number">Step 3</span>
            <span className="step-name">Bank & Payout Details</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="onboarding-card">
        <form onSubmit={handleNextStep} className="onboarding-form">
          {/* STEP 1: Complete Your Profile (with API Integration) */}
          {currentStep === 1 && (
            <>
              <div className="card-step-header">
                <h3>Step 1: Complete Your Profile & Addresses</h3>
                <p>Provide your company details, business address, and residential address.</p>
              </div>

              {/* Company & Business / Seller Type */}
              <div className="form-field-group">
                <label>Company / Store Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. Acme Corp"
                  value={formData.companyName}
                  onChange={handleRootChange}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label>Business Type <span className="required">*</span></label>
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleRootChange}
                  >
                    <option value="PRIVATE_LIMITED">Private Limited (PRIVATE_LIMITED)</option>
                    <option value="PROPRIETORSHIP">Sole Proprietorship (PROPRIETORSHIP)</option>
                    <option value="PARTNERSHIP">Partnership Firm (PARTNERSHIP)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PUBLIC_LIMITED">Public Limited (PUBLIC_LIMITED)</option>
                    <option value="INDIVIDUAL">Individual / Freelancer (INDIVIDUAL)</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Seller Type <span className="required">*</span></label>
                  <select
                    name="sellerType"
                    value={formData.sellerType}
                    onChange={handleRootChange}
                  >
                    <option value="RETAILER">Retailer (RETAILER)</option>
                    <option value="WHOLESALER">Wholesaler (WHOLESALER)</option>
                    <option value="MANUFACTURER">Manufacturer (MANUFACTURER)</option>
                    <option value="DISTRIBUTOR">Distributor (DISTRIBUTOR)</option>
                    <option value="BRAND_OWNER">Brand Owner (BRAND_OWNER)</option>
                  </select>
                </div>
              </div>

              {/* Business Address Section */}
              <div className="form-section-title">
                <span>Business Address</span>
              </div>

              <div className="form-field-group">
                <label>Street Address <span className="required">*</span></label>
                <input
                  type="text"
                  name="street"
                  placeholder="e.g. 123 Tech Park"
                  value={formData.businessAddress.street}
                  onChange={handleBusinessAddressChange}
                  required
                />
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Bangalore"
                    value={formData.businessAddress.city}
                    onChange={handleBusinessAddressChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. KARNATAKA"
                    value={formData.businessAddress.state}
                    onChange={handleBusinessAddressChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>ZIP / PIN Code <span className="required">*</span></label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="e.g. 560001"
                    maxLength={10}
                    value={formData.businessAddress.zipCode}
                    onChange={handleBusinessAddressChange}
                    required
                  />
                </div>
              </div>

              {/* Residential Address Section */}
              <div className="form-section-title">
                <span>Residential Address</span>
                <label className="same-address-toggle">
                  <input
                    type="checkbox"
                    checked={sameAsBusinessAddress}
                    onChange={handleSameAddressToggle}
                  />
                  Same as Business Address
                </label>
              </div>

              <div className="form-field-group">
                <label>Street Address <span className="required">*</span></label>
                <input
                  type="text"
                  name="street"
                  placeholder="e.g. 456 Home St"
                  value={formData.residentialAddress.street}
                  onChange={handleResidentialAddressChange}
                  disabled={sameAsBusinessAddress}
                  required
                />
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label>City <span className="required">*</span></label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Bangalore"
                    value={formData.residentialAddress.city}
                    onChange={handleResidentialAddressChange}
                    disabled={sameAsBusinessAddress}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>State <span className="required">*</span></label>
                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. KARNATAKA"
                    value={formData.residentialAddress.state}
                    onChange={handleResidentialAddressChange}
                    disabled={sameAsBusinessAddress}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>ZIP / PIN Code <span className="required">*</span></label>
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="e.g. 560002"
                    maxLength={10}
                    value={formData.residentialAddress.zipCode}
                    onChange={handleResidentialAddressChange}
                    disabled={sameAsBusinessAddress}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Shipping & Logistics Preferences */}
          {currentStep === 2 && (
            <>
              <div className="card-step-header">
                <h3>Step 2: Shipping & Courier Preferences</h3>
                <p>Configure how parcels are packed, dispatched, and picked up from your business location.</p>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label>Dispatch Lead Time</label>
                  <select defaultValue="1_DAY">
                    <option value="SAME_DAY">Same Day Dispatch</option>
                    <option value="1_DAY">1 Business Day</option>
                    <option value="2_DAYS">2 Business Days</option>
                    <option value="3_DAYS">3 Business Days</option>
                  </select>
                </div>

                <div className="form-field-group">
                  <label>Primary Courier Partner</label>
                  <select defaultValue="ANEVIX_LOGISTICS">
                    <option value="ANEVIX_LOGISTICS">Anevix Express Logistics (Recommended)</option>
                    <option value="SELF_SHIP">Self-Ship / Merchant Delivery</option>
                  </select>
                </div>
              </div>

              <div className="form-field-group">
                <label>Pickup Location Verified</label>
                <input
                  type="text"
                  disabled
                  value={`${formData.businessAddress.street}, ${formData.businessAddress.city}, ${formData.businessAddress.state} - ${formData.businessAddress.zipCode}`}
                />
              </div>
            </>
          )}

          {/* STEP 3: Bank & Payout Details */}
          {currentStep === 3 && (
            <>
              <div className="card-step-header">
                <h3>Step 3: Bank Account for Seller Payouts</h3>
                <p>Provide verified bank details to receive scheduled sales disbursements and settlements.</p>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label>Bank Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="bankName"
                    placeholder="e.g. HDFC Bank / ICICI / SBI"
                    value={formData.bankName}
                    onChange={handleRootChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Account Holder Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="accountHolderName"
                    placeholder="Name as printed in passbook / cheque"
                    value={formData.accountHolderName}
                    onChange={handleRootChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label>Bank Account Number <span className="required">*</span></label>
                  <input
                    type="password"
                    name="accountNumber"
                    placeholder="Enter Account Number"
                    value={formData.accountNumber}
                    onChange={handleRootChange}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Confirm Account Number <span className="required">*</span></label>
                  <input
                    type="text"
                    name="confirmAccountNumber"
                    placeholder="Re-enter Account Number"
                    value={formData.confirmAccountNumber}
                    onChange={handleRootChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Bank IFSC Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  required
                />
              </div>
            </>
          )}

          {/* Form Action Bar */}
          <div className="form-action-bar">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={handlePrevStep}
              >
                <ArrowBackOutlined fontSize="small" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                Back
              </button>
            ) : (
              <div></div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Submitting...'
                : currentStep === 3
                ? 'Complete Onboarding & Launch'
                : (
                  <>
                    Save & Continue
                    <ArrowForwardOutlined fontSize="small" />
                  </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
