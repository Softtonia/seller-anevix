'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowBackIosNew, Info } from '@mui/icons-material';
import { getOrderById, cancelOrderById } from '@/utils/ordersData';
import StayUpdated from '../StayUpdated/StayUpdated';
import './OrderCancel.css';

const cancellationReasons = [
  'Incorrect size ordered',
  'product not required anymore',
  'Ordered by Mistake',
  'Wants to change color/size',
  'Duplicated order',
  'Delayed Deleivery cancellation',
];

export default function OrderCancel({ id }) {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState('Ordered by Mistake');
  const [comments, setComments] = useState('');

  // Find order in our shared mock database
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="cancelWrap errorState">
        <div className="cancelInner">
          <header className="cancelHeader">
            <Link href="/my-orders" className="backBtnLink">
              <ArrowBackIosNew fontSize="small" /> Back to My Orders
            </Link>
          </header>
          <div className="errorContainer">
            <Info color="error" fontSize="large" />
            <h2 className="Poppins-semibold">Order Not Found</h2>
            <p className="Poppins-regular">We couldn&apos;t find an order with ID #{id}.</p>
            <Link href="/my-orders" className="returnBtn Poppins-medium">
              Go to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Persist status change to localStorage
    cancelOrderById(id, selectedReason, comments);
    // Redirect to Order Cancelled screen
    router.push(`/my-orders/${id}/cancelled`);
  };

  return (
    <>
      <div className="cancelWrap">
        <div className="cancelInner">
          {/* Header Link */}
          <header className="cancelHeader">
            <Link href={`/my-orders/${order.id}`} className="backBtnLink Poppins-medium">
              <ArrowBackIosNew fontSize="small" /> Back to Order Details
            </Link>
            <h1 className="Poppins-semibold">Reason For Cancellation</h1>
            <p className="cancelSubtitle Poppins-regular">
              Please tell us correct reason for cancellation.This information is only used to improve our service
            </p>
          </header>

          {/* Form container */}
          <form className="cancelForm" onSubmit={handleSubmit}>
            <div className="reasonsSection">
              <h5 className="sectionLabel Poppins-medium">SELECT REASON</h5>
              <div className="reasonsList">
                {cancellationReasons.map((reason, index) => {
                  const isChecked = selectedReason === reason;
                  return (
                    <label className={`reasonItem ${isChecked ? 'selected' : ''}`} key={index}>
                      <span className="customRadio">
                        <input
                          type="radio"
                          name="cancelReason"
                          checked={isChecked}
                          onChange={() => setSelectedReason(reason)}
                          className="hiddenRadio"
                        />
                        <span className="radioCircle" />
                      </span>
                      <span className="reasonText Poppins-regular">{reason}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="commentsSection">
              <textarea
                placeholder="Additional Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="commentsTextarea Poppins-regular"
                rows={5}
              />
            </div>

            <button type="submit" className="submitCancelBtn Poppins-medium">
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />
    </>
  );
}
