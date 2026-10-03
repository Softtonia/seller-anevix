import React, { useState, useEffect } from 'react';
import { CloseOutlined } from '@mui/icons-material';
import apiClient from '@/api/axiosClient';
import './Profile.css';

export default function ProfileEditModal({ isOpen, onClose, editType, initialData, onSaveSuccess }) {
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      let payload = {};

      if (editType === 'basic') {
        payload = {
          personalInfo: {
            fullName: formData.fullName,
            mobile: formData.mobile,
            email: formData.email,
            dateOfBirth: formData.dateOfBirth
          }
        };
      } else if (editType === 'businessAddress') {
        payload = {
          businessInfo: {
            businessAddress: {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country || 'India'
            }
          }
        };
      } else if (editType === 'businessDetails') {
        payload = {
          businessInfo: {
            businessName: formData.businessName,
            businessType: formData.businessType,
            sellerType: formData.sellerType
          }
        };
      }

      const res = await apiClient.put('/business/onboarding/profile', payload);
      if (res.data.success) {
        onSaveSuccess();
        onClose();
      } else {
        setError(res.data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderFields = () => {
    if (editType === 'basic') {
      return (
        <>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" name="mobile" value={formData.mobile || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} />
          </div>
        </>
      );
    }
    if (editType === 'businessAddress') {
      return (
        <>
          <div className="form-group">
            <label>Street</label>
            <input type="text" name="street" value={formData.street || ''} onChange={handleChange} />
          </div>
          <div className="form-group row-group">
            <div className="half">
              <label>City</label>
              <input type="text" name="city" value={formData.city || ''} onChange={handleChange} />
            </div>
            <div className="half">
              <label>State</label>
              <input type="text" name="state" value={formData.state || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group row-group">
            <div className="half">
              <label>Zip Code</label>
              <input type="text" name="zipCode" value={formData.zipCode || ''} onChange={handleChange} />
            </div>
            <div className="half">
              <label>Country</label>
              <input type="text" name="country" value={formData.country || 'India'} onChange={handleChange} />
            </div>
          </div>
        </>
      );
    }
    if (editType === 'businessDetails') {
      return (
        <>
          <div className="form-group">
            <label>Company / Store Name</label>
            <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Business Type</label>
            <select name="businessType" value={formData.businessType || ''} onChange={handleChange}>
              <option value="Sole_Proprietorship">Sole Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Private_Limited">Private Limited</option>
              <option value="Public_Limited">Public Limited</option>
              <option value="LLP">LLP</option>
            </select>
          </div>
          <div className="form-group">
            <label>Seller Type</label>
            <select name="sellerType" value={formData.sellerType || ''} onChange={handleChange}>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Wholesaler">Wholesaler</option>
              <option value="Retailer">Retailer</option>
              <option value="Distributor">Distributor</option>
            </select>
          </div>
        </>
      );
    }
  };

  const getTitle = () => {
    if (editType === 'basic') return 'Edit Basic Information';
    if (editType === 'businessAddress') return 'Edit Business Address';
    if (editType === 'businessDetails') return 'Edit Business Details';
    return 'Edit Profile';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button className="btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="modal-body">
          {error && <div className="error-alert">{error}</div>}
          {renderFields()}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className="btn-save" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
