'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MenuItem } from '@mui/material';
import CustomDropdown from '@/utils/CustomDropdown/CustomDropdown';
import OrderSummary from '@/components/OrderSummary/OrderSummary';
import { CheckCircle, Info } from '@mui/icons-material';
import './PaymentMethod.css';
import StayUpdated from '../StayUpdated/StayUpdated';

const paymentOptions = [
  {
    id: 'upi',
    name: 'UPI',
    description: 'Pay by any UPI app',
    icon: '/assets/images/upi.png',
    selected: true,
  },
  {
    id: 'card',
    name: 'Credit/Debit/ ATM Card',
    description: 'Add and secure cards as per RBI Guidelines',
    icon: '/assets/images/card.png',
    selected: false,
  },
  {
    id: 'emi',
    name: 'EMI',
    description: 'No cost EMI available',
    icon: '/assets/images/emi.png',
    selected: false,
    options: [
      'HDFC Credit Card EMI',
      'LazyPay EMI',
      'Kotak Credit Card EMI',
      'SBI Credit Card EMI',
      'Axis Credit Card EMI',
      'IDFC Credit Card EMI',
      'ICICI Credit Card EMI',
      'Amex Card EMI',
    ],
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: '/assets/images/netbanking.png',
    selected: false,
    options: [
      'Airtel Payments Bank',
      'HDFC Bank',
      'ICICI Bank',
      'Kotak Bank',
      'State Bank of India',
      'Yes Bank Ltd',
      'United Bank of India',
      'Union Bank of India',
      'Punjab National Bank',
      'Jammu & Kashmir Bank',
    ],
  },
  {
    id: 'pod',
    name: 'Pay on Delivery',
    description: 'Cash, UPI and Cards accepted',
    icon: '/assets/images/pod.png',
    selected: false,
  },
];

export default function PaymentMethod() {
  const [selectedMethod, setSelectedMethod] = useState('pod'); // Default to pod for tablet mockup
  const [selectedNetBank, setSelectedNetBank] = useState('');
  const [selectedEmi, setSelectedEmi] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Dropdown Anchors
  const [emiAnchor, setEmiAnchor] = useState(null);
  const [netBankingAnchor, setNetBankingAnchor] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleEmiClick = (event) => {
    event.stopPropagation();
    setEmiAnchor(event.currentTarget);
  };

  const handleEmiClose = () => {
    setEmiAnchor(null);
  };

  const handleEmiSelect = (plan) => {
    setSelectedEmi(plan);
    handleEmiClose();
    triggerToast(`Selected ${plan} option`, 'success');
  };

  const handleNetBankingClick = (event) => {
    event.stopPropagation();
    setNetBankingAnchor(event.currentTarget);
  };

  const handleNetBankingClose = () => {
    setNetBankingAnchor(null);
  };

  const handleNetBankSelect = (bank) => {
    setSelectedNetBank(bank);
    handleNetBankingClose();
    triggerToast(`Selected ${bank} for Net Banking`, 'success');
  };

  return (
    <>
      {/* 1. DESKTOP VIEW LAYOUT (Original layout remains for Web) */}
      <div className="desktopPaymentLayout">
        <div className="paymentWrap">
          <div className="paymentInner">
            <header className="paymentHeader">
              <Link href="/checkout/address" className="backBtn" aria-label="Back">←</Link>
              <h1 className="Poppins-semibold">Payment Method</h1>
            </header>

            <div className="paymentForm">
              {/* Total Amount */}
              <div className="totalAmount">
                <h4 className='Poppins-medium'>Total Amount</h4>
                <h4 className="amount Poppins-medium">Rs. 85,370/-</h4>
              </div>

              {/* Payment Methods */}
              <section className="paymentMethods">
                <h4 className="sectionLabel">Payment Method</h4>
                
                <div className="methodsList">
                  {paymentOptions.map((method) => {
                    const isActive = selectedMethod === method.id;
                    const hasOptions = !!method.options;
                    
                    const handleClick = (e) => {
                      setSelectedMethod(method.id);
                      if (method.id === 'emi') {
                        handleEmiClick(e);
                      } else if (method.id === 'netbanking') {
                        handleNetBankingClick(e);
                      }
                    };

                    const isAnchorOpen =
                      method.id === 'emi'
                        ? Boolean(emiAnchor)
                        : method.id === 'netbanking'
                        ? Boolean(netBankingAnchor)
                        : false;

                    return (
                      <div className={`methodCard ${isActive ? 'active' : ''}`} key={method.id}>
                        <button
                          className={`methodHeader ${isActive ? 'active' : ''}`}
                          onClick={handleClick}
                        >
                          <div className="methodLeft">
                            {method.icon && (
                              <Image
                                src={method.icon}
                                alt={method.name}
                                width={32}
                                height={32}
                                className="methodIcon"
                              />
                            )}
                            <div className="methodInfo">
                              <h5 className="methodName">{method.name}</h5>
                              {method.description && (
                                <p className="methodDesc">{method.description}</p>
                              )}
                            </div>
                          </div>
                          {hasOptions && (
                            <span className={`expandIcon ${isAnchorOpen ? 'open' : ''}`}>⌄</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Gift Card */}
              <div className="giftCard">
                <h4 className="giftIcon">🎁</h4>
                <h4 className='Poppins-medium'>Have a Gift Card?</h4>
                <Link href="#" className="applyLink">Apply Gift Card</Link>
              </div>

              {/* We Accept */}
              <div className="weAccept">
                <h4 className='Poppins-medium'>We Accept</h4>
                <div className="cardLogos">
                  <Image src="/assets/images/visa.png" alt="Visa" width={60} height={40} />
                  <Image src="/assets/images/amex.png" alt="Amex" width={60} height={40} />
                  <Image src="/assets/images/paypalbank.png" alt="PayPal Bank" width={60} height={40} />
                  <Image src="/assets/images/mastercard.png" alt="MasterCard" width={60} height={40} />
                  <Image src="/assets/images/paypal.png" alt="PayPal" width={60} height={40} />
                  <Image src="/assets/images/googlepay.png" alt="Google Pay" width={60} height={40} />
                  <Image src="/assets/images/paytm.png" alt="Paytm" width={60} height={40} />
                  <Image src="/assets/images/phonepe.png" alt="PhonePe" width={60} height={40} />
                </div>
              </div>

              <button className="placeOrderBtn">Place Order</button>

              <p className="terms">
                By placing the order, you agree to Anevix&apos;s <Link href="#">Terms of use</Link> and <Link href="#">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLET/IPAD VIEW LAYOUT (Redesigned specifically for iPad) */}
      <div className="tabletPaymentLayout">
        <div className="checkoutPaymentWrap">
          <div className="checkoutPaymentInner">
            {/* Header */}
            <header className="checkoutPaymentHeader">
              <Link href="/checkout/address" className="backBtn Poppins-semibold">
                <span className="backArrow">&lt;</span> Choose Payment Mode
              </Link>
            </header>

            <hr className="headerDivider" />

            {/* Single Column Layout */}
            <div className="paymentLayoutContainer">
              
              {/* Payment Method Card */}
              <div className="paymentCard">
                <h4 className="cardLabel Poppins-semibold">Payment Method</h4>
                <hr className="cardDivider" />

                <div className="paymentRadiosList">
                  {/* Credit or Debit Card */}
                  <div className={`radioOptionRow ${selectedMethod === 'card' ? 'active' : ''}`} onClick={() => setSelectedMethod('card')}>
                    <label className="radioInputLabel">
                      <input 
                        type="radio" 
                        name="paymentOptionTablet" 
                        value="card"
                        checked={selectedMethod === 'card'} 
                        onChange={() => setSelectedMethod('card')}
                      />
                      <span className="radioInputCustom" />
                      <span className="radioTextLabel Poppins-medium">Credit or Debit Card</span>
                    </label>
                    <div className="cardLogosRow">
                      <Image src="/assets/images/visa.png" alt="Visa" width={56} height={36} className="brandLogoImg" />
                      <Image src="/assets/images/mastercard.png" alt="MasterCard" width={56} height={36} className="brandLogoImg" />
                      <Image src="/assets/images/paypal.png" alt="PayPal" width={56} height={36} className="brandLogoImg" />
                      <Image src="/assets/images/paypalbank.png" alt="PayPal Bank" width={56} height={36} className="brandLogoImg" />
                      <Image src="/assets/images/amex.png" alt="Amex" width={56} height={36} className="brandLogoImg" />
                    </div>
                  </div>

                  {/* Net Banking */}
                  <div className={`radioOptionRow ${selectedMethod === 'netbanking' ? 'active' : ''}`} onClick={() => setSelectedMethod('netbanking')}>
                    <label className="radioInputLabel">
                      <input 
                        type="radio" 
                        name="paymentOptionTablet" 
                        value="netbanking"
                        checked={selectedMethod === 'netbanking'} 
                        onChange={() => setSelectedMethod('netbanking')}
                      />
                      <span className="radioInputCustom" />
                      <span className="radioTextLabel Poppins-medium">Net Banking</span>
                    </label>
                    <div className="dropdownWrapper" onClick={(e) => e.stopPropagation()}>
                      <button 
                        type="button" 
                        className="bankDropdownTrigger Poppins-medium"
                        onClick={handleNetBankingClick}
                      >
                        {selectedNetBank || 'Choose an Option'} <span className="triggerChevron">⌄</span>
                      </button>
                    </div>
                  </div>

                  {/* Scan and Pay with UPI */}
                  <div className={`radioOptionRow ${selectedMethod === 'upi' ? 'active' : ''}`} onClick={() => setSelectedMethod('upi')}>
                    <label className="radioInputLabel">
                      <input 
                        type="radio" 
                        name="paymentOptionTablet" 
                        value="upi"
                        checked={selectedMethod === 'upi'} 
                        onChange={() => setSelectedMethod('upi')}
                      />
                      <span className="radioInputCustom" />
                      <span className="radioTextLabel Poppins-medium flexAlign">
                        Scan and Pay with <Image src="/assets/images/upi.png" alt="UPI" width={40} height={20} className="upiInlineLogo" />
                      </span>
                    </label>
                    <p className="optionHintText Poppins-regular">
                      You will need to Scan the QR code on the payment page to complete the payment.
                    </p>
                  </div>

                  {/* Cash on Delivery / Pay on Delivery */}
                  <div className={`radioOptionRow ${selectedMethod === 'pod' ? 'active' : ''}`} onClick={() => setSelectedMethod('pod')}>
                    <label className="radioInputLabel">
                      <input 
                        type="radio" 
                        name="paymentOptionTablet" 
                        value="pod"
                        checked={selectedMethod === 'pod'} 
                        onChange={() => setSelectedMethod('pod')}
                      />
                      <span className="radioInputCustom" />
                      <span className="radioTextLabel Poppins-medium">Cash on Delivery/Pay on Delivery</span>
                    </label>
                    <p className="optionHintText Poppins-regular">
                      Cash, UPI and Cards accepted.
                    </p>
                  </div>

                  {/* Select EMI Option */}
                  <div className={`radioOptionRow ${selectedMethod === 'emi' ? 'active' : ''}`} onClick={() => setSelectedMethod('emi')}>
                    <label className="radioInputLabel">
                      <input 
                        type="radio" 
                        name="paymentOptionTablet" 
                        value="emi"
                        checked={selectedMethod === 'emi'} 
                        onChange={() => setSelectedMethod('emi')}
                      />
                      <span className="radioInputCustom" />
                      <span className="radioTextLabel Poppins-medium">Select EMI Option</span>
                    </label>
                    {selectedMethod === 'emi' && (
                      <div className="dropdownWrapper" onClick={(e) => e.stopPropagation()}>
                        <button 
                          type="button" 
                          className="bankDropdownTrigger Poppins-medium"
                          onClick={handleEmiClick}
                        >
                          {selectedEmi || 'Choose EMI Plan'} <span className="triggerChevron">⌄</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Have a Gift Card? Card */}
              <div className="giftCardRowContainer">
                <div className="giftCardDetails">
                  <span className="giftBoxIcon">🎁</span>
                  <span className="giftLabelText Poppins-medium">Have a Gift Card?</span>
                </div>
                <button 
                  type="button" 
                  className="applyGiftButton Poppins-semibold"
                  onClick={() => triggerToast('Gift Card form expanded', 'info')}
                >
                  Apply Gift Card
                </button>
              </div>

              {/* Embedded Order Summary Card */}
              <div className="checkoutSummaryPanel">
                <OrderSummary />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />

      {/* Dropdown Select Menus */}
      <CustomDropdown
        anchorEl={netBankingAnchor}
        open={Boolean(netBankingAnchor)}
        onClose={handleNetBankingClose}
        width={350}
      >
        <MenuItem onClick={() => handleNetBankSelect('Airtel Payments Bank')}>Airtel Payments Bank</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('HDFC Bank')}>HDFC Bank</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('ICICI Bank')}>ICICI Bank</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('Kotak Bank')}>Kotak Bank</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('State Bank of India')}>State Bank of India</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('Yes Bank Ltd')}>Yes Bank Ltd</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('Union Bank of India')}>Union Bank of India</MenuItem>
        <MenuItem onClick={() => handleNetBankSelect('Punjab National Bank')}>Punjab National Bank</MenuItem>
      </CustomDropdown>

      <CustomDropdown
        anchorEl={emiAnchor}
        open={Boolean(emiAnchor)}
        onClose={handleEmiClose}
        width={350}
      >
        <MenuItem onClick={() => handleEmiSelect('HDFC Credit Card EMI')}>HDFC Credit Card EMI</MenuItem>
        <MenuItem onClick={() => handleEmiSelect('LazyPay EMI')}>LazyPay EMI</MenuItem>
        <MenuItem onClick={() => handleEmiSelect('Kotak Credit Card EMI')}>Kotak Credit Card EMI</MenuItem>
        <MenuItem onClick={() => handleEmiSelect('SBI Credit Card EMI')}>SBI Credit Card EMI</MenuItem>
        <MenuItem onClick={() => handleEmiSelect('Axis Credit Card EMI')}>Axis Credit Card EMI</MenuItem>
        <MenuItem onClick={() => handleEmiSelect('ICICI Credit Card EMI')}>ICICI Credit Card EMI</MenuItem>
      </CustomDropdown>

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
