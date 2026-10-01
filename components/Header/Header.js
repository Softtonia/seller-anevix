'use client';
import React, { useState, useEffect } from 'react';
import './Header.css';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Search, 
  LocationOn, 
  FavoriteBorder, 
  ShoppingCartOutlined, 
  PersonOutlined,
  KeyboardArrowDown,
  Menu as MenuIcon,
  Close,
  ChevronRight,
  ChevronLeft,
  GpsFixed,
  Check,
  Inventory2Outlined,
  StorefrontOutlined,
  CardGiftcardOutlined,
  SettingsOutlined,
  HeadphonesOutlined,
  GetAppOutlined,
  LogoutOutlined
} from '@mui/icons-material';
import { authApi } from '@/api/services/auth.service';
import toast from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, Button, TextField, Box, Typography, Skeleton, Menu, MenuItem } from '@mui/material';
import CustomDropdown from '../../utils/CustomDropdown/CustomDropdown';

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const showCategoryNav = pathname === '/';
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('menu');
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [location, setLocation] = useState({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const isLangMenuOpen = Boolean(langAnchorEl);
  const [selectedLang, setSelectedLang] = useState('EN');

  const handleLangClick = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangClose = (lang) => {
    if (typeof lang === 'string') {
      setSelectedLang(lang);
    }
    setLangAnchorEl(null);
  };

  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const isAccountMenuOpen = Boolean(accountAnchorEl);

  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  const handleLogout = async () => {
    setAccountAnchorEl(null);
    try {
      await authApi.logout();
      toast.success('Logged out successfully');
      router.push('/signin');
    } catch (err) {
      console.error(err);
      router.push('/signin');
    }
  };

  useEffect(() => {
    const fetchFastLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data && data.city) {
           setLocation({ name: 'Deliver to', area: `${data.city} ${data.postal || ''}`.trim() });
        } else {
           setLocation({ name: 'Deliver to', area: 'Select Location' });
        }
      } catch (e) {
        setLocation({ name: 'Deliver to', area: 'Select Location' });
      } finally {
        setIsLoadingLocation(false);
      }
    };

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(function(result) {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
              const data = await response.json();
              if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location';
                const postcode = data.address.postcode || '';
                setLocation({ name: 'Deliver to', area: `${city} ${postcode}`.trim() });
                setIsLoadingLocation(false);
              }
            } catch (error) {
              console.error("Error fetching precise location", error);
              fetchFastLocation();
            }
          });
        } else {
          fetchFastLocation();
        }
      });
    } else {
      fetchFastLocation();
    }
  }, []);

  useEffect(() => {
    if (!showCategoryNav) {
      setSidebarOpen(false);
    }
  }, [showCategoryNav]);

  const navItems = [
    'Featured', 'Today Deals', 'Gift Cards', 'Offers', 
    'Buy Again', 'Sell', 'App & extension', 'Anevix Basics', 'Anevix Pay'
  ];

  const categories = [
    { name: 'Home & Garden', image: '/assets/categories/home_garden.png' },
    { name: 'Health & Beauty', image: '/assets/categories/health_beauty.png' },
    { name: 'Electronics & Gadgets', image: '/assets/categories/electronics.png' },
    { name: 'Sports & Fitness', image: '/assets/categories/sports.png' },
    { name: 'Fashion', image: '/assets/categories/fashion.png' },
    { name: 'Groceries', image: '/assets/categories/groceries.png' },
    { name: 'Toys', image: '/assets/categories/toys.png' },
    { name: 'Jewellery', image: '/assets/categories/jewellery.png' },
    { name: 'Bags & Cases', image: '/assets/categories/bags_cases.png' },
    { name: 'Pet Supplies', image: '/assets/categories/pet_supplies.png' },
  ];

  return (
    <>
      <header className="header">
        <div className="container-fluid px-lg-5 px-3">
          {/* Top Bar */}
          <div className="topBar">
            
            <button className="mobileMenuBtn" onClick={() => { setSidebarOpen(true); setDrawerType('menu'); }} style={{ display: 'none', background: 'none', border: 'none', padding: 0, outline: 'none', color: '#000' }}>
              <MenuIcon style={{ fontSize: '32px' }} />
            </button>

            <div className="logoArea">
              <img src="/logo.png" alt="Anevix" />
            </div>

            <div className="locationArea" onClick={() => setLocationModalOpen(true)} style={{ cursor: 'pointer' }}>
              <LocationOn className="locationIcon" />
              <div>
                {isLoadingLocation ? (
                  <>
                    <Skeleton variant="text" width={80} height={15} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width={120} height={15} />
                  </>
                ) : (
                  <>
                    <span className="locationLabel Poppins-regular">{location.name}</span>
                    <span className="locationValue Poppins-regular">{location.area}</span>
                  </>
                )}
              </div>
            </div>

            {/* Desktop Search Area */}
            <div className="searchArea desktopSearchArea">
              <input 
                type="text" 
                className="searchInput" 
                placeholder="Search for products, brands and more" 
              />
              <button className="searchButton">
                <Search style={{fontSize:'32px'}} />
              </button>
            </div>

            <div className="actionArea">
              <div className="langSelector" onClick={handleLangClick}>
                <img src={selectedLang === 'EN' ? 'https://flagcdn.com/w20/in.png' : 'https://flagcdn.com/w20/in.png'} alt="flag" style={{ width: 20, height: 14, objectFit: 'cover', borderRadius: '2px' }} /> {selectedLang} <KeyboardArrowDown fontSize="small" />
              </div>
              
              <CustomDropdown
                anchorEl={langAnchorEl}
                open={isLangMenuOpen}
                onClose={handleLangClose}
              >
                <MenuItem className={`Poppins-regular custom-menu-item ${selectedLang === 'EN' ? 'active' : ''}`} onClick={() => handleLangClose('EN')}>
                  <img src="https://flagcdn.com/w40/in.png" alt="English" style={{ width: 26, height: 18, objectFit: 'cover', borderRadius: '2px' }} /> English {selectedLang === 'EN' && <Check fontSize="small" sx={{ marginLeft: 'auto', color: 'var(--dark-orange)' }} />}
                </MenuItem>
                <MenuItem className={`Poppins-regular custom-menu-item ${selectedLang === 'HI' ? 'active' : ''}`} onClick={() => handleLangClose('HI')}>
                  <img src="https://flagcdn.com/w40/in.png" alt="Hindi" style={{ width: 26, height: 18, objectFit: 'cover', borderRadius: '2px' }} /> Hindi {selectedLang === 'HI' && <Check fontSize="small" sx={{ marginLeft: 'auto', color: 'var(--dark-orange)' }} />}
                </MenuItem>
              </CustomDropdown>

              <div className="iconCircle" onClick={handleAccountClick}>
                <PersonOutlined />
              </div>

              <CustomDropdown
                anchorEl={accountAnchorEl}
                open={isAccountMenuOpen}
                onClose={handleAccountClose}
                width={300}
              >
                <MenuItem className="Poppins-regular custom-menu-item" onClick={() => { handleAccountClose(); router.push('/my-account'); }}>
                  <PersonOutlined fontSize="small" /> My Profile
                </MenuItem>
                <MenuItem className="Poppins-regular custom-menu-item" onClick={() => { handleAccountClose(); router.push('/my-orders'); }}>
                  <Inventory2Outlined fontSize="small" /> Orders
                </MenuItem>
                <MenuItem className="Poppins-regular custom-menu-item" onClick={handleAccountClose}>
                  <SettingsOutlined fontSize="small" /> Settings
                </MenuItem>
                <MenuItem className="Poppins-regular custom-menu-item" onClick={handleAccountClose}>
                  <SettingsOutlined fontSize="small" /> Settings
                </MenuItem>
                <MenuItem className="Poppins-regular custom-menu-item" onClick={handleAccountClose}>
                  <HeadphonesOutlined fontSize="small" /> 24x 7 Customer Care
                </MenuItem>
                <MenuItem className="Poppins-regular custom-menu-item" onClick={handleAccountClose}>
                  <GetAppOutlined fontSize="small" /> Download App
                </MenuItem>
                <MenuItem className="Poppins-regular custom-menu-item logout" onClick={handleLogout}>
                  <LogoutOutlined fontSize="small" /> Logout
                </MenuItem>
              </CustomDropdown>
            </div>

          </div>
        </div>

        {/* Mobile Search Bar (visible only on mobile/tablet) */}
        <div className="mobileSearchArea" style={{ display: 'none' }}>
          <div className="container-fluid px-3">
            <div className="searchArea" style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
              <input 
                type="text" 
                className="searchInput" 
                placeholder="Search for products, brands and more" 
              />
              <button className="searchButton">
                <Search style={{fontSize:'32px'}} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Location Bar (visible only on mobile/tablet) */}
        <div className="mobileLocationBar" onClick={() => setLocationModalOpen(true)} style={{ display: 'none' }}>
          <div className="container-fluid px-3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LocationOn className="mobileLocationIcon" style={{ fontSize: '20px' }} />
            <span className="mobileLocationText Poppins-regular">
              {isLoadingLocation ? 'Loading location...' : `${location.name} ${location.area}`}
            </span>
            <KeyboardArrowDown className="mobileLocationArrow" style={{ fontSize: '20px' }} />
          </div>
        </div>

        {/* Secondary Nav Bar */}
        {showCategoryNav && (
          <nav className="navBar">
            <div className="container-fluid px-lg-5 px-3">
              <ul className="navList">
                <li className="navItem Poppins-regular category-navitem" onClick={() => { setSidebarOpen(true); setDrawerType('categories'); }}>
                  <MenuIcon fontSize="small" /> All Categories
                </li>
                {navItems.map(item => (
                  <li key={item}>
                    <a
                      href={item === 'Sell' ? '/signup?role=business' : '#'}
                      className="navItem Poppins-regular category-navitem"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* Sidebar Overlay */}
      <div 
        className={`drawerOverlay ${isSidebarOpen ? 'overlayVisible' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar Drawer */}
      <div className={`drawer ${isSidebarOpen ? 'drawerOpen' : ''}`}>
        <div className="drawerHeader">
          <div className="drawerProfile">
            {drawerType === 'categories' && (
              <ChevronLeft 
                className="drawerBackBtn" 
                onClick={() => setDrawerType('menu')} 
                style={{ cursor: 'pointer', marginRight: '10px', color: '#fff' }}
              />
            )}
            <PersonOutlined fontSize="large" />
            <span className="Poppins-regular category-sidebar-title">
              {drawerType === 'categories' ? 'All Categories' : 'Hello, Parneet'}
            </span>
          </div>
          <Close className="drawerClose" onClick={() => setSidebarOpen(false)} />
        </div>
        
        <ul className="drawerList">
          {drawerType === 'menu' ? (
            <>
              <li className="drawerListItem" onClick={() => setDrawerType('categories')}>
                <div className="drawerItemContent">
                  <span className="Poppins-regular">All Categories</span>
                </div>
                <ChevronRight fontSize="small" style={{ color: '#aaa' }} />
              </li>
              {navItems.map((item) => (
                <li
                  key={item}
                  className="drawerListItem"
                  onClick={() => {
                    setSidebarOpen(false);
                    if (item === 'Sell') {
                      router.push('/signup?role=business');
                    }
                  }}
                >
                  <div className="drawerItemContent">
                    <span className="Poppins-regular">{item}</span>
                  </div>
                  <ChevronRight fontSize="small" style={{ color: '#aaa' }} />
                </li>
              ))}
            </>
          ) : (
            categories.map((cat) => (
              <li key={cat.name} className="drawerListItem" onClick={() => setSidebarOpen(false)}>
                <div className="drawerItemContent">
                  <div className="drawerIconWrapper">
                    <img 
                      src={`${cat.image}?v=${Date.now()}`} 
                      alt={cat.name} 
                      className="drawerIconImg"
                    />
                  </div>
                  <span className="Poppins-regular">{cat.name}</span>
                </div>
                <ChevronRight fontSize="small" style={{ color: '#aaa' }} />
              </li>
            ))
          )}
        </ul>
      </div>
      {/* Location Modal */}
      <Dialog open={isLocationModalOpen} onClose={() => setLocationModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Choose your location</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Delivery options and delivery speeds may vary for different locations
          </Typography>
          
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<GpsFixed />} 
            onClick={() => {
                if ("geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                            const data = await response.json();
                            if(data && data.address) {
                                const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location';
                                const postcode = data.address.postcode || '';
                                setLocation({ name: 'Deliver to', area: `${city} ${postcode}`.trim() });
                                setLocationModalOpen(false);
                            }
                        } catch (error) {
                            console.error("Error fetching location", error);
                            setLocation({ name: 'Deliver to', area: `Lat: ${latitude.toFixed(2)}, Lng: ${longitude.toFixed(2)}` });
                            setLocationModalOpen(false);
                        }
                    }, (error) => {
                         console.error("Geolocation error:", error);
                         alert("Could not get your location. Please allow location access.");
                    });
                } else {
                    alert("Geolocation is not supported by your browser");
                }
            }}
            sx={{ mb: 3, textTransform: 'none', justifyContent: 'flex-start', py: 1.5, borderColor: '#e0e0e0', color: '#333' }}
          >
            Use browser location
          </Button>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#e0e0e0' }}></Box>
            <Typography variant="body2" color="textSecondary" sx={{ px: 2 }}>
              or enter pincode
            </Typography>
            <Box sx={{ flexGrow: 1, height: '1px', bgcolor: '#e0e0e0' }}></Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
                size="small" 
                placeholder="Enter a pincode" 
                fullWidth 
                id="pincode-input"
                autoComplete="off"
            />
            <Button variant="contained" disableElevation onClick={() => {
                const val = document.getElementById('pincode-input').value;
                if(val) {
                    setLocation({ name: 'Deliver to', area: val });
                    setLocationModalOpen(false);
                }
            }} sx={{ bgcolor: 'var(--dark-orange)', color: '#000', '&:hover': { bgcolor: 'var(--dark-orange-hover)' } }}>
                Apply
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
