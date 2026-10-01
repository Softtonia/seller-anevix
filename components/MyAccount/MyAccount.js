'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Info, CheckCircle } from '@mui/icons-material';
import StayUpdated from '../StayUpdated/StayUpdated';
import './MyAccount.css';

// Cardboard box icon SVG
const OrdersIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 6L6 14.5V45.5L30 54L54 45.5V14.5L30 6Z" fill="#D7CCC8" stroke="#8D6E63" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M6 14.5L30 23L54 14.5" stroke="#8D6E63" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M30 23V54" stroke="#8D6E63" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M18 10.2L42 18.8" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 28L24 32.5" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 34.5L24 39" stroke="#8D6E63" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Blue padlock icon SVG
const SecurityIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="24" width="32" height="24" rx="4" fill="#E3F2FD" stroke="#1E88E5" strokeWidth="2.5"/>
    <path d="M20 24V17C20 11.4772 24.4772 7 30 7C35.5228 7 40 11.4772 40 17V24" stroke="#1E88E5" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="30" cy="34" r="3" fill="#1E88E5"/>
    <path d="M30 37V41" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Pile of credit cards SVG
const PaymentsIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="18" width="38" height="24" rx="4" fill="#E8EAF6" stroke="#3F51B5" strokeWidth="2" />
    <rect x="14" y="24" width="38" height="24" rx="4" fill="#3F51B5" stroke="#3F51B5" strokeWidth="2" />
    <rect x="20" y="32" width="10" height="6" rx="1" fill="#FFD54F" />
    <line x1="14" y1="29.5" x2="52" y2="29.5" stroke="#283593" strokeWidth="4"/>
  </svg>
);

// Orange map marker location pin SVG
const AddressIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 7C20.0589 7 12 15.0589 12 25C12 37 30 53 30 53C30 53 48 37 48 25C48 15.0589 39.9411 7 30 7Z" fill="#FFE082" stroke="#FFB300" strokeWidth="2.5" strokeLinejoin="round"/>
    <circle cx="30" cy="23" r="6" fill="#FFF" stroke="#FFB300" strokeWidth="2.5"/>
  </svg>
);

// Support agent headset SVG
const SupportIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="18" fill="#FFF3E0" stroke="#FB8C00" strokeWidth="2.5"/>
    <path d="M12 30C12 20.0589 20.0589 12 30 12C39.9411 12 48 20.0589 48 30" stroke="#FB8C00" strokeWidth="3" strokeLinecap="round"/>
    <rect x="9" y="25" width="4" height="10" rx="2" fill="#FB8C00"/>
    <rect x="47" y="25" width="4" height="10" rx="2" fill="#FB8C00"/>
    <path d="M47 33C47 38.5228 42.5228 43 37 43H34" stroke="#FB8C00" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="33" cy="43" r="2.5" fill="#FB8C00"/>
    <circle cx="24" cy="27" r="2" fill="#FB8C00"/>
    <circle cx="36" cy="27" r="2" fill="#FB8C00"/>
    <path d="M26 34C28 36 32 36 34 34" stroke="#FB8C00" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// Settings gear with wrench SVG
const SettingsIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="12" fill="#ECEFF1" stroke="#455A64" strokeWidth="2.5"/>
    <path d="M30 12V15M30 45V48M12 30H15M45 30H48M17.3 17.3L19.4 19.4M40.6 40.6L42.7 42.7M17.3 42.7L19.4 40.6M40.6 17.3L42.7 19.4" stroke="#455A64" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M26 34L17 43" stroke="#FFB300" strokeWidth="3" strokeLinecap="round"/>
    <path d="M19 45L15 41" stroke="#FFB300" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

export default function MyAccount() {
  const [toast, setToast] = useState({ show: false, message: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const accountCards = [
    {
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      icon: <OrdersIcon />,
      link: '/my-orders',
    },
    {
      title: 'Login & Security',
      description: 'Edit login, name and mobile number',
      icon: <SecurityIcon />,
      link: '/login-security',
    },
    {
      title: 'Payment Options',
      description: 'Edit or add payment methods',
      icon: <PaymentsIcon />,
      link: '/my-payments',
    },
    {
      title: 'Your Address',
      description: 'Edit addresses for orders and gifts',
      icon: <AddressIcon />,
      link: '/checkout/address',
    },
    {
      title: 'Contact Us',
      description: 'Contact our customer service via phone or chat',
      icon: <SupportIcon />,
      action: () => showToast('Opening customer care ticket window...'),
    },
    {
      title: 'Settings',
      description: 'Edit your profile through settings.',
      icon: <SettingsIcon />,
      action: () => showToast('Redirecting to account personalization settings...'),
    },
  ];

  return (
    <>
      <div className="accountWrap">
        <div className="accountInner">
          {/* Header Title */}
          <header className="accountHeader">
            <h1 className="Poppins-semibold">Your Account</h1>
          </header>

          {/* Cards Grid */}
          <div className="accountGrid">
            {accountCards.map((card, index) => {
              if (card.link) {
                return (
                  <Link href={card.link} className="accountCard" key={index}>
                    <div className="accountCardLeft">{card.icon}</div>
                    <div className="accountCardRight">
                      <h6 className="cardTitle Poppins-semibold">{card.title}</h6>
                      <p className="cardDesc Poppins-regular">{card.description}</p>
                    </div>
                  </Link>
                );
              } else {
                return (
                  <div className="accountCard" onClick={card.action} key={index}>
                    <div className="accountCardLeft">{card.icon}</div>
                    <div className="accountCardRight">
                      <h6 className="cardTitle Poppins-semibold">{card.title}</h6>
                      <p className="cardDesc Poppins-regular">{card.description}</p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />

      {/* Toast Alert */}
      {toast.show && (
        <div className="toastContainer success">
          <CheckCircle />
          <span className="toastMessage Poppins-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
