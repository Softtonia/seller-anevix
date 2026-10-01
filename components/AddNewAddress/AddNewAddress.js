'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import OrderSummary from '@/components/OrderSummary/OrderSummary';
import FormElement from '@/utils/FormElement/FormElement';
import './AddNewAddress.css';
import StayUpdated from '../StayUpdated/StayUpdated';

export default function AddNewAddress() {
  const [formData, setFormData] = useState({
    country: '',
    fullName: '',
    mobileNumber: '',
    houseNumber: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    addressType: 'home',
    defaultAddress: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <>
    <div className="addNewAddressWrap">
      <div className="addNewAddressInner">
        <header className="addHeader">
          <div className="headerLeft">
            <Link href="/checkout/address" className="backBtn" aria-label="Back">←</Link>
            <h1>Add New Address</h1>
          </div>
          <Link href="/checkout/address" className="cancelBtn">Cancel</Link>
        </header>

        <div className="addLayout">
          <main className="addForm">
            {/* Contact Details */}
            <section className="formSection">
              <h4 className="sectionLabel">CONTACT DETAILS</h4>
              
              <div className="formGroup">
                <FormElement
                  type="searchable-select"
                  label="COUNTRY"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Select Country"
                  options={[
                    { value: 'india', label: 'India' },
                    { value: 'usa', label: 'USA' },
                    { value: 'uk', label: 'United Kingdom' },
                    { value: 'canada', label: 'Canada' },
                    { value: 'australia', label: 'Australia' },
                    { value: 'germany', label: 'Germany' },
                    { value: 'france', label: 'France' },
                    { value: 'japan', label: 'Japan' },
                  ]}
                />
              </div>

              <div className="formGroup">
                <FormElement
                  type="text"
                  name="fullName"
                  placeholder="NAME"
                  value={formData.fullName}
                  onChange={handleChange}
                  label="Full Name (First and Last Name)"
                  labelClassName="Poppins-regular"
                  icon={formData.fullName && (
                    <span 
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }} 
                      onClick={() => setFormData(prev => ({ ...prev, fullName: '' }))}
                    >
                      ✕
                    </span>
                  )}
                />
              </div>

              <div className="formGroup">
                <FormElement
                  type="tel"
                  name="mobileNumber"
                  placeholder="XXXXXXXXXX"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  label="Mobile Number"
                  labelClassName="Poppins-regular"
                  icon={formData.mobileNumber && (
                    <span 
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }} 
                      onClick={() => setFormData(prev => ({ ...prev, mobileNumber: '' }))}
                    >
                      ✕
                    </span>
                  )}
                />
              </div>

              <div className="formGroup checkbox">
                <FormElement
                  type="checkbox"
                  name="assistDelivery"
                  label="Maybe used to assist delivery"
                />
              </div>
            </section>

            {/* Address Section */}
            <section className="formSection">
              <h4 className="sectionLabel Poppins-regular">Address</h4>
              
              <div className="useLocation">
                <span>📍 Use my current location</span>
              </div>

              <div className="formGroup">
                <FormElement
                  type="text"
                  name="houseNumber"
                  placeholder="House Number/Tower/Block*"
                  value={formData.houseNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <FormElement
                  type="text"
                  name="address"
                  placeholder="Address (locality/building/street)*"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <FormElement
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <FormElement
                  type="text"
                  name="city"
                  placeholder="Town/City"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="formGroup">
                <FormElement
                  type="searchable-select"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  options={[
                    { value: 'karnataka', label: 'Karnataka' },
                    { value: 'maharashtra', label: 'Maharashtra' },
                    { value: 'delhi', label: 'Delhi' },
                    { value: 'tamilnadu', label: 'Tamil Nadu' },
                    { value: 'telangana', label: 'Telangana' },
                    { value: 'up', label: 'Uttar Pradesh' },
                    { value: 'gujarat', label: 'Gujarat' },
                    { value: 'rajasthan', label: 'Rajasthan' },
                  ]}
                />
              </div>
            </section>

            {/* Address Type */}
            <section className="formSection">
              <h4 className="sectionLabel Poppins-regular">Address Type</h4>
              
              <div className="radioGroup">
                <FormElement
                  type="radio"
                  name="addressType"
                  value={formData.addressType}
                  onChange={handleChange}
                  labelClassName="Poppins-regular"
                  options={[
                    { value: 'home', label: 'Home' },
                    { value: 'office', label: 'Office' },
                  ]}
                />
              </div>

              <div className="formGroup checkbox">
                <FormElement
                  type="checkbox"
                  name="defaultAddress"
                  checked={formData.defaultAddress}
                  onChange={handleChange}
                  label="Make this as my default address"
                  labelClassName="Poppins-regular"
                />
              </div>
            </section>

            <button className="useAddressBtn">Use this Address</button>
          </main>

          <OrderSummary />
        </div>
      </div>
    </div>
    <StayUpdated/>
    </>
  );
}
