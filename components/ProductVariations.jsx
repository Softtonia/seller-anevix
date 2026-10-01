import React, { useState } from 'react';
import { 
  AddOutlined, 
  DeleteOutlineOutlined, 
  ExpandMoreOutlined, 
  ExpandLessOutlined,
  AutoAwesomeOutlined
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import HsnAutocompleteSelect from './HsnAutocompleteSelect';
import { uploadService } from '@/api';

const ProductVariations = ({ schemaFormData = {}, setSchemaFormData, forcedTab }) => {
  const attributes = Array.isArray(schemaFormData?.attributes) ? schemaFormData.attributes : [];
  const variants = Array.isArray(schemaFormData?.variants) ? schemaFormData.variants : [];
  const setAttributes = (newAttrs) => setSchemaFormData(prev => ({ ...prev, attributes: newAttrs }));
  const setVariants = (newVars) => setSchemaFormData(prev => ({ ...prev, variants: newVars }));
  const [internalTab, setInternalTab] = useState('attributes');
  const activeTab = forcedTab || internalTab;
  
  
  const [expandedVariantId, setExpandedVariantId] = useState(null);

  // --- ATTRIBUTE HANDLERS ---
  const handleAddAttribute = () => {
    setAttributes([...attributes, { id: Date.now(), name: '', optionsStr: '', options: [] }]);
  };

  const handleRemoveAttribute = (id) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
  };

  const handleAttributeChange = (id, field, value) => {
    setAttributes(attributes.map(attr => {
      if (attr.id === id) {
        const updated = { ...attr, [field]: value };
        if (field === 'optionsStr') {
          // Parse comma-separated options
          updated.options = value.split(',')
            .map(opt => opt.trim())
            .filter(opt => opt !== '');
        }
        return updated;
      }
      return attr;
    }));
  };

  // --- VARIATION HANDLERS ---
  const generateVariations = () => {
    // Filter out empty attributes
    const validAttributes = attributes.filter(attr => attr.name.trim() !== '' && attr.options.length > 0);
    
    if (validAttributes.length === 0) {
      alert('Please define at least one attribute with options first.');
      return;
    }

    // Cartesian product function
    const cartesian = (arrays) => {
      return arrays.reduce((acc, curr) => {
        return acc.flatMap(c => curr.map(n => [...c, n]));
      }, [[]]);
    };

    const optionsArrays = validAttributes.map(attr => attr.options);
    const combinations = cartesian(optionsArrays);

    const newVariants = combinations.map((combo, index) => {
      const variantAttributes = combo.map((option, i) => ({
        name: validAttributes[i].name,
        option: option
      }));

      return {
        id: `variant_${Date.now()}_${index}`,
        sku: '',
        hsnCode: '',
        isActive: true,
        downloadable: false,
        virtual: false,
        manage_stock: false,
        mrp_price: '',
        anevix_price: '',
        sale_price: '',
        stock_status: 'instock',
        stock_quantity: 0,
        backorders: 'no',
        dimensions: { length: '', width: '', height: '' },
        description: '',
        images: [],
        attributes: variantAttributes,
      };
    });

    setVariants(newVariants);
    setInternalTab('variations');
    toast.success('Generated successfully');
  };

  const handleRemoveVariant = (id) => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleVariantChange = (id, field, value) => {
    setVariants(variants.map(v => {
      if (v.id === id) {
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  const handleVariantCheckboxChange = (id, field, checked) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: checked } : v));
  };

  const handleVariantDimensionChange = (id, field, value) => {
    setVariants(variants.map(v => {
      if (v.id === id) {
        return { ...v, dimensions: { ...(v.dimensions || {}), [field]: value } };
      }
      return v;
    }));
  };

  const handleVariantAttributeChange = (variantId, attrName, newOption) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        const updatedAttributes = v.attributes.map(attr => 
          attr.name === attrName ? { ...attr, option: newOption } : attr
        );
        return { ...v, attributes: updatedAttributes };
      }
      return v;
    }));
  };

  const handleVariantImageUpload = async (variantId, file) => {
    if (!file) return;
    try {
      toast.loading('Uploading variation image...', { id: `upload-${variantId}` });
      const formData = new FormData();
      formData.append('images', file);
      
      const res = await uploadService.uploadBatch(formData);
      const resData = res?.data || res;
      const uploadedImages = resData?.images || [];
      
      if (uploadedImages.length > 0) {
        setVariants(variants.map(v => {
          if (v.id === variantId) {
            return { ...v, images: [...(v.images || []), ...uploadedImages] };
          }
          return v;
        }));
        toast.success('Variation image uploaded!', { id: `upload-${variantId}` });
      } else {
        toast.error('No image returned from server', { id: `upload-${variantId}` });
      }
    } catch (err) {
      console.error('Variation image upload failed:', err);
      toast.error('Failed to upload image', { id: `upload-${variantId}` });
    }
  };

  return (
    <div style={styles.container}>
      {/* TABS - Only show if forcedTab is not provided */}
      {!forcedTab && (
        <div style={styles.tabs}>
          <button type="button"
            style={{ ...styles.tabBtn, ...(activeTab === 'attributes' ? styles.activeTab : {}) }}
            onClick={() => setInternalTab('attributes')}
          >
            Attributes ({attributes.length})
          </button>
          <button type="button"
            style={{ ...styles.tabBtn, ...(activeTab === 'variations' ? styles.activeTab : {}) }}
            onClick={() => setInternalTab('variations')}
          >
            Variations ({variants.length})
          </button>
        </div>
      )}

      {/* ATTRIBUTES SECTION */}
      {activeTab === 'attributes' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.heading}>Product Attributes</h3>
            <button type="button" style={styles.primaryBtn} onClick={handleAddAttribute}>
              <AddOutlined fontSize="small" style={{ marginRight: 4 }}/> Add Attribute
            </button>
          </div>
          
          {attributes.length === 0 ? (
            <div style={styles.emptyState}>No attributes defined yet. Click "Add Attribute" to start.</div>
          ) : (
            <div style={styles.attributeList}>
              {attributes.map((attr, index) => (
                <div key={attr.id} style={styles.attributeCard}>
                  <div style={styles.attributeRow}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Name (e.g. Size)</label>
                      <input 
                        type="text" 
                        style={styles.input}
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(attr.id, 'name', e.target.value)}
                        placeholder="Attribute Name"
                      />
                    </div>
                    <div style={{ ...styles.inputGroup, flex: 2 }}>
                      <label style={styles.label}>Values (Comma separated)</label>
                      <input 
                        type="text" 
                        style={styles.input}
                        value={attr.optionsStr}
                        onChange={(e) => handleAttributeChange(attr.id, 'optionsStr', e.target.value)}
                        placeholder="Small, Medium, Large"
                      />
                    </div>
                    <button type="button"
                      style={styles.iconBtn} 
                      onClick={() => handleRemoveAttribute(attr.id)}
                      title="Remove Attribute"
                    >
                      <DeleteOutlineOutlined />
                    </button>
                  </div>
                  
                  {/* Live Tags Preview */}
                  {attr.options.length > 0 && (
                    <div style={styles.tagsContainer}>
                      {attr.options.map((opt, i) => (
                        <span key={i} style={styles.tag}>{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {attributes.length > 0 && (
            <div style={styles.generateActionRow}>
              <button type="button" style={styles.actionBtn} onClick={generateVariations}>
                <AutoAwesomeOutlined fontSize="small" style={{ marginRight: 6 }}/>
                Generate Variations
              </button>
            </div>
          )}
        </div>
      )}

      {/* VARIATIONS SECTION */}
      {activeTab === 'variations' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.heading}>Generated Variations</h3>
            {variants.length > 0 && (
              <button type="button" style={styles.actionBtn} onClick={generateVariations}>
                Regenerate All
              </button>
            )}
          </div>

          {variants.length === 0 ? (
            <div style={styles.emptyState}>No variations generated yet.</div>
          ) : (
            <div style={styles.variantList}>
              {variants.map((variant, index) => {
                const isExpanded = expandedVariantId === variant.id;
                
                return (
                  <div key={variant.id} style={styles.variantCard}>
                    {/* Header */}
                    <div style={styles.variantHeader}>
                      <span style={styles.variantIndex}>#{index + 1}</span>
                      
                      <div style={styles.variantDropdowns}>
                        {variant.attributes.map((attr, i) => {
                          // Find original attribute to get all options for dropdown
                          const parentAttr = attributes.find(a => a.name === attr.name);
                          const allOptions = parentAttr ? parentAttr.options : [attr.option];
                          
                          return (
                            <select 
                              key={i} 
                              style={styles.select}
                              value={attr.option}
                              onChange={(e) => handleVariantAttributeChange(variant.id, attr.name, e.target.value)}
                            >
                              {allOptions.map((opt, j) => (
                                <option key={j} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )
                        })}
                      </div>

                      <div style={styles.variantHeaderActions}>
                        <button type="button"
                          style={styles.expandBtn} 
                          onClick={() => setExpandedVariantId(isExpanded ? null : variant.id)}
                        >
                          {isExpanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                        </button>
                        <button type="button"
                          style={styles.iconBtn} 
                          onClick={() => handleRemoveVariant(variant.id)}
                          title="Remove Variant"
                        >
                          <DeleteOutlineOutlined />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={styles.variantBody}>
                        <div style={styles.gridContainer}>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>MRP Price (₹) *</label>
                            <input type="number" style={styles.input} value={variant.mrp_price || ''} onChange={(e) => handleVariantChange(variant.id, 'mrp_price', e.target.value)} placeholder="0.00" min="0" />
                          </div>
                          
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Anevix Price (₹)</label>
                            <input type="number" style={styles.input} value={variant.anevix_price || ''} onChange={(e) => handleVariantChange(variant.id, 'anevix_price', e.target.value)} placeholder="0.00" min="0" />
                          </div>
                          
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Sale Price (₹)</label>
                            <input type="number" style={styles.input} value={variant.sale_price || ''} onChange={(e) => handleVariantChange(variant.id, 'sale_price', e.target.value)} placeholder="0.00" min="0" />
                          </div>

                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Stock Quantity</label>
                            <input type="number" style={styles.input} value={variant.stock_quantity || ''} onChange={(e) => handleVariantChange(variant.id, 'stock_quantity', e.target.value)} placeholder="0" min="0" />
                          </div>
                        </div>

                        {/* Dimensions Row */}
                        <div style={{ marginTop: '15px' }}>
                          <label style={styles.label}>Dimensions (L×W×H) (cm)</label>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input type="number" style={styles.input} value={variant.dimensions?.length || ''} onChange={(e) => handleVariantDimensionChange(variant.id, 'length', e.target.value)} placeholder="Length" />
                            <input type="number" style={styles.input} value={variant.dimensions?.width || ''} onChange={(e) => handleVariantDimensionChange(variant.id, 'width', e.target.value)} placeholder="Width" />
                            <input type="number" style={styles.input} value={variant.dimensions?.height || ''} onChange={(e) => handleVariantDimensionChange(variant.id, 'height', e.target.value)} placeholder="Height" />
                          </div>
                        </div>

                        {/* Description */}
                        <div style={{ marginTop: '15px' }}>
                          <label style={styles.label}>Description</label>
                          <textarea style={{ ...styles.input, height: '60px', resize: 'vertical' }} value={variant.description || ''} onChange={(e) => handleVariantChange(variant.id, 'description', e.target.value)} placeholder="Variation description..."></textarea>
                        </div>

                        {/* Image Upload Placeholder */}
                        <div style={{ marginTop: '15px' }}>
                          <label style={styles.label}>Variation Image Upload</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            style={styles.fileInput || { ...styles.input, padding: '4px' }}
                            onChange={(e) => {
                              handleVariantImageUpload(variant.id, e.target.files[0]);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    fontFamily: 'Inter, system-ui, sans-serif',
    marginTop: '20px'
  },
  tabs: {
    display: 'flex',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  tabBtn: {
    padding: '14px 24px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  activeTab: {
    color: '#ea580c',
    borderBottom: '2px solid #ea580c',
    backgroundColor: '#fff',
  },
  section: {
    padding: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  heading: {
    margin: 0,
    fontSize: '16px',
    color: '#0f172a',
    fontWeight: 600,
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ea580c',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
  },
  attributeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  attributeCard: {
    padding: '16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  attributeRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-end',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#475569',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
  },
  fileInput: {
    padding: '7px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    background: '#fff',
  },
  select: {
    padding: '6px 28px 6px 10px',
    border: '1px solid #cbd5e1',
    borderRadius: '4px',
    fontSize: '13px',
    background: '#fff',
    outline: 'none',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '12px',
  },
  tag: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    padding: '4px 10px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 500,
  },
  generateActionRow: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '20px',
  },
  variantList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  variantCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  variantHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    gap: '16px',
  },
  variantIndex: {
    fontWeight: 600,
    color: '#94a3b8',
    fontSize: '13px',
    minWidth: '30px',
  },
  variantDropdowns: {
    display: 'flex',
    flex: 1,
    gap: '12px',
    flexWrap: 'wrap',
  },
  variantHeaderActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  variantBody: {
    padding: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  }
};

export default ProductVariations;
