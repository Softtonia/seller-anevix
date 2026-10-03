import React, { useState } from 'react';
import { InfoOutlined, FileUploadOutlined } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiClient from '@/api/axiosClient';
import { sellerApi } from '@/api';
import { useRouter } from 'next/navigation';
import { useSeller } from '@/contexts/SellerContext';

const FIELD_UI_MAP = {
  companyName: { label: 'Company/Business Name', type: 'text' },
  fullName: { label: 'Full Name', type: 'text' },
  mobileNumber: { label: 'Mobile Number', type: 'text', pattern: '^[0-9]{10}$', title: '10 digit mobile number' },
  emailAddress: { label: 'Email Address', type: 'email' },
  businessType: { label: 'Business Type', type: 'select', options: ['SOLE_PROPRIETORSHIP', 'LLP', 'PRIVATE_LIMITED', 'PUBLIC_LIMITED', 'OTHER'] },
  sellerType: { label: 'Seller Type', type: 'select', options: ['MANUFACTURER', 'WHOLESALER', 'RETAILER', 'DISTRIBUTOR'] },
  accountNumber: { label: 'Account Number', type: 'text', pattern: '^[0-9]{9,18}$', title: 'Between 9 and 18 digits' },
  ifscCode: { label: 'IFSC Code', type: 'text', pattern: '^[A-Za-z]{4}0[A-Za-z0-9]{6}$', title: 'Format: SBIN0001234' },
  accountHolderName: { label: 'Account Holder Name', type: 'text' },
  bankName: { label: 'Bank Name', type: 'select', options: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Fake State Bank', 'Other'] },
  panNumber: { label: 'PAN Number', type: 'text', pattern: '^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$', title: 'Format: ABCDE1234F' },
  nameOnPan: { label: 'Name on PAN', type: 'text' },
  gstinNumber: { label: 'GSTIN', type: 'text', pattern: '^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$', title: 'Format: 22AAAAA0000A1Z5' },
  tradeName: { label: 'Trade Name', type: 'text' },
  street: { label: 'Street Address', type: 'text' },
  city: { label: 'City', type: 'text' },
  state: { label: 'State', type: 'text' },
  pinCode: { label: 'PIN Code', type: 'text', pattern: '^[0-9]{6}$', title: 'Format: 123456' },
  bankDocument: { label: 'Bank Document (Cancelled Cheque/Passbook)', type: 'file' },
  bankDocumentUrl: { label: 'Bank Document (Cancelled Cheque/Passbook)', type: 'file' }
};

export default function RejectedFieldsForm({ rejectedFields, initialData, reviewNotes, currentStep, setCurrentStep }) {
  const router = useRouter();
  const { fetchProfile } = useSeller();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  // Keep formData in sync if initialData changes after mount
  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleFieldChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'bankDocument' || name === 'bankDocumentUrl') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bankDocUrl = formData.bankDocumentUrl || formData.bankDocument;
      
      // Upload if it's a new file
      if (bankDocUrl instanceof File) {
        const toastId = toast.loading("Uploading bank document...");
        const uploadData = new FormData();
        uploadData.append('thumbnail', bankDocUrl);
        try {
          const res = await apiClient.post('/upload/thumbnail', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const resData = res?.data || res;
          bankDocUrl = resData?.thumbnail || resData?.url;
          toast.success("Document uploaded successfully!", { id: toastId });
        } catch (uploadErr) {
          toast.error("Failed to upload bank document.", { id: toastId });
          setLoading(false);
          return;
        }
      }

      // Re-verify PAN if changed
      if (rejectedFields.some(f => f.field === 'panNumber' || f.field === 'nameOnPan')) {
        await sellerApi.verifyPan({
          panNumber: formData.panNumber.toUpperCase(),
          nameOnPan: formData.nameOnPan || formData.fullName,
        });
      }

      // Re-verify GSTIN if changed
      if (rejectedFields.some(f => f.field === 'gstinNumber')) {
        await sellerApi.verifyGstin({
          gstinNumber: formData.gstinNumber.toUpperCase(),
          businessName: formData.businessName || formData.companyName || 'Anevix Traders',
        });
      }

      // Re-verify Bank if changed
      if (rejectedFields.some(f => ['accountNumber', 'ifscCode', 'accountHolderName', 'bankName', 'bankDocument', 'bankDocumentUrl'].includes(f.field))) {
        await sellerApi.verifyBank({
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          accountHolderName: formData.accountHolderName,
        });
      }

      const submissionPayload = {
        personalInfo: {
          fullName: formData.fullName,
          mobile: formData.mobileNumber,
          email: formData.emailAddress,
          dateOfBirth: formData.dob || undefined,
          pan: formData.panNumber
        },
        businessInfo: {
          businessName: formData.companyName,
          businessType: formData.businessType,
          sellerType: formData.sellerType,
          gstin: formData.gstinNumber,
          businessAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.pinCode,
            country: "India"
          }
        },
        bankingInfo: {
          accountHolderName: formData.accountHolderName,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifscCode,
          ...(typeof bankDocUrl === 'string' && bankDocUrl ? { bankDocumentUrl: bankDocUrl } : {})
        }
      };

      await sellerApi.registerComplete(submissionPayload);
      await fetchProfile(); // Refresh context
      toast.success('🎉 Application resubmitted successfully! Your account is back under review.');
      router.push('/business/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Resubmission failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStepForField = (field) => {
    const step1 = ['companyName', 'fullName', 'mobileNumber', 'emailAddress', 'businessType', 'sellerType', 'street', 'city', 'state', 'pinCode'];
    const step2 = ['panNumber', 'nameOnPan'];
    const step3 = ['gstinNumber', 'businessName', 'tradeName'];
    const step4 = ['accountNumber', 'ifscCode', 'accountHolderName', 'bankName', 'bankDocument', 'bankDocumentUrl'];
    
    if (step1.includes(field)) return 1;
    if (step2.includes(field)) return 2;
    if (step3.includes(field)) return 3;
    if (step4.includes(field)) return 4;
    return 1;
  };

  const rejectedSteps = [...new Set(rejectedFields.map(f => getStepForField(f.field)))].sort();
  const currentIndex = rejectedSteps.indexOf(currentStep);
  const isLastRejectedStep = currentIndex === rejectedSteps.length - 1;
  const activeRejectedFields = rejectedFields.filter(f => getStepForField(f.field) === currentStep);

  const handleNextOrSubmit = (e) => {
    e.preventDefault();
    if (!isLastRejectedStep) {
      setCurrentStep(rejectedSteps[currentIndex + 1]);
    } else {
      handleResubmit(e);
    }
  };

  return (
    <div className="onboarding-form-card" style={{ maxWidth: '640px', margin: '0 auto', padding: '32px' }}>
      
      {/* Rejection Summary Alert */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: '8px', padding: '16px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <InfoOutlined style={{ color: '#ef4444', marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: 0, color: '#991b1b', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            Action Required: {rejectedFields.length} {rejectedFields.length === 1 ? 'field needs' : 'fields need'} correction
          </h4>
          <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px', lineHeight: '1.5' }}>
            Your application was reviewed, but some information needs to be updated before we can approve your account.
          </p>
          {reviewNotes && (
            <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#fef2f2', borderRadius: '6px', fontSize: '13px', color: '#991b1b' }}>
              <strong>Admin Note:</strong> {reviewNotes}
            </div>
          )}
        </div>
      </div>

      <form className="onboarding-form" onSubmit={handleNextOrSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {activeRejectedFields.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
              No corrections needed in this step.
            </div>
          ) : activeRejectedFields.map((fieldObj, index) => {
            const config = FIELD_UI_MAP[fieldObj.field];
            if (!config) return null; // Skip if we don't have a UI for this field

            return (
              <div className="form-field" key={fieldObj.field} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="h-step active" style={{ display: 'inline-flex', padding: 0, margin: 0, width: 'auto', flex: 'none' }}>
                      <div className="h-step-circle" style={{ margin: 0 }}>
                        {index + 1}
                      </div>
                    </div>
                    {config.label}
                  </label>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#ef4444', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                    Rejected
                  </span>
                </div>
                
                {config.type === 'text' || config.type === 'email' ? (
                  <input 
                    type={config.type} 
                    name={fieldObj.field} 
                    value={formData[fieldObj.field] || ''} 
                    onChange={handleFieldChange} 
                    pattern={config.pattern}
                    title={config.title}
                    required 
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #f87171', fontSize: '15px', outline: 'none', backgroundColor: '#fff', boxShadow: '0 0 0 1px #fee2e2' }}
                  />
                ) : config.type === 'select' ? (
                  <select 
                    name={fieldObj.field} 
                    value={formData[fieldObj.field] || ''} 
                    onChange={handleFieldChange} 
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #f87171', fontSize: '15px', outline: 'none', backgroundColor: '#fff', boxShadow: '0 0 0 1px #fee2e2' }}
                  >
                    {config.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : config.type === 'file' ? (
                  <div className="file-upload-box" style={{ background: '#fff', border: '1px dashed #f87171', borderRadius: '6px', padding: '20px', backgroundColor: '#fef2f2' }}>
                    <input type="file" id={fieldObj.field} name={fieldObj.field} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFieldChange} />
                    <label htmlFor={fieldObj.field} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', margin: 0 }}>
                      <FileUploadOutlined className="upload-icon" style={{ fontSize: '28px', color: '#ef4444', marginBottom: '8px' }} />
                      <span className="upload-text" style={{ fontWeight: '500', color: '#991b1b', fontSize: '14px' }}>
                        {formData[fieldObj.field] ? (typeof formData[fieldObj.field] === 'string' ? 'Document Uploaded (Click to replace)' : formData[fieldObj.field].name) : 'Click to upload or drag and drop'}
                      </span>
                    </label>
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: "#991b1b", fontSize: "13px", marginTop: "8px", fontWeight: 500 }}>
                  <InfoOutlined style={{ fontSize: '16px', marginTop: '1px', color: '#ef4444' }} />
                  <span style={{ lineHeight: '1.4' }}>{fieldObj.reason}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            {currentIndex > 0 && (
              <button 
                type="button" 
                className="btn-back" 
                onClick={() => setCurrentStep(rejectedSteps[currentIndex - 1])}
                style={{ flex: 1, padding: '12px 24px', fontSize: '16px', fontWeight: '600' }}
              >
                Back
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: currentIndex > 0 ? 2 : 1, padding: '12px 24px', fontSize: '16px', fontWeight: '600' }}>
              {loading ? 'Processing...' : (isLastRejectedStep ? 'Resubmit Application' : 'Next Correction')}
            </button>
          </div>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', margin: 0 }}>
            Only the highlighted details need to be corrected.
          </p>
        </div>
      </form>
    </div>
  );
}
