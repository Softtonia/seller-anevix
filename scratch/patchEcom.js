const fs = require('fs');
const path = 'd:/anevix-ecom/src/controllers/product/productController.js';

let content = fs.readFileSync(path, 'utf8');

const target1 = `      query.sellerId = req.query.seller;
    }

    const products = await Product.find(query)`;

const replace1 = `      query.sellerId = req.query.seller;
    }

    // Add batchId filter if provided
    if (req.query.batchId) {
      query.batchId = req.query.batchId;
    }

    const products = await Product.find(query)`;

content = content.replace(target1, replace1);

const target2 = `    if (req.query.status) {
      query.status = req.query.status;
    }

    const products = await Product.find(query)`;

const replace2 = `    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.batchId) {
      query.batchId = req.query.batchId;
    }

    const products = await Product.find(query)`;

content = content.replace(target2, replace2);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched productController.js for batchId');
