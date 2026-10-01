'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUpOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  AttachMoneyOutlined,
  PeopleAltOutlined,
  CheckCircle,
  AddCircleOutlineOutlined,
  StorefrontOutlined,
  ArrowForwardOutlined,
} from '@mui/icons-material';
import './Dashboard.css';

export default function BusinessDashboardPage() {
  const [user, setUser] = useState({ firstName: 'Seller', lastName: '' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹0.00',
      trend: '+0% this month',
      type: 'revenue',
      icon: <AttachMoneyOutlined />,
    },
    {
      title: 'Total Orders',
      value: '0',
      trend: '0 pending shipments',
      type: 'orders',
      icon: <ShoppingCartOutlined />,
    },
    {
      title: 'Live Products',
      value: '0',
      trend: 'Ready to add products',
      type: 'products',
      icon: <Inventory2Outlined />,
    },
    {
      title: 'Customer Reach',
      value: '0',
      trend: 'New store',
      type: 'customers',
      icon: <PeopleAltOutlined />,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome to your Seller Hub, {user.firstName || 'Merchant'}!</h2>
          <p>
            Your seller registration is complete. Start uploading your catalog to start receiving orders across India.
          </p>
        </div>
        <div className="welcome-actions">
          <Link href="/business/catalog-upload" className="welcome-btn primary">
            <AddCircleOutlineOutlined fontSize="small" /> Add First Product
          </Link>
          <Link href="/" className="welcome-btn secondary">
            <StorefrontOutlined fontSize="small" /> Visit Store
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className={`stat-icon-wrapper ${stat.type}`}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-trend">{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Orders & Onboarding Steps */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <Link href="/business/orders" className="card-link">
              View All <ArrowForwardOutlined fontSize="small" style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          <div className="empty-state-box">
            <ShoppingCartOutlined className="empty-state-icon" />
            <div className="empty-state-title">No orders yet</div>
            <p className="empty-state-desc">
              When customers purchase your listed items, orders will appear here for processing and fulfillment.
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Store Setup Checklist</h3>
            <Link href="/business/onboarding" className="card-link">
              Continue Setup →
            </Link>
          </div>
          <div className="checklist-list">
            <div className="checklist-item">
              <span className="checklist-bullet completed">✓</span>
              <span>Register Seller Account</span>
            </div>
            <Link href="/business/onboarding" className="checklist-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="checklist-bullet" style={{ background: '#ff8c00', color: '#fff' }}>1</span>
              <span style={{ fontWeight: 600, color: '#ff8c00' }}>Complete Your Profile (Business & GST) →</span>
            </Link>
            <div className="checklist-item">
              <span className="checklist-bullet">2</span>
              <span>Set Up Shipping & Pickup Address</span>
            </div>
            <div className="checklist-item">
              <span className="checklist-bullet">3</span>
              <span>Verify Bank Details for Payouts</span>
            </div>
            <div className="checklist-item">
              <span className="checklist-bullet">4</span>
              <span>Add Your First Product Listing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
