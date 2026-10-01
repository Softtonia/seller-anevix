"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/api";
import "./Products.css";
import {
  CheckCircleOutlineOutlined,
  InsertDriveFileOutlined,
  AccessTimeOutlined,
  ContentCopyOutlined,
  MoreVertOutlined,
  FilterAltOutlined,
  SearchOutlined,
  CheckroomOutlined,
  VisibilityOutlined,
  EditOutlined,
  ErrorOutlineOutlined,
  LaptopChromebookOutlined,
  LocalMallOutlined,
  AddBoxOutlined,
  LayersOutlined,
  KeyboardArrowDownOutlined,
  FileDownloadOutlined,
} from "@mui/icons-material";

export default function ProductListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadBatches, setUploadBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  // Filters State
  const [activeMainTab, setActiveMainTab] = useState("Bulk Uploads");
  const [activeSubTab, setActiveSubTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [singleUploads, setSingleUploads] = useState([]);
  const [batchProducts, setBatchProducts] = useState([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [showRejectedOnly, setShowRejectedOnly] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [bulkTotalItems, setBulkTotalItems] = useState(0);
  const [singleTotalItems, setSingleTotalItems] = useState(0);
  const limit = 10;

  const handleRowClick = async (batch) => {
    if (activeMainTab !== "Bulk Uploads") return;
    
    setSelectedBatch(batch);
    setIsModalOpen(true);
    setIsBatchLoading(true);
    setBatchProducts([]);
    setShowRejectedOnly(batch.status === "rejected");
    
    try {
      const res = await apiClient.get(`/products?batchId=${batch.fileId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.products || [];
      setBatchProducts(data);
    } catch (error) {
      console.error("Failed to fetch batch products", error);
    } finally {
      setIsBatchLoading(false);
    }
  };

  useEffect(() => {
    const fetchSellerProducts = async () => {
      try {
        setLoading(true);
        const profileRes = await apiClient.get("/users/profile");
        const sellerId =
          profileRes.data?.profile?.b2cProfileId ||
          profileRes.data?.b2cProfile?._id ||
          profileRes.data?.profile?._id ||
          profileRes.data?._id;

        if (!sellerId)
          throw new Error("Could not extract Seller ID from profile");

        // Fetch Bulk Uploads
        const bulkRes = await apiClient.get("/products/batches/list", {
          params: { sellerId, uploadType: "bulk", page: currentPage, limit },
        });
        const bulkData = Array.isArray(bulkRes.data) ? bulkRes.data : bulkRes.data?.data || bulkRes.data?.products || [];
        const batches = bulkData.map((b, index) => ({
          ...b,
          sNo: (currentPage - 1) * limit + index + 1,
        }));
        setUploadBatches(batches);
        const bulkPagination = bulkRes.data?.pagination || bulkRes.data || {};
        if (bulkPagination.totalItems !== undefined) setBulkTotalItems(bulkPagination.totalItems);
        else if (bulkPagination.total !== undefined) setBulkTotalItems(bulkPagination.total);

        // Fetch Single Uploads
        const singleRes = await apiClient.get("/products/batches/list", {
          params: { sellerId, uploadType: "single", page: currentPage, limit },
        });
        const singleData = Array.isArray(singleRes.data) ? singleRes.data : singleRes.data?.data || singleRes.data?.products || [];
        const singles = singleData.map((s, index) => ({
          ...s,
          sNo: (currentPage - 1) * limit + index + 1,
        }));
        setSingleUploads(singles);
        const singlePagination = singleRes.data?.pagination || singleRes.data || {};
        if (singlePagination.totalItems !== undefined) setSingleTotalItems(singlePagination.totalItems);
        else if (singlePagination.total !== undefined) setSingleTotalItems(singlePagination.total);

        // Set Pagination Data based on the active tab (API should return totalItems for whichever one you care about, here we assume it's in the response)
        const activeRes = activeMainTab === "Bulk Uploads" ? bulkRes : singleRes;
        const activeDataList = activeMainTab === "Bulk Uploads" ? bulkData : singleData;
        
        const pagination = activeRes.data?.pagination || activeRes.data || {};
        
        if (pagination.totalPages) {
          setTotalPages(pagination.totalPages);
        } else {
          // If no totalPages returned, infer if there's a next page
          setTotalPages(activeDataList.length === limit ? currentPage + 1 : currentPage);
        }
        
        if (pagination.totalItems !== undefined) setTotalItems(pagination.totalItems);
        else if (pagination.total !== undefined) setTotalItems(pagination.total);

      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load products",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSellerProducts();
  }, [currentPage, activeMainTab]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const optionsDate = { day: "numeric", month: "short", year: "2-digit" };
    const datePart = date
      .toLocaleDateString("en-GB", optionsDate)
      .replace(/ /g, " ");

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timePart = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

    return `${datePart.replace(/(\d{2})/, "'$1")} | ${timePart}`;
  };

  const getCategoryIcon = (cat) => {
    const lower = cat?.toLowerCase() || "";
    if (lower.includes("electronic") || lower.includes("laptop"))
      return <LaptopChromebookOutlined sx={{ fontSize: 16 }} />;
    if (lower.includes("bag") || lower.includes("luggage"))
      return <LocalMallOutlined sx={{ fontSize: 16 }} />;
    return <CheckroomOutlined sx={{ fontSize: 16 }} />;
  };

  const activeData = activeMainTab === "Bulk Uploads" ? uploadBatches : singleUploads;

  // Derived state for filtering
  const filteredData = activeData.filter((item) => {
    if (activeSubTab === "QC in Progress" && item.status !== "pending")
      return false;
    if (activeSubTab === "QC Error" && item.status !== "rejected")
      return false;
    if (activeSubTab === "QC Pass" && item.status !== "active") return false;
    if (activeSubTab === "Draft" && item.status !== "draft") return false;
    if (activeSubTab === "Action Required" && item.status !== "rejected")
      return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchTitle = (item.title || item.category || "")
        .toLowerCase()
        .includes(query);
      const matchFileId = (item.fileId || "").toLowerCase().includes(query);
      if (!matchTitle && !matchFileId) return false;
    }

    if (
      selectedCategory !== "All Categories" &&
      item.category !== selectedCategory
    ) {
      return false;
    }

    return true;
  });

  const categories = [
    "All Categories",
    ...new Set(activeData.map((b) => b.category).filter(Boolean)),
  ];

  const counts = {
    All: activeData.length,
    "Action Required": activeData.filter((b) => b.status === "rejected")
      .length,
    "QC in Progress": activeData.filter((b) => b.status === "pending")
      .length,
    "QC Error": activeData.filter((b) => b.status === "rejected").length,
    "QC Pass": activeData.filter((b) => b.status === "active").length,
    Draft: activeData.filter((b) => b.status === "draft").length,
  };

  return (
    <div className="product-listing-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <div className="catalog-mode-tabs" style={{ margin: 0, position: 'relative' }}>
          <div
            className="catalog-tab-btn active"
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            style={{ cursor: 'pointer' }}
          >
            <AddBoxOutlined fontSize="small" />
            Add Single Product
            <KeyboardArrowDownOutlined fontSize="small" style={{ marginLeft: '4px' }} />
          </div>
          {addMenuOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, minWidth: '100%', overflow: 'hidden' }}>
              {['simple', 'variable', 'grouped', 'external'].map(type => (
                <Link key={type} href={{ pathname: '/business/catalog-upload', query: { tab: 'single', type: type } }} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: '#1e293b', textDecoration: 'none', borderBottom: '1px solid #f1f5f9', textTransform: 'capitalize' }}>
                  {type} Product
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/business/catalog-upload?tab=bulk"
            className="catalog-tab-btn"
          >
            <LayersOutlined fontSize="small" />
            Bulk Catalog Upload
          </Link>
        </div>
      </div>
      <div className="sh-tabs-container">
        <div className="sh-main-tabs">
          <button
            className={`sh-main-tab ${activeMainTab === "Bulk Uploads" ? "active" : ""}`}
            onClick={() => { setActiveMainTab("Bulk Uploads"); setCurrentPage(1); }}
          >
            Bulk Uploads ({bulkTotalItems || uploadBatches.length})
          </button>
          <button
            className={`sh-main-tab ${activeMainTab === "Single Uploads" ? "active" : ""}`}
            onClick={() => { setActiveMainTab("Single Uploads"); setCurrentPage(1); }}
          >
            Single Uploads ({singleTotalItems || singleUploads.length})
          </button>
        </div>
        <div className="sh-sub-tabs">
          {[
            "All",
            "Action Required",
            "QC in Progress",
            "QC Error",
            "QC Pass",
            "Draft",
          ].map((tab) => (
            <button
              key={tab}
              className={`sh-sub-tab ${activeSubTab === tab ? "active" : ""}`}
              onClick={() => setActiveSubTab(tab)}
            >
              {tab} ({counts[tab] || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="sh-toolbar">
        <div className="sh-search-box">
          <SearchOutlined className="sh-search-icon" />
          <input
            type="text"
            placeholder="Search by catalog name, file ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sh-filters">
          <select
            className="sh-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select className="sh-select">
            <option>All Status</option>
          </select>
          <button
            className="sh-clear-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All Categories");
              setActiveSubTab("All");
            }}
          >
            <FilterAltOutlined sx={{ fontSize: 16 }} /> Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading catalog data...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : activeData.length === 0 ? (
        <div className="empty-state">
          <h2>No Catalogs Uploaded</h2>
          <p>You haven't uploaded any products yet.</p>
        </div>
      ) : (
        <div className="catalog-table-container">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Catalog / Product Preview</th>
                <th>Category</th>
                <th>File ID</th>
                <th>Created Date</th>
                <th>Products</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((batch) => (
                <tr 
                  key={batch.id} 
                  onClick={() => handleRowClick(batch)}
                  style={{ cursor: activeMainTab === "Bulk Uploads" ? "pointer" : "default" }}
                >
                  <td>{batch.sNo}</td>
                  <td>
                    <div className="sh-catalog-preview">
                      <div className="sh-catalog-img-wrapper">
                        <img
                          src={batch.image}
                          alt="Catalog"
                          className="sh-catalog-img"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/60?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="sh-catalog-info">
                        <strong className="sh-catalog-title">
                          {batch.title || `${batch.category} Collection`}
                        </strong>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="sh-category-cell">
                      <div className="sh-cat-text">
                        <span>{batch.category} &gt;</span>
                        <span className="sh-cat-sub">
                          {batch.category === "Electronics"
                            ? "Mobiles & Accessories >"
                            : "Men's Clothing >"}
                        </span>
                        <span className="sh-cat-sub">
                          {batch.category === "Electronics"
                            ? "Laptops"
                            : "T-Shirts"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="sh-fileid-cell">{batch.fileId}</div>
                  </td>
                  <td>
                    <div className="sh-date-cell">
                      {formatDate(batch.createdDateRaw)
                        .split(" | ")
                        .map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                    </div>
                  </td>
                  <td>{batch.productsCount}</td>
                  <td>
                    {batch.status === "active" ? (
                      <span className="sh-qc-pill qc-pass">
                        <CheckCircleOutlineOutlined
                          sx={{ fontSize: 14, mr: 0.5 }}
                        />{" "}
                        QC Passed ({batch.activeCount || batch.productsCount} Products)
                      </span>
                    ) : batch.status === "pending" ? (
                      <span className="sh-qc-pill qc-pending">
                        <AccessTimeOutlined sx={{ fontSize: 14, mr: 0.5 }} />{" "}
                        QC in Progress ({batch.pendingCount || 0} Pending)
                      </span>
                    ) : batch.status === "rejected" ? (
                      <div className="sh-qc-failed-container">
                        <span className="sh-qc-pill qc-failed">
                          <ErrorOutlineOutlined
                            sx={{ fontSize: 14, mr: 0.5 }}
                          />{" "}
                          QC Error ({batch.rejectedCount || 0} Rejected, {batch.activeCount || 0} Passed)
                        </span>
                      </div>
                    ) : (
                      <span className="sh-qc-pill qc-draft">
                        <InsertDriveFileOutlined
                          sx={{ fontSize: 14, mr: 0.5 }}
                        />{" "}
                        Draft
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="sh-actions-cell" style={{ display: 'flex', gap: '8px' }}>
                      {batch.status === "rejected" && batch.rejection_reason && (
                        <button
                          className="sh-action-btn secondary"
                          style={{ border: '1px solid #4f46e5', color: '#4f46e5', background: 'transparent' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const element = document.createElement("a");
                            const file = new Blob([batch.rejection_reason], {type: 'text/plain'});
                            element.href = URL.createObjectURL(file);
                            element.download = `rejection_reason_${batch.batchId || batch._id || 'catalog'}.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                        >
                          <FileDownloadOutlined sx={{ fontSize: 16, mr: 0.5 }} /> Download Reason
                        </button>
                      )}
                      {batch.status !== "rejected" && (
                        <button
                          className="sh-action-btn primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (batch.status === "active") {
                              router.push('/business/inventory');
                            } else if (activeMainTab === "Bulk Uploads") {
                              handleRowClick(batch);
                            } else {
                              setSelectedBatch(batch);
                              setIsModalOpen(true);
                            }
                          }}
                        >
                          {batch.status === "active" ? (
                            <>
                              <VisibilityOutlined sx={{ fontSize: 16, mr: 0.5 }} /> View
                              Catalog
                            </>
                          ) : (
                            <>
                              <EditOutlined sx={{ fontSize: 16, mr: 0.5 }} /> Edit Catalog
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="sh-pagination-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
            <div className="sh-pagination-info" style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {filteredData.length > 0 ? (currentPage - 1) * limit + 1 : 0}-
              {Math.min(currentPage * limit, totalItems || filteredData.length)} of {totalItems || filteredData.length} catalogs
            </div>
            <div className="sh-pagination-controls" style={{ display: 'flex', gap: '4px' }}>
              <button 
                className={`sh-page-btn ${currentPage === 1 ? 'disabled' : ''}`} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button 
                  key={page}
                  className={`sh-page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  style={{ 
                    padding: '6px 12px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    background: currentPage === page ? '#4f46e5' : 'white',
                    color: currentPage === page ? 'white' : '#475569'
                  }}
                >
                  {page}
                </button>
              ))}

              <button 
                className={`sh-page-btn ${currentPage >= totalPages ? 'disabled' : ''}`}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedBatch && (
        <div className="modal-overlay">
          <div className="modal-content catalog-modal">
            <div className="modal-header">
              <h3>Catalogs</h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-batch-info" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p>
                    <strong>Category:</strong> {selectedBatch.category}
                  </p>
                  <p>
                    <strong>File Id:</strong> {selectedBatch.fileId}
                  </p>
                </div>
                {selectedBatch.status === "rejected" && (
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                    <input 
                      type="checkbox" 
                      checked={showRejectedOnly} 
                      onChange={(e) => setShowRejectedOnly(e.target.checked)} 
                    />
                    Show rejected products only
                  </label>
                )}
              </div>

              {isBatchLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  Loading products...
                </div>
              ) : (
                <div className="modal-products-list" style={{ marginTop: "1rem" }}>
                  <table className="catalog-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                        <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>S.No</th>
                        <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Product Name</th>
                        <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>SKU</th>
                        <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batchProducts.length > 0 ? (
                        batchProducts
                          .filter(product => !showRejectedOnly || product.status === "rejected")
                          .map((product, idx) => (
                            <React.Fragment key={product._id || idx}>
                              <tr style={{ backgroundColor: product.status === "rejected" ? "#ffebee" : "transparent" }}>
                              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{idx + 1}</td>
                              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{product.name || product.title}</td>
                              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>{product.sku || product.sellerSku || "N/A"}</td>
                              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                                <span style={{ 
                                  color: product.status === "rejected" ? "#d32f2f" : 
                                         product.status === "active" ? "#2e7d32" : "#ed6c02",
                                  fontWeight: 500 
                                }}>
                                  {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : "Unknown"}
                                </span>
                              </td>
                            </tr>
                            {product.status === "rejected" && (product.approval?.rejection_reason || product.rejection_reason) && (
                              <tr style={{ backgroundColor: "#ffebee" }}>
                                <td colSpan={4} style={{ padding: "8px 10px", borderBottom: "1px solid #ddd", color: "#d32f2f", fontSize: "0.85rem" }}>
                                  <strong>Reason:</strong> {product.approval?.rejection_reason || product.rejection_reason}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} style={{ padding: "20px", textAlign: "center" }}>No products found in this batch.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
