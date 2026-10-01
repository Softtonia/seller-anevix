'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  PeopleAltOutlined,
  BarChartOutlined,
  SettingsOutlined,
  StorefrontOutlined,
  LogoutOutlined,
  MenuOpenOutlined,
  MenuOutlined,
  NotificationsNoneOutlined,
  LocalOfferOutlined,
  ArrowBackOutlined,
  CloudUploadOutlined,
  AssignmentTurnedInOutlined,
} from '@mui/icons-material';
import { authApi } from '@/api/services/auth.service';
import { SellerProvider } from '@/contexts/SellerContext';
import './BusinessSidebar.css';

export default function BusinessLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState({ firstName: 'Seller', lastName: 'Partner', email: 'seller@anevix.com' });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // ignore JSON parse error
    }
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/signin');
  };

  const navItems = [
    { label: 'Dashboard', path: '/business/dashboard', icon: <DashboardOutlined className="sidebar-nav-icon" /> },
    { label: 'My Products', path: '/business/products', icon: <Inventory2Outlined className="sidebar-nav-icon" /> },
    { label: 'Inventory', path: '/business/inventory', icon: <AssignmentTurnedInOutlined className="sidebar-nav-icon" /> },
    { label: 'Orders & Shipments', path: '/business/orders', icon: <ShoppingCartOutlined className="sidebar-nav-icon" /> },
    { label: 'Promotions & Deals', path: '/business/promotions', icon: <LocalOfferOutlined className="sidebar-nav-icon" /> },
    { label: 'Analytics & Revenue', path: '/business/analytics', icon: <BarChartOutlined className="sidebar-nav-icon" /> },
    { label: 'Customers', path: '/business/customers', icon: <PeopleAltOutlined className="sidebar-nav-icon" /> },
    { label: 'Store Settings', path: '/business/settings', icon: <SettingsOutlined className="sidebar-nav-icon" /> },
  ];

  const userInitials = (
    (user.firstName?.[0] || 'S') + (user.lastName?.[0] || 'P')
  ).toUpperCase();

  if (pathname === '/business/onboarding') {
    return (
      <SellerProvider>
        <div style={{ minHeight: '100vh', width: '100vw', margin: 0, padding: 0, backgroundColor: '#f8fafc', overflowX: 'hidden', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
          {children}
        </div>
      </SellerProvider>
    );
  }

  return (
    <SellerProvider>
      <div className="business-layout">
      {/* Sidebar */}
      <aside className={`business-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/business/dashboard" className="sidebar-brand">
            <img src="/logo.png" alt="Anevix Seller Hub" className="sidebar-brand-img" onError={(e) => { e.target.style.display = 'none'; }} />
            {!collapsed && (
              <span className="sidebar-brand-text">
                Anevix <span className="sidebar-brand-badge">Seller</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <MenuOutlined fontSize="small" /> : <MenuOpenOutlined fontSize="small" />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section-title">
            {!collapsed ? 'Store Management' : '•••'}
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span className="sidebar-nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="sidebar-nav-item" title={collapsed ? 'Back to Store' : undefined}>
            <StorefrontOutlined className="sidebar-nav-icon" />
            {!collapsed && <span className="sidebar-nav-label">View Storefront</span>}
          </Link>

          {!collapsed && (
            <div className="sidebar-user-card">
              <div className="sidebar-user-avatar">{userInitials}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">
                  {user.firstName || user.name || 'Seller Partner'} {user.lastName || ''}
                </div>
                <div className="sidebar-user-role">{user.email || 'Anevix Merchant'}</div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="sidebar-nav-item"
            onClick={handleLogout}
            style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogoutOutlined className="sidebar-nav-icon" style={{ color: '#ef4444' }} />
            {!collapsed && <span className="sidebar-nav-label" style={{ color: '#ef4444' }}>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`business-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="business-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Seller Hub</h1>
          </div>
          <div className="topbar-right">
            <Link href="/" className="topbar-action-btn">
              <ArrowBackOutlined fontSize="small" /> Storefront
            </Link>
            <Link href="/business/catalog-upload" className="topbar-action-btn primary">
              + Add Product
            </Link>
          </div>
        </header>

          <div className="business-content">
            {children}
          </div>
        </div>
      </div>
    </SellerProvider>
  );
}
