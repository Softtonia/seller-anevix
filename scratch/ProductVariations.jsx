import React, { useState } from 'react';
import { 
  AddOutlined, 
  DeleteOutlineOutlined, 
  ExpandMoreOutlined, 
  ExpandLessOutlined,
  AutoAwesomeOutlined
} from '@mui/icons-material';
import toast from 'react-hot-toast';

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
        regular_price: '',
        sale_price: '',
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
                            <label style={styles.label}>SKU</label>
                            <input 
                              type="text" 
                              style={styles.input}
                              value={variant.sku}
                              onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                              placeholder="Variant SKU"
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Regular Price ($)</label>
                            <input 
                              type="number" 
                              style={styles.input}
                              value={variant.regular_price}
                              onChange={(e) => handleVariantChange(variant.id, 'regular_price', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Sale Price ($)</label>
                            <input 
                              type="number" 
                              style={styles.input}
                              value={variant.sale_price}
                              onChange={(e) => handleVariantChange(variant.id, 'sale_price', e.target.value)}
                              placeholder="0.00"
                            />
                          </div>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Image Upload</label>
                            <input 
                              type="file" 
                              style={styles.fileInput}
                              // Placeholder for actual file handling logic
                              onChange={(e) => console.log('File selected for variant', variant.id)}
                            />
                          </div>
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
