import React from 'react';
import './OrderSummary.css';

export default function OrderSummary() {
  return (
    <aside className="orderSummary">
      <div className="summaryCard">
        <h4 className="Poppins-regular">Order Summary</h4>
        <dl>
          <div className="row"><dt className="Poppins-regular">Subtotal</dt><dd>Rs. 490/-</dd></div>
          <div className="row"><dt className="Poppins-regular">Discount (-20%)</dt><dd>Rs. 490/-</dd></div>
          <div className="row"><dt className="Poppins-regular">Delivery Fee</dt><dd>Rs. 490/-</dd></div>
          <div className="row"><dt className="Poppins-regular">Shipping</dt><dd>Free Shipping</dd></div>
          <div className="row"><dt className="Poppins-regular">Shipping to</dt><dd>Address preview</dd></div>
          <div className="row total"><dt className="Poppins-regular">Total</dt><dd>Rs. 490/-</dd></div>
        </dl>
        <button className="placeOrder">Place Order</button>
      </div>
    </aside>
  );
}
