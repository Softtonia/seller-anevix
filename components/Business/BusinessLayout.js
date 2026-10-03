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
import { SellerProvider, useSeller } from '@/contexts/SellerContext';
import './BusinessSidebar.css';

function SidebarUserCard({ user, userInitials }) {
  const { sellerProfile } = useSeller();
  const displayImage = sellerProfile?.profileImage || user.profileImage;
  
  return (
    <Link href="/business/onboarding/profile" className="sidebar-user-card" style={{ textDecoration: 'none', display: 'flex', color: 'inherit' }}>
      <div className="sidebar-user-avatar" style={{ overflow: 'hidden' }}>
        {displayImage ? (
           <><img src={displayImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
           <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
             {userInitials}
           </div></>
        ) : (
           <>{userInitials}</>
        )}
      </div>
      <div className="sidebar-user-info">
        <div className="sidebar-user-name">
          {user.firstName || user.name || 'Seller Partner'} {user.lastName || ''}
        </div>
        <div className="sidebar-user-role">{user.email || 'Anevix Merchant'}</div>
      </div>
    </Link>
  );
}

function InnerLayout({ children, pathname, collapsed, setCollapsed, mobileOpen, user, userInitials, handleLogout, navItems }) {
  const { sellerProfile, isLoading } = useSeller();
  
  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f8fafc' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const status = sellerProfile?.onboardingStatus || sellerProfile?.status;
  if (pathname === '/business/dashboard' && (status === 'UNDER_REVIEW' || status === 'REJECTED' || status === 'PENDING' || status === 'IN_PROGRESS' || status === 'DRAFT')) {
    return children;
  }

  return (
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
            <SidebarUserCard user={user} userInitials={userInitials} />
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
  );
}

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
      <InnerLayout pathname={pathname} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} user={user} userInitials={userInitials} handleLogout={handleLogout} navItems={navItems}>
        {children}
      </InnerLayout>
    </SellerProvider>
  );
}
