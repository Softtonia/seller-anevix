'use client';
import React, { useState } from 'react';
import { useSeller } from '@/contexts/SellerContext';
import { 
  ArrowBackOutlined,
  CheckCircle,
  PhoneOutlined,
  EmailOutlined,
  PersonOutlineOutlined,
  BusinessOutlined,
  HomeOutlined,
  VerifiedUserOutlined,
  ErrorOutlineOutlined,
  AssignmentTurnedInOutlined,
  SecurityOutlined,
  AccountBalanceOutlined,
  DescriptionOutlined,
  EditOutlined,
  ArrowForwardOutlined,
  CheckOutlined,
  CloseOutlined
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { uploadService } from '@/api/services/upload.service';
import apiClient from '@/api/axiosClient';
import { PhotoCamera } from '@mui/icons-material';
import './Profile.css';

export default function SellerProfilePage() {
  const { sellerProfile } = useSeller();
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [editingSection, setEditingSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);


  
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return dateString;
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };


  if (!sellerProfile) {
    return (
      <div className="profile-loading-container">
        <div className="profile-spinner"></div>
        <p>Loading Profile...</p>
      </div>
    );
  }

  const pi = sellerProfile.b2cProfile?.personalInfo || sellerProfile.personalInfo || {};
  const bi = sellerProfile.b2cProfile?.businessInfo || sellerProfile.businessInfo || {};
  const ba = bi.businessAddress || sellerProfile.businessAddress || {};
  const bki = sellerProfile.b2cProfile?.bankingInfo || sellerProfile.bankingInfo || {};

  const name = pi.fullName || sellerProfile.name || 'Seller Partner';
  const email = pi.email || sellerProfile.email || 'Not Provided';
  const mobile = pi.mobile || sellerProfile.phoneNumber || 'Not Provided';
  const status = sellerProfile.status || sellerProfile.onboardingStatus;
  const sellerId = sellerProfile.sellerId || 'Pending';
  const sellerType = bi.sellerType || sellerProfile.sellerType || 'Retailer';
  const companyName = bi.businessName || sellerProfile.companyName || 'Not Provided';

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setPreviewImage(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadRes = await uploadService.uploadThumbnail(formData);
      if (uploadRes?.data?.url || uploadRes?.data?.imageUrl) {
        const imgUrl = uploadRes.data.url || uploadRes.data.imageUrl;
        await apiClient.put('/business/onboarding/profile', { profileImage: imgUrl });
      }
    } catch (err) {
      console.error('Failed to upload image', err);
    } finally {
      setIsUploading(false);
    }
  };

  const startEditing = (section, initialData) => {
    setEditingSection(section);
    setEditFormData(initialData);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditFormData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveEditing = async () => {
    setIsSaving(true);
    try {
      let payload = {};

      if (editingSection === 'basic') {
        payload = {
          personalInfo: {
            fullName: editFormData.fullName,
            mobile: editFormData.mobile,
            email: editFormData.email,
            dateOfBirth: editFormData.dateOfBirth
          }
        };
      } else if (editingSection === 'businessAddress') {
        payload = {
          businessInfo: {
            businessAddress: {
              street: editFormData.street,
              city: editFormData.city,
              state: editFormData.state,
              zipCode: editFormData.zipCode,
              country: editFormData.country || 'India'
            }
          }
        };
      } else if (editingSection === 'businessDetails') {
        payload = {
          businessInfo: {
            businessName: editFormData.businessName,
            businessType: editFormData.businessType,
            sellerType: editFormData.sellerType
          }
        };
      } else if (editingSection === 'banking') {
        payload = {
          bankingInfo: {
            accountHolderName: editFormData.accountHolderName,
            bankName: editFormData.bankName,
            accountNumber: editFormData.accountNumber,
            ifsc: editFormData.ifsc
          }
        };
      }

      await apiClient.put('/business/onboarding/profile', payload);
      window.location.reload();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (statusStr) => {
    switch(statusStr) {
      case 'ACTIVE':
      case 'APPROVED':
        return <span className="status-badge success">Approved</span>;
      case 'REJECTED':
        return <span className="status-badge error">Action Required</span>;
      case 'UNDER_REVIEW':
        return <span className="status-badge warning">Under Review</span>;
      default:
        return <span className="status-badge neutral">{statusStr || 'Draft'}</span>;
    }
  };

  const getAccountStatusCard = () => {
    if (status === 'ACTIVE' || status === 'APPROVED') {
      return (
        <div className="status-card success">
          <div className="status-card-icon"><CheckCircle /></div>
          <div className="status-card-text">
            <h4>Approved</h4>
            <p>Your seller account is active and fully verified.</p>
          </div>
        </div>
      );
    }
    if (status === 'REJECTED') {
      return (
        <div className="status-card error">
          <div className="status-card-icon"><ErrorOutlineOutlined /></div>
          <div className="status-card-text">
            <h4>Action Required</h4>
            <p>Your application requires corrections. Please review.</p>
          </div>
        </div>
      );
    }
    return (
      <div className="status-card warning">
        <div className="status-card-icon"><AssignmentTurnedInOutlined /></div>
        <div className="status-card-text">
          <h4>Under Review</h4>
          <p>Your application is currently being reviewed by our team.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="seller-profile-page">
      <div className="profile-top-nav">
        <button className="btn-back-text" onClick={() => router.back()}>
          <ArrowBackOutlined fontSize="small" /> Back to Dashboard
        </button>
      </div>

      <div className="profile-header-card">
        <div className="profile-header-left">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {previewImage || sellerProfile.profileImage ? (
                <><img src={previewImage || sellerProfile.profileImage} alt="Profile" className="profile-img-element" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div style={{display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center'}}>{name.charAt(0).toUpperCase()}{name.split(' ')[1] ? name.split(' ')[1].charAt(0).toUpperCase() : ''}</div></>
              ) : (
                <>{name.charAt(0).toUpperCase()}{name.split(' ')[1] ? name.split(' ')[1].charAt(0).toUpperCase() : ''}</>
              )}
            </div>
            <label className="avatar-edit-button">
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} disabled={isUploading} />
              <PhotoCamera fontSize="small" />
            </label>
          </div>
          <div className="profile-header-main">
            <div className="profile-header-title-row">
              <h1>{name}</h1>
              {getStatusBadge(status)}
            </div>
            <div className="profile-header-meta">
              <span>{sellerId}</span>
              <span className="divider">|</span>
              <span>{sellerType}</span>
              <span className="divider">|</span>
              <span>{companyName}</span>
            </div>
            <div className="profile-header-contact">
              <span className="contact-item"><PhoneOutlined fontSize="small" /> +91 {mobile.replace('+91', '').trim()}</span>
              <span className="contact-item"><EmailOutlined fontSize="small" /> {email}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="profile-content-grid">
        {/* LEFT COLUMN */}
        <div className="profile-col-left">
          
          {/* Basic Information */}
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="header-title-with-icon">
                <PersonOutlineOutlined className="header-icon orange" />
                <h3>Basic Information</h3>
              </div>
              {editingSection === 'basic' ? (
                <div className="inline-edit-actions">
                  <button className="btn-save-inline" onClick={saveEditing} disabled={isSaving}><CheckOutlined fontSize="small" /> {isSaving ? 'Saving' : 'Save'}</button>
                  <button className="btn-cancel-inline" onClick={cancelEditing} disabled={isSaving}><CloseOutlined fontSize="small" /> Cancel</button>
                </div>
              ) : (
                <button className="btn-edit-small" onClick={() => startEditing('basic', { fullName: name, mobile: mobile.replace('+91', '').trim(), email: email, dateOfBirth: formatDateForInput(sellerProfile.dateOfBirth) })}><EditOutlined fontSize="inherit"/> Edit</button>
              )}
            </div>
            <div className="detail-grid-4">
              <div className="detail-group">
                <label>Full Name</label>
                {editingSection === 'basic' ? <input type="text" className="inline-input" name="fullName" value={editFormData.fullName || ''} onChange={handleEditChange} /> : <span>{name}</span>}
              </div>
              <div className="detail-group">
                <label>Mobile Number</label>
                {editingSection === 'basic' ? <input type="text" className="inline-input" name="mobile" value={editFormData.mobile || ''} onChange={handleEditChange} /> : <span>+91 {mobile.replace('+91', '').trim()}</span>}
              </div>
              <div className="detail-group">
                <label>Email Address</label>
                {editingSection === 'basic' ? <input type="email" className="inline-input" name="email" value={editFormData.email || ''} onChange={handleEditChange} /> : <span>{email}</span>}
              </div>
              <div className="detail-group">
                <label>Date of Birth</label>
                {editingSection === 'basic' ? <input type="date" className="inline-input" name="dateOfBirth" value={editFormData.dateOfBirth || ''} onChange={handleEditChange} /> : <span className="muted"><PersonOutlineOutlined fontSize="inherit" style={{verticalAlign: 'middle', marginRight: '4px'}} /> {formatDateForDisplay(sellerProfile.dateOfBirth) || 'Not Provided'}</span>}
              </div>
            </div>
            <div className="detail-grid-4 mt-24">
              <div className="detail-group">
                <label>PAN Number</label>
                <span className="verified-text">{pi.pan || sellerProfile.panDetails?.panNumber || 'Not Verified'} <span className="verify-badge"><CheckCircle fontSize="inherit" /> Verified</span></span>
              </div>
              <div className="detail-group">
                <label>Seller ID</label>
                <span>{sellerId}</span>
              </div>
              <div className="detail-group">
                <label>Seller Type</label>
                <span>{sellerType}</span>
              </div>
              <div className="detail-group">
                <label>Business Type</label>
                <span>{(bi.businessType || sellerProfile.businessType || '').replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Addresses Row */}
          <div className="address-cards-row">
            <div className="detail-card address-card">
              <div className="detail-card-header">
                <div className="header-title-with-icon">
                  <BusinessOutlined className="header-icon orange" />
                  <h3>Business Address</h3>
                </div>
                {editingSection === 'businessAddress' ? (
                  <div className="inline-edit-actions">
                    <button className="btn-save-inline" onClick={saveEditing} disabled={isSaving}><CheckOutlined fontSize="small" /> Save</button>
                    <button className="btn-cancel-inline" onClick={cancelEditing} disabled={isSaving}><CloseOutlined fontSize="small" /> Cancel</button>
                  </div>
                ) : (
                  <button className="btn-edit-small" onClick={() => startEditing('businessAddress', { ...ba })}><EditOutlined fontSize="inherit"/> Edit</button>
                )}
              </div>
              <div className="detail-grid-1">
                <div className="detail-group">
                  <label>Street</label>
                  {editingSection === 'businessAddress' ? <input type="text" className="inline-input full-width" name="street" value={editFormData.street || ''} onChange={handleEditChange} /> : <span>{ba.street || 'Not Provided'}</span>}
                </div>
                <div className="detail-group mt-16">
                  <label>City</label>
                  {editingSection === 'businessAddress' ? <input type="text" className="inline-input full-width" name="city" value={editFormData.city || ''} onChange={handleEditChange} /> : <span>{ba.city || 'Not Provided'}</span>}
                </div>
              </div>
              <div className="detail-grid-2 mt-16">
                <div className="detail-group">
                  <label>State</label>
                  {editingSection === 'businessAddress' ? <input type="text" className="inline-input full-width" name="state" value={editFormData.state || ''} onChange={handleEditChange} /> : <span>{ba.state || 'Not Provided'}</span>}
                </div>
                <div className="detail-group">
                  <label>Zip Code</label>
                  {editingSection === 'businessAddress' ? <input type="text" className="inline-input full-width" name="zipCode" value={editFormData.zipCode || ''} onChange={handleEditChange} /> : <span>{ba.zipCode || 'Not Provided'}</span>}
                </div>
              </div>
              <div className="detail-grid-1 mt-16">
                <div className="detail-group">
                  <label>Country</label>
                  {editingSection === 'businessAddress' ? <input type="text" className="inline-input full-width" name="country" value={editFormData.country || 'India'} onChange={handleEditChange} /> : <span>{ba.country || 'India'}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="header-title-with-icon">
                <BusinessOutlined className="header-icon orange" />
                <h3>Business Details</h3>
              </div>
              {editingSection === 'businessDetails' ? (
                <div className="inline-edit-actions">
                  <button className="btn-save-inline" onClick={saveEditing} disabled={isSaving}><CheckOutlined fontSize="small" /> Save</button>
                  <button className="btn-cancel-inline" onClick={cancelEditing} disabled={isSaving}><CloseOutlined fontSize="small" /> Cancel</button>
                </div>
              ) : (
                <button className="btn-edit-small" onClick={() => startEditing('businessDetails', { businessName: companyName, businessType: (bi.businessType || sellerProfile.businessType), sellerType: sellerType })}><EditOutlined fontSize="inherit"/> Edit</button>
              )}
            </div>
            <div className="detail-grid-2">
              <div className="detail-group">
                <label>Company / Store Name</label>
                {editingSection === 'businessDetails' ? <input type="text" className="inline-input full-width" name="businessName" value={editFormData.businessName || ''} onChange={handleEditChange} /> : <span>{companyName}</span>}
              </div>
              <div className="detail-group">
                <label>Categories</label>
                <span className="muted">Not Selected</span>
              </div>
            </div>
            <div className="detail-grid-2 mt-24">
              <div className="detail-group">
                <label>Business Type</label>
                {editingSection === 'businessDetails' ? (
                  <select className="inline-select full-width" name="businessType" value={editFormData.businessType || ''} onChange={handleEditChange}>
                    <option value="Sole_Proprietorship">Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Private_Limited">Private Limited</option>
                    <option value="Public_Limited">Public Limited</option>
                    <option value="LLP">LLP</option>
                  </select>
                ) : <span>{(bi.businessType || sellerProfile.businessType || '').replace('_', ' ')}</span>}
              </div>
              <div className="detail-group">
                <label>Brands</label>
                <span className="muted">Not Selected</span>
              </div>
            </div>
            <div className="detail-grid-2 mt-24">
              <div className="detail-group">
                <label>Seller Type</label>
                {editingSection === 'businessDetails' ? (
                  <select className="inline-select full-width" name="sellerType" value={editFormData.sellerType || ''} onChange={handleEditChange}>
                    <option value="Manufacturer">Manufacturer</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                ) : <span>{sellerType}</span>}
              </div>
            </div>
          </div>

        </div>


          {/* Banking Information */}
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="header-title-with-icon">
                <AccountBalanceOutlined className="header-icon orange" />
                <h3>Banking Information</h3>
              </div>
              {editingSection === 'banking' ? (
                <div className="inline-edit-actions">
                  <button className="btn-save-inline" onClick={saveEditing} disabled={isSaving}><CheckOutlined fontSize="small" /> Save</button>
                  <button className="btn-cancel-inline" onClick={cancelEditing} disabled={isSaving}><CloseOutlined fontSize="small" /> Cancel</button>
                </div>
              ) : (
                <button className="btn-edit-small" onClick={() => startEditing('banking', { accountHolderName: bki.accountHolderName || sellerProfile.bankDetails?.accountHolderName, bankName: bki.bankName || sellerProfile.bankDetails?.bankName, accountNumber: bki.accountNumber || sellerProfile.bankDetails?.accountNumber, ifsc: bki.ifsc || sellerProfile.bankDetails?.ifscCode })}><EditOutlined fontSize="inherit"/> Edit</button>
              )}
            </div>
            <div className="detail-grid-2">
              <div className="detail-group">
                <label>Account Holder Name</label>
                {editingSection === 'banking' ? <input type="text" className="inline-input full-width" name="accountHolderName" value={editFormData.accountHolderName || ''} onChange={handleEditChange} /> : <span>{bki.accountHolderName || sellerProfile.bankDetails?.accountHolderName || 'Not Provided'}</span>}
              </div>
              <div className="detail-group">
                <label>Bank Name</label>
                {editingSection === 'banking' ? <input type="text" className="inline-input full-width" name="bankName" value={editFormData.bankName || ''} onChange={handleEditChange} /> : <span>{bki.bankName || sellerProfile.bankDetails?.bankName || 'Not Provided'}</span>}
              </div>
            </div>
            <div className="detail-grid-2 mt-24">
              <div className="detail-group">
                <label>Account Number</label>
                {editingSection === 'banking' ? <input type="text" className="inline-input full-width" name="accountNumber" value={editFormData.accountNumber || ''} onChange={handleEditChange} /> : <span>{bki.accountNumber || sellerProfile.bankDetails?.accountNumber || 'Not Provided'}</span>}
              </div>
              <div className="detail-group">
                <label>IFSC Code</label>
                {editingSection === 'banking' ? <input type="text" className="inline-input full-width" name="ifsc" value={editFormData.ifsc || ''} onChange={handleEditChange} /> : <span>{bki.ifsc || sellerProfile.bankDetails?.ifscCode || 'Not Provided'}</span>}
              </div>
            </div>
          </div>

        {/* MIDDLE COLUMN */}
        <div className="profile-col-middle">
          
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="header-title-with-icon">
                <SecurityOutlined className="header-icon green" />
                <h3>Account Status</h3>
              </div>
            </div>
            {getAccountStatusCard()}
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <h3>Onboarding Progress</h3>
              <span style={{fontWeight: 'bold', color: '#0f172a'}}>100%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: '100%' }}></div>
            </div>
            <div className="progress-steps-list">
              <div className="progress-step-item completed"><CheckCircle fontSize="inherit" /> Profile & Business</div>
              <div className="progress-step-item completed"><CheckCircle fontSize="inherit" /> PAN Verification</div>
              <div className="progress-step-item completed"><CheckCircle fontSize="inherit" /> GSTIN Verification</div>
              <div className="progress-step-item completed"><CheckCircle fontSize="inherit" /> Bank Account</div>
              <div className="progress-step-item muted"><CheckCircle fontSize="inherit" /> Completed</div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-card-header">
              <div className="header-title-with-icon">
                <VerifiedUserOutlined className="header-icon orange" />
                <h3>Verification Details</h3>
              </div>
            </div>
            
            <div className="verification-block">
              <div className="verification-block-header">
                <span className="v-title"><DescriptionOutlined fontSize="small" className="v-icon" /> PAN Verification</span>
                <span className="verify-badge small"><CheckCircle fontSize="inherit" /> Verified</span>
              </div>
              <div className="detail-grid-2">
                <div className="detail-group small">
                  <label>PAN Number</label>
                  <span>{pi.pan || sellerProfile.panDetails?.panNumber || 'N/A'}</span>
                </div>
                <div className="detail-group small">
                  <label>Name on PAN</label>
                  <span>{sellerProfile.panDetails?.nameOnPan || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="verification-block">
              <div className="verification-block-header">
                <span className="v-title"><SecurityOutlined fontSize="small" className="v-icon" /> GSTIN Verification</span>
                <span className="verify-badge small"><CheckCircle fontSize="inherit" /> Verified</span>
              </div>
              <div className="detail-grid-2">
                <div className="detail-group small">
                  <label>GSTIN</label>
                  <span>{bi.gstin || sellerProfile.gstinDetails?.gstinNumber || 'N/A'}</span>
                </div>
                <div className="detail-group small">
                  <label>Legal Name</label>
                  <span>{sellerProfile.gstinDetails?.legalName || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="verification-block no-border">
              <div className="verification-block-header">
                <span className="v-title"><AccountBalanceOutlined fontSize="small" className="v-icon" /> Bank Account Verification</span>
                <span className="verify-badge small"><CheckCircle fontSize="inherit" /> Verified</span>
              </div>
              <div className="detail-grid-2">
                <div className="detail-group small">
                  <label>Account Holder Name</label>
                  <span>{bki.accountHolderName || sellerProfile.bankDetails?.accountHolderName || 'N/A'}</span>
                </div>
                <div className="detail-group small">
                  <label>Bank Name</label>
                  <span>{bki.bankName || sellerProfile.bankDetails?.bankName || 'N/A'}</span>
                </div>
                <div className="detail-group small">
                  <label>Account Number</label>
                  <span>{bki.accountNumber || sellerProfile.bankDetails?.accountNumber || 'N/A'}</span>
                </div>
                <div className="detail-group small">
                  <label>IFSC</label>
                  <span>{bki.ifsc || sellerProfile.bankDetails?.ifscCode || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
