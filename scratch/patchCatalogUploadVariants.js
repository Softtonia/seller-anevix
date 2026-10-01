const fs = require('fs');
const path = 'd:/anevix-website/app/business/catalog-upload/page.js';

let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('import ProductVariations')) {
  content = content.replace(
    "import { Autocomplete, TextField } from '@mui/material';",
    "import { Autocomplete, TextField } from '@mui/material';\nimport ProductVariations from '@/components/ProductVariations';"
  );
}

// 2. Replace the old variants UI with ProductVariations
const oldUiStart = `                        // Special Case: Attributes Array of Objects [{ name, options: [] }]
                        if (field.itemType === 'object') {`;

const oldUiEndRegex = /                                <button\s+type="button"\s+className="add-attr-btn"\s+onClick=\{\(\) => handleAddAttributeItem\(field\.key\)\}\s+>\s+Add\s+<\/button>\s+<\/div>\s+<\/div>\s+\);\s+\}/;

const match = content.match(oldUiEndRegex);
if (match) {
  const endIndex = match.index + match[0].length;
  const startIndex = content.indexOf(oldUiStart);
  
  if (startIndex !== -1) {
    const oldUiBlock = content.substring(startIndex, endIndex);
    const newUiBlock = `                        // Special Case: Attributes Array of Objects [{ name, options: [] }]
                        if (field.itemType === 'object') {
                          return (
                            <ProductVariations 
                              key={field.key} 
                              schemaFormData={schemaFormData} 
                              setSchemaFormData={setSchemaFormData} 
                            />
                          );
                        }`;
                        
    content = content.replace(oldUiBlock, newUiBlock);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Patched catalog-upload/page.js for ProductVariations');
