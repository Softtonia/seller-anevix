'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Info, CheckCircle, HighlightOff, AccountBalanceWallet, AddCircleOutlined } from '@mui/icons-material';
import StayUpdated from '../StayUpdated/StayUpdated';
import './MyPayments.css';

// SVG for Google Pay logo
const GooglePayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="#F8F9FA"/>
    <path d="M7.5 12C7.5 9.51 9.51 7.5 12 7.5C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5C9.51 16.5 7.5 14.49 7.5 12Z" fill="#1A73E8"/>
    <path d="M11 11H13V15H11V11Z" fill="#FFF"/>
    <path d="M10 12.5H14V13.5H10V12.5Z" fill="#FFF"/>
  </svg>
);

// SVG for PhonePe
const PhonePeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#5F259F"/>
    <path d="M12 5C8.13 5 5 8.13 5 12C5 15.87 8.13 19 12 19C15.87 19 19 15.87 19 12C19 8.13 15.87 5 12 5ZM12.8 14.5H11.2V11H12.8V14.5ZM12.8 9.5H11.2V8H12.8V9.5Z" fill="#FFF"/>
  </svg>
);

// SVG for Paytm
const PaytmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="#00BAF2"/>
    <path d="M8 8H10V16H8V8Z" fill="#FFF"/>
    <path d="M11 8H13V12H15V8H17V16H15V14H13V16H11V8Z" fill="#FFF"/>
  </svg>
);

// Generic UPI icon SVG
const UpiIcon = () => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="16" fill="#F1F8E9"/>
    <path d="M6 13.5H9.5L12 21H14L18.5 10H21" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13.5" r="1.5" fill="#4CAF50" />
    <circle cx="18.5" cy="18.5" r="1.5" fill="#4CAF50" />
  </svg>
);

const initialTransactions = [
  {
    id: 'TXN102938475',
    date: '21 Aug, 06:31 PM',
    amount: 'Rs. 373',
    status: 'Settled to Bank',
    message: 'A total of Rs. 373 has been processed to your bank account on 21 Aug. It should reflect in your bank account within 2-3 working days. You can track the status of this transfer with reference number URN:912830912.',
    bankName: 'HDFC Bank',
    accNo: 'XXXXXX5678',
    urn: 'URN:912830912',
  },
  {
    id: 'TXN102938122',
    date: '15 Aug, 10:15 AM',
    amount: 'Rs. 1,250',
    status: 'Settled to Bank',
    message: 'A total of Rs. 1,250 has been processed to your bank account on 15 Aug. Settled successfully. It should reflect in your bank account ending in 1234 within 2-3 working days.',
    bankName: 'ICICI Bank',
    accNo: 'XXXXXX1234',
    urn: 'URN:837192837',
  },
  {
    id: 'TXN102937901',
    date: '02 Aug, 04:45 PM',
    amount: 'Rs. 599',
    status: 'Refund Initiated',
    message: 'Refund of Rs. 599 for Order #23891 has been initiated. The amount is being reversed to your original payment mode (Google Pay UPI) and will be settled within 3-5 business days.',
    bankName: 'Google Pay UPI',
    accNo: 'xyzabc56778@okhdfcbank',
    urn: 'REF:2389104928',
  }
];

const initialUpiIds = [
  {
    id: '1',
    provider: 'Google Pay',
    vpa: 'xyzabc56778@okhdfcbank',
  }
];

export default function MyPayments() {
  const [transactions] = useState(initialTransactions);
  const [upiIds, setUpiIds] = useState(initialUpiIds);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedTxn, setSelectedTxn] = useState(null);
  
  // Modals / Form states
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVpa, setNewVpa] = useState('');
  const [newProvider, setNewProvider] = useState('Google Pay');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [vpaError, setVpaError] = useState('');

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'Google Pay':
        return <GooglePayIcon />;
      case 'PhonePe':
        return <PhonePeIcon />;
      case 'Paytm':
        return <PaytmIcon />;
      default:
        return <UpiIcon />;
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      const remainingUpi = upiIds.filter(item => item.id !== deleteConfirmId);
      setUpiIds(remainingUpi);
      setDeleteConfirmId(null);
      triggerToast('UPI ID deleted successfully', 'success');
    }
  };

  const handleVerify = () => {
    // Basic verification format check
    if (!newVpa || !newVpa.includes('@')) {
      setVpaError('Please enter a valid UPI ID (e.g., name@bank)');
      return;
    }
    setVpaError('');
    setIsVerifying(true);
    
    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      triggerToast('UPI ID verified successfully!', 'success');
    }, 1200);
  };

  const handleSaveUpi = (e) => {
    e.preventDefault();
    if (!isVerified) {
      setVpaError('Please verify your UPI ID first');
      return;
    }

    const newIdObj = {
      id: Date.now().toString(),
      provider: newProvider,
      vpa: newVpa,
    };

    setUpiIds([...upiIds, newIdObj]);
    setNewVpa('');
    setIsVerified(false);
    setShowAddForm(false);
    triggerToast('Payment method saved successfully', 'success');
  };

  return (
    <>
      <div className="paymentsWrap">
        <div className="paymentsInner">
          {/* Header */}
          <header className="paymentsHeader">
            <Link href="/my-account" className="backBtn Poppins-semibold">
              <span className="backArrow">&lt;</span> My Payments
            </Link>
          </header>

          {/* Desktop Dual Columns / Mobile Layout */}
          <div className="paymentsLayoutGrid">
            
            {/* Left Column - Transactions */}
            <div className="layoutColumn transactionsCol">
              <div className="columnHeader tabActive Poppins-semibold">
                Transactions
                <span className="underlineIndicator orangeLine"></span>
              </div>
              
              <div className="columnContent">
                {transactions.map((txn) => (
                  <div className="txnItemCard" key={txn.id}>
                    <span className="txnDate Poppins-medium">{txn.date}</span>
                    <p className="txnDesc Poppins-regular">{txn.message}</p>
                    <button 
                      className="viewMoreBtn Poppins-medium"
                      onClick={() => setSelectedTxn(txn)}
                    >
                      VIEW MORE
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Vertical Divider (Desktop Only) */}
            <div className="verticalDivider"></div>

            {/* Right Column - Payment Modes */}
            <div className="layoutColumn paymentModesCol">
              <div className="columnHeader tabActive Poppins-semibold">
                Payment Modes
                <span className="underlineIndicator pinkLine"></span>
              </div>

              <div className="columnContent">
                <h5 className="subSectionTitle Poppins-semibold">Saved Payment Methods</h5>
                <p className="paymentTypeLabel Poppins-medium">UPI IDs</p>

                <div className="upiList">
                  {upiIds.map((item) => (
                    <div className="upiCard" key={item.id}>
                      <div className="upiCardLeft">
                        <div className="providerIconContainer">
                          {getProviderIcon(item.provider)}
                        </div>
                        <div className="upiDetails">
                          <h6 className="providerName Poppins-semibold">{item.provider}</h6>
                          <p className="upiVpa Poppins-regular">{item.vpa}</p>
                        </div>
                      </div>
                      <button 
                        className="deleteBtn Poppins-semibold"
                        onClick={() => handleDeleteClick(item.id)}
                      >
                        DELETE
                      </button>
                    </div>
                  ))}

                  {upiIds.length === 0 && (
                    <p className="emptyStateText Poppins-regular">No saved UPI IDs found.</p>
                  )}
                </div>

                {/* Add UPI Form / Trigger */}
                {/* !showAddForm ? (
                  <button 
                    className="addUpiTriggerBtn Poppins-medium"
                    onClick={() => {
                      setShowAddForm(true);
                      setIsVerified(false);
                      setNewVpa('');
                      setVpaError('');
                    }}
                  >
                    <AddCircleOutlined className="addIcon" /> Add New UPI ID
                  </button>
                ) : (
                  <form onSubmit={handleSaveUpi} className="addUpiForm">
                    <h6 className="formTitle Poppins-semibold">Add New UPI ID</h6>
                    
                    <div className="formGroup">
                      <label className="Poppins-medium">Select UPI App</label>
                      <select 
                        value={newProvider} 
                        onChange={(e) => {
                          setNewProvider(e.target.value);
                          setIsVerified(false);
                        }}
                        className="formSelect"
                      >
                        <option value="Google Pay">Google Pay</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Paytm">Paytm</option>
                        <option value="Other UPI">Other UPI App</option>
                      </select>
                    </div>

                    <div className="formGroup">
                      <label className="Poppins-medium">UPI ID / VPA</label>
                      <div className="inputVerifyGroup">
                        <input 
                          type="text" 
                          placeholder="e.g. mobile@ybl or username@okhdfcbank" 
                          value={newVpa}
                          onChange={(e) => {
                            setNewVpa(e.target.value);
                            setIsVerified(false);
                            setVpaError('');
                          }}
                          className={`formInput ${vpaError ? 'inputError' : ''}`}
                          disabled={isVerifying}
                        />
                        <button 
                          type="button" 
                          className={`verifyBtn Poppins-medium ${isVerified ? 'verified' : ''}`}
                          onClick={handleVerify}
                          disabled={isVerifying || !newVpa}
                        >
                          {isVerifying ? (
                            <span className="spinner"></span>
                          ) : isVerified ? (
                            'Verified'
                          ) : (
                            'Verify'
                          )}
                        </button>
                      </div>
                      {vpaError && <p className="errorText Poppins-medium">{vpaError}</p>}
                      {isVerified && <p className="successText Poppins-medium">UPI VPA matches active account.</p>}
                    </div>

                    <div className="formActions">
                      <button 
                        type="button" 
                        className="cancelFormBtn Poppins-medium"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="saveFormBtn Poppins-semibold"
                        disabled={!isVerified}
                      >
                        Save Method
                      </button>
                    </div>
                  </form>
                ) */}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />

      {/* View More Transaction Modal */}
      {selectedTxn && (
        <div className="modalOverlay" onClick={() => setSelectedTxn(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h5 className="modalTitle Poppins-semibold">Transaction Details</h5>
              <button className="modalCloseBtn" onClick={() => setSelectedTxn(null)}>
                <HighlightOff />
              </button>
            </div>
            <div className="modalBody">
              <div className="modalRow">
                <span className="modalLabel Poppins-medium">Transaction ID</span>
                <span className="modalVal Poppins-regular">{selectedTxn.id}</span>
              </div>
              <div className="modalRow">
                <span className="modalLabel Poppins-medium">Settlement Amount</span>
                <span className="modalVal Poppins-semibold highlightAmount">{selectedTxn.amount}</span>
              </div>
              <div className="modalRow">
                <span className="modalLabel Poppins-medium">Settlement Date</span>
                <span className="modalVal Poppins-regular">{selectedTxn.date}</span>
              </div>
              <div className="modalRow">
                <span className="modalLabel Poppins-medium">Status</span>
                <span className="modalVal badgeSuccess Poppins-medium">{selectedTxn.status}</span>
              </div>
              <div className="modalRow">
                <span className="modalLabel Poppins-medium">Settlement Account</span>
                <span className="modalVal Poppins-regular">{selectedTxn.bankName} ({selectedTxn.accNo})</span>
              </div>
              <div className="modalRow">
                <span className="modalLabel Poppins-medium">Reference Number</span>
                <span className="modalVal Poppins-regular">{selectedTxn.urn}</span>
              </div>
              
              <div className="modalMessageArea">
                <p className="Poppins-regular">{selectedTxn.message}</p>
              </div>
            </div>
            <div className="modalFooter">
              <button className="closeActionBtn Poppins-medium" onClick={() => setSelectedTxn(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modalOverlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modalCard deleteConfirmCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h5 className="modalTitle Poppins-semibold">Delete Saved UPI ID</h5>
              <button className="modalCloseBtn" onClick={() => setDeleteConfirmId(null)}>
                <HighlightOff />
              </button>
            </div>
            <div className="modalBody textCenter">
              <p className="Poppins-regular warningText">
                Are you sure you want to delete this saved UPI ID? You will need to verify it again if you want to use it in the future.
              </p>
            </div>
            <div className="modalFooter flexCenter">
              <button 
                className="cancelActionBtn Poppins-medium" 
                onClick={() => setDeleteConfirmId(null)}
              >
                No, Keep
              </button>
              <button 
                className="deleteConfirmActionBtn Poppins-semibold" 
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
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
