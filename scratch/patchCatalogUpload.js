const fs = require('fs');
const path = 'd:/anevix-website/app/business/catalog-upload/page.js';

let content = fs.readFileSync(path, 'utf8');

const applySchemaTarget = `      fields: schema.fields
        .filter(f => f.key !== 'sellerId' && f.key !== 'status' && f.key !== 'isActive')
        .map(f => {
          if (f.key === 'cat_id') {
            return { ...f, endpoint: '/api/product-categories/hierarchy-with-guidelines' };
          }
          if (f.key === 'sub_cat_id') {
            return { ...f, endpoint: '/api/product-categories/hierarchy-with-guidelines?parent_id={cat_id}' };
          }
          if (f.key === 'nested_sub_cat_id') {
            return { ...f, endpoint: '/api/product-categories/hierarchy-with-guidelines?parent_id={sub_cat_id}' };
          }
          return f;
        })`;

const applySchemaReplace = `      fields: schema.fields
        .filter(f => f.key !== 'sellerId' && f.key !== 'status' && f.key !== 'isActive')
        .filter(f => f.key !== 'sub_cat_id' && f.key !== 'nested_sub_cat_id') // We will handle all levels dynamically in cat_id
        .map(f => {
          if (f.key === 'cat_id') {
            return { ...f, type: 'dynamic_category', label: 'Product Category Hierarchy' };
          }
          return f;
        })`;

content = content.replace(applySchemaTarget, applySchemaReplace);

const renderTarget = `                      // Render Boolean Switch
                      if (field.type === 'boolean') {`;

const renderReplace = `                      // Render Dynamic Category
                      if (field.type === 'dynamic_category') {
                        return (
                          <DynamicCategorySelector
                            key={field.key}
                            schemaFormData={schemaFormData}
                            setSchemaFormData={setSchemaFormData}
                            setCurrentGuidelines={setCurrentGuidelines}
                          />
                        );
                      }

                      // Render Boolean Switch
                      if (field.type === 'boolean') {`;

content = content.replace(renderTarget, renderReplace);

const componentTarget = `export default function CatalogUploadPage() {`;

const componentReplace = `function DynamicCategorySelector({ schemaFormData, setSchemaFormData, setCurrentGuidelines }) {
  const [levels, setLevels] = useState([{ id: 0, options: [], selected: null, loading: true }]);

  useEffect(() => {
    let active = true;
    apiClient.get('/product-categories/hierarchy-with-guidelines')
      .then(res => {
        if (!active) return;
        const data = res.data?.data || res.data || [];
        const options = data.map(cat => ({
          label: cat.cat_name || cat.name,
          value: cat._id,
          guidelines: cat.guidelines || []
        }));
        setLevels([{ id: 0, options, selected: null, loading: false }]);
      })
      .catch(err => {
        if (!active) return;
        console.error('Failed to load root categories', err);
        setLevels([{ id: 0, options: [], selected: null, loading: false }]);
      });
    return () => { active = false; };
  }, []);

  const handleSelect = async (levelIndex, selectedOption) => {
    const newLevels = levels.slice(0, levelIndex + 1);
    newLevels[levelIndex].selected = selectedOption;

    if (selectedOption?.guidelines?.length > 0) {
      setCurrentGuidelines(selectedOption.guidelines);
    } else {
      setCurrentGuidelines([]);
    }

    setSchemaFormData(prev => {
      const updated = { ...prev };
      updated.cat_id = '';
      updated.sub_cat_id = '';
      updated.nested_sub_cat_id = '';
      
      newLevels.forEach((lvl, idx) => {
        if (!lvl.selected) return;
        if (idx === 0) updated.cat_id = lvl.selected.value;
        else if (idx === 1) updated.sub_cat_id = lvl.selected.value;
        else if (idx === 2) updated.nested_sub_cat_id = lvl.selected.value;
        else updated[\`cat_level_\${idx}\`] = lvl.selected.value;
      });
      return updated;
    });

    if (!selectedOption) {
      setLevels(newLevels);
      return;
    }

    newLevels.push({ id: levelIndex + 1, options: [], selected: null, loading: true });
    setLevels([...newLevels]);

    try {
      const res = await apiClient.get(\`/product-categories/hierarchy-with-guidelines?parent_id=\${selectedOption.value}\`);
      const children = res.data?.data || res.data || [];
      if (children.length > 0) {
        newLevels[levelIndex + 1].options = children.map(cat => ({
          label: cat.cat_name || cat.name,
          value: cat._id,
          guidelines: cat.guidelines || []
        }));
        newLevels[levelIndex + 1].loading = false;
        setLevels([...newLevels]);
      } else {
        newLevels.pop();
        setLevels([...newLevels]);
      }
    } catch (err) {
      console.error('Failed to load subcategories', err);
      newLevels.pop();
      setLevels([...newLevels]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">Product Category Hierarchy <span className="required-star">*</span></label>
      {levels.map((level, index) => (
        <div key={level.id} style={{ marginBottom: index < levels.length - 1 ? '10px' : '0' }}>
          <Autocomplete
            options={level.options}
            getOptionLabel={(option) => option.label || ''}
            value={level.selected}
            onChange={(_e, newValue) => handleSelect(index, newValue)}
            disabled={level.loading}
            isOptionEqualToValue={(option, value) => String(option.value) === String(value.value)}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  mt: '4px',
                  '& .MuiAutocomplete-option': { fontSize: '14px', color: '#0f172a', padding: '10px 14px' },
                  '& .MuiAutocomplete-option[aria-selected="true"]': { backgroundColor: '#fff7ed', color: '#ea580c', fontWeight: 600 },
                  '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': { backgroundColor: '#ffedd5' },
                  '& .MuiAutocomplete-option.Mui-focused': { backgroundColor: '#f8fafc' }
                }
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={level.loading ? "Loading categories..." : (index === 0 ? "Select primary category..." : \`Select level \${index + 1} category...\`)}
                variant="outlined"
                size="small"
                sx={{
                  mt: 0.5,
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', backgroundColor: '#ffffff', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#ea580c', borderWidth: '1px' } },
                  '& .MuiOutlinedInput-input': { fontSize: '14px', color: '#1e293b' }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <SearchOutlined sx={{ color: '#94a3b8', ml: 1, mr: -0.5, fontSize: '20px' }} />
                      {params.InputProps?.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </div>
      ))}
    </div>
  );
}

export default function CatalogUploadPage() {`;

content = content.replace(componentTarget, componentReplace);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched catalog-upload/page.js successfully');
