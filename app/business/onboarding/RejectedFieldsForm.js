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

export default function RejectedFieldsForm({ rejectedFields, initialData, reviewNotes }) {
  const router = useRouter();
  const { fetchProfile } = useSeller();
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

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
      if (rejectedFields.some(f => f.field === 'accountNumber' || f.field === 'ifscCode' || f.field === 'accountHolderName')) {
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

  return (
    <div className="onboarding-form-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="info-alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', marginBottom: '24px' }}>
        <InfoOutlined fontSize="small" style={{ color: '#ef4444' }} />
        <div>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Your application was rejected. Please correct the highlighted fields and resubmit.</strong>
          {reviewNotes && <span>Admin Note: {reviewNotes}</span>}
        </div>
      </div>

      <form className="onboarding-form" onSubmit={handleResubmit}>
        <h3 className="form-step-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '32px', fontSize: '20px', color: '#0f172a' }}>
          <InfoOutlined style={{ color: '#f59e0b' }} />
          Action Required
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {rejectedFields.map((fieldObj) => {
            const config = FIELD_UI_MAP[fieldObj.field];
            if (!config) return null; // Skip if we don't have a UI for this field

            return (
              <div className="form-field" key={fieldObj.field} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                  {config.label} <span className="required">*</span>
                </label>
                
                {config.type === 'text' || config.type === 'email' ? (
                  <input 
                    type={config.type} 
                    name={fieldObj.field} 
                    value={formData[fieldObj.field] || ''} 
                    onChange={handleFieldChange} 
                    pattern={config.pattern}
                    title={config.title}
                    required 
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', transition: 'all 0.2s', outline: 'none' }}
                  />
                ) : config.type === 'select' ? (
                  <select 
                    name={fieldObj.field} 
                    value={formData[fieldObj.field] || ''} 
                    onChange={handleFieldChange} 
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', transition: 'all 0.2s', outline: 'none', backgroundColor: '#fff' }}
                  >
                    {config.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : config.type === 'file' ? (
                  <div className="file-upload-box" style={{ marginTop: '8px', background: '#fff', border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '24px' }}>
                    <input type="file" id={fieldObj.field} name={fieldObj.field} style={{ display: 'none' }} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFieldChange} />
                    <label htmlFor={fieldObj.field} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '100%', margin: 0 }}>
                      <FileUploadOutlined className="upload-icon" style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '8px' }} />
                      <span className="upload-text" style={{ fontWeight: '500', color: '#334155' }}>
                        {formData[fieldObj.field] ? (typeof formData[fieldObj.field] === 'string' ? 'Document Uploaded' : formData[fieldObj.field].name) : 'Click to upload or drag and drop'}
                      </span>
                    </label>
                  </div>
                ) : null}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: "#ef4444", fontSize: "13px", marginTop: "12px", fontWeight: 500, backgroundColor: '#fef2f2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  <InfoOutlined style={{ fontSize: '16px' }} />
                  {fieldObj.reason}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '32px' }}>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Processing...' : 'Resubmit Application'}
          </button>
        </div>
      </form>
    </div>
  );
}
