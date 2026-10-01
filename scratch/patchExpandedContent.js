const fs = require('fs');
const path = 'd:/anevix-website/components/ProductVariations.jsx';
let content = fs.readFileSync(path, 'utf8');

const expandedStart = '{/* Expanded Content */}';
const expandedEnd = '                  </div>\n                );\n              })}\n            </div>';

const startIndex = content.indexOf(expandedStart);
const endIndex = content.indexOf(expandedEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = `{/* Expanded Content */}
                    {isExpanded && (
                      <div style={styles.variantBody}>
                        {/* Status Checkboxes */}
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!variant.isActive} onChange={(e) => handleVariantCheckboxChange(variant.id, 'isActive', e.target.checked)} style={{ marginRight: '6px' }} />
                            Enabled
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!variant.downloadable} onChange={(e) => handleVariantCheckboxChange(variant.id, 'downloadable', e.target.checked)} style={{ marginRight: '6px' }} />
                            Downloadable
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!variant.virtual} onChange={(e) => handleVariantCheckboxChange(variant.id, 'virtual', e.target.checked)} style={{ marginRight: '6px' }} />
                            Virtual
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!variant.manage_stock} onChange={(e) => handleVariantCheckboxChange(variant.id, 'manage_stock', e.target.checked)} style={{ marginRight: '6px' }} />
                            Manage stock?
                          </label>
                        </div>

                        <div style={styles.gridContainer}>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Variation SKU *</label>
                            <input type="text" style={styles.input} value={variant.sku || ''} onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} placeholder="e.g. VAR-123" />
                          </div>
                          
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Regular Price (₹) *</label>
                            <input type="number" style={styles.input} value={variant.regular_price || ''} onChange={(e) => handleVariantChange(variant.id, 'regular_price', e.target.value)} placeholder="0.00" min="0" />
                          </div>
                          
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Sale Price (₹)</label>
                            <input type="number" style={styles.input} value={variant.sale_price || ''} onChange={(e) => handleVariantChange(variant.id, 'sale_price', e.target.value)} placeholder="0.00" min="0" />
                          </div>

                          {!variant.manage_stock && (
                            <div style={styles.inputGroup}>
                              <label style={styles.label}>Stock status</label>
                              <select style={styles.select} value={variant.stock_status || 'instock'} onChange={(e) => handleVariantChange(variant.id, 'stock_status', e.target.value)}>
                                <option value="instock">In stock</option>
                                <option value="outofstock">Out of stock</option>
                                <option value="onbackorder">On backorder</option>
                              </select>
                            </div>
                          )}

                          {variant.manage_stock && (
                            <>
                              <div style={styles.inputGroup}>
                                <label style={styles.label}>Stock quantity</label>
                                <input type="number" style={styles.input} value={variant.stock_quantity ?? 0} onChange={(e) => handleVariantChange(variant.id, 'stock_quantity', e.target.value)} />
                              </div>
                              <div style={styles.inputGroup}>
                                <label style={styles.label}>Allow backorders?</label>
                                <select style={styles.select} value={variant.backorders || 'no'} onChange={(e) => handleVariantChange(variant.id, 'backorders', e.target.value)}>
                                  <option value="no">Do not allow</option>
                                  <option value="notify">Allow, but notify customer</option>
                                  <option value="yes">Allow</option>
                                </select>
                              </div>
                            </>
                          )}

                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Weight (kg)</label>
                            <input type="number" style={styles.input} value={variant.weight || ''} onChange={(e) => handleVariantChange(variant.id, 'weight', e.target.value)} placeholder="0" min="0" />
                          </div>

                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Shipping class</label>
                            <select style={styles.select} value={variant.shipping_class || 'Same as parent'} onChange={(e) => handleVariantChange(variant.id, 'shipping_class', e.target.value)}>
                              <option value="Same as parent">Same as parent</option>
                            </select>
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
                      </div>
                    )}
`;

  content = content.substring(0, startIndex) + newContent + content.substring(endIndex);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated Expanded Content');
} else {
  console.log('Could not find start or end index for expanded content replacement');
}
