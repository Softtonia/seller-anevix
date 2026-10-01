'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/api';
import {
  SearchOutlined,
  FileDownloadOutlined,
  Inventory2Outlined,
  CheckCircleOutlineOutlined,
  WarningAmberOutlined,
  BlockOutlined,
  VisibilityOutlined,
  MoreVertOutlined,
  FilterAltOffOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
  EditOutlined,
  AddCircleOutlineOutlined,
  PauseCircleOutlineOutlined
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import './Inventory.css';

export default function InventoryPage() {
  const [sellerId, setSellerId] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  useEffect(() => {
    const fetchSellerId = async () => {
      try {
        const profileRes = await apiClient.get('/seller/onboarding/profile');
        const id = profileRes.data?.profile?.b2cProfileId || profileRes.data?.b2cProfile?._id || profileRes.data?.profile?._id || profileRes.data?._id;
        if (id) {
          setSellerId(id);
        }
      } catch (err) {
        console.error('Failed to fetch seller profile', err);
      }
    };
    fetchSellerId();
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!sellerId) return;
      setLoading(true);
      try {
        const invRes = await apiClient.get(`/api/inventory/seller?sellerId=${sellerId}&page=${currentPage}&limit=${limit}`);
        
        // Handle variations of API response formats
        const responseData = invRes.data;
        const data = responseData?.data || responseData?.inventory || responseData || [];
        setInventory(Array.isArray(data) ? data : []);
        
        // Check for nested pagination object or root properties
        const pagination = responseData?.pagination || responseData || {};
        
        if (pagination.totalPages) {
          setTotalPages(pagination.totalPages);
        } else {
          setTotalPages(data.length === limit ? currentPage + 1 : currentPage);
        }
        
        if (pagination.totalItems !== undefined) setTotalItems(pagination.totalItems);
        else if (pagination.total !== undefined) setTotalItems(pagination.total);
      } catch (err) {
        console.error('Failed to fetch inventory data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [sellerId, currentPage]);

  const handleStockUpdate = async (catalogId, variantId, newStock) => {
    try {
      await apiClient.put(`/inventory/stock`, {
        catalogId,
        variantId,
        stock_quantity: newStock
      });
      
      const updatedInventory = inventory.map(cat => {
        if (cat._id === catalogId) {
          const updatedVariants = (cat.variants || [cat]).map(v => 
            (v.variantId || v.id || v._id) === variantId ? { ...v, quantity: newStock, stock_quantity: newStock } : v
          );
          return { 
            ...cat, 
            variants: cat.variants ? updatedVariants : undefined,
            quantity: !cat.variants ? newStock : cat.quantity,
            stock_quantity: !cat.variants ? newStock : cat.stock_quantity 
          };
        }
        return cat;
      });
      
      setInventory(updatedInventory);
      toast.success('Stock updated successfully!');
    } catch (err) {
      console.error('Failed to update stock', err);
      toast.error('Failed to update stock');
    }
  };

  // Flatten products and variants for the table
  const tableRows = [];
  inventory.forEach(catalog => {
    const variants = catalog.variants?.length > 0 ? catalog.variants : [catalog];
    variants.forEach((v, idx) => {
      const stock = v.inventory?.stockQuantity ?? v.inventory?.quantity ?? v.quantity ?? v.stock ?? v.stock_quantity ?? 0;
      let status = catalog.status === 'rejected' ? 'rejected' : 'instock';
      let statusText = catalog.status === 'rejected' ? 'Rejected' : 'In Stock';
      if (catalog.status === 'rejected') {} else if (stock === 0) {
        status = 'outstock';
        statusText = 'Out of Stock';
      } else if (stock < (v.lowStockThreshold || 5)) {
        status = 'lowstock';
        statusText = 'Low Stock';
      }

      tableRows.push({
        id: v.variantId || v.id || v._id || catalog._id,
        catalogId: catalog._id,
        productName: catalog.name || catalog.title || 'Product',
        subtitle: v.attributes?.map(a => a.option).join(', ') || 'Pack of 1',
        sku: v.sku || catalog.sku || 'N/A',
        category: catalog.category_name || catalog.categoryName || 'Unknown',
        type: catalog.variants?.length > 0 ? 'Variable' : 'Simple',
        stock: stock,
        available: stock, // assuming available = stock for now
        status,
        statusText,
        image: v.images?.[0] || catalog.thumbnail || '/placeholder.png'
      });
    });
  });

  // Determine overall stats (this might be partial if API only returns current page, but keeping it per page view)
  const totalProductsShown = tableRows.length;
  // If API provided totalItems, use that for the header, else fallback
  const displayTotal = totalItems > 0 ? totalItems : totalProductsShown;
  const inStock = tableRows.filter(r => r.status === 'instock').length;
  const lowStock = tableRows.filter(r => r.status === 'lowstock').length;
  const outOfStock = tableRows.filter(r => r.status === 'outstock').length;

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header-top">
        <div className="inventory-title-wrap">
          <h1>Inventory</h1>
          <p>Track and manage your product stock, quantity and availability in real-time.</p>
        </div>
        <button className="export-btn">
          <FileDownloadOutlined fontSize="small" /> Export Report
        </button>
      </div>



      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-left">
          <div className="search-box">
            <SearchOutlined fontSize="small" style={{ color: '#94a3b8' }} />
            <input type="text" placeholder="Search by product name, SKU or category..." />
          </div>
          <div className="filter-dropdowns">
            <div className="filter-group">
              <span className="filter-label">Category</span>
              <select className="filter-select"><option>All Categories</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Stock Status</span>
              <select className="filter-select"><option>All Status</option></select>
            </div>
            <div className="filter-group">
              <span className="filter-label">Product Type</span>
              <select className="filter-select"><option>All Types</option></select>
            </div>
          </div>
        </div>
        <button className="clear-filters-btn">
          <FilterAltOffOutlined fontSize="small" /> Clear Filters
        </button>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Products ({displayTotal})</h3>
          <div className="sort-group">
            Sort by: 
            <select className="sort-select">
              <option>Newest First</option>
            </select>
          </div>
        </div>
        
        <div className="table-responsive-wrapper" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th><input type="checkbox" className="sku-checkbox" /></th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Type</th>
                <th>Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading inventory...</td></tr>
            ) : tableRows.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No products found.</td></tr>
            ) : (
              tableRows.map((row, idx) => (
                <tr key={idx}>
                  <td><input type="checkbox" className="sku-checkbox" /></td>
                  <td className="product-cell">
                    <img src={row.image} alt={row.productName} className="product-img" />
                    <div className="product-info">
                      <h5>{row.productName}</h5>
                      <p>{row.subtitle}</p>
                    </div>
                  </td>
                  <td>{row.sku}</td>
                  <td>{row.category}</td>
                  <td><span className={`pill ${row.type.toLowerCase()}`}>{row.type}</span></td>
                  <td>{row.available}</td>
                  <td>
                    <span className={`status-pill ${row.status}`}>
                      <span className="status-dot"></span> {row.statusText}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <Link 
                        href={`/business/catalog-upload?tab=single&type=${row.type.toLowerCase()}&editId=${row.catalogId}`}
                        className="action-row-btn"
                        style={{ textDecoration: 'none' }}
                      >
                        <EditOutlined /> Edit
                      </Link>
                      <button 
                        className="action-row-btn"
                        onClick={() => setOpenDropdown(openDropdown === row.id ? null : row.id)}
                      >
                        <MoreVertOutlined /> More
                      </button>
                      
                      {openDropdown === row.id && (
                        <div className="more-dropdown">
                          <button className="dropdown-item">
                            <AddCircleOutlineOutlined /> Add New Variant
                          </button>
                          <button className="dropdown-item">
                            <PauseCircleOutlineOutlined /> Pause
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button 
            className="page-btn" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeftOutlined fontSize="small" />
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className="page-btn"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRightOutlined fontSize="small" />
          </button>
          
          <div className="page-info">
            Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, displayTotal)} of {displayTotal}
          </div>
        </div>
      </div>
    </div>
  );
}
