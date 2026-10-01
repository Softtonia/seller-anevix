// Default Fallback Schemas for Product Types (used when API is loading, offline, or providing initial instant render)

export const DEFAULT_SIMPLE_SCHEMA = {
  productType: "simple",
  title: "Simple Product",
  description: "A single, standalone physical or digital product with a unique SKU and price.",
  tabs: [
    { id: "general", label: "General" },
    { id: "pricing", label: "Pricing" },
    { id: "inventory", label: "Inventory" },
    { id: "shipping", label: "Shipping" },
    { id: "attributes", label: "Attributes" },
    { id: "linked_products", label: "Linked Products" },
    { id: "media", label: "Images & Media" },
    { id: "seo", label: "SEO & Visibility" }
  ],
  fields: [
    {
      key: "name",
      label: "Product Name",
      type: "text",
      required: true,
      tab: "general",
      placeholder: "e.g. Wireless Noise-Cancelling Headphones",
      defaultValue: ""
    },
    {
      key: "slug",
      label: "Slug (URL Key)",
      type: "text",
      required: true,
      tab: "general",
      placeholder: "e.g. wireless-noise-cancelling-headphones",
      defaultValue: "",
      description: "Unique URL-friendly slug"
    },

    {
      key: "cat_id",
      label: "Main Category",
      type: "select",
      required: true,
      tab: "general",
      placeholder: "Select Category",
      endpoint: "/api/product-categories",
      description: "Category ID (Tier 1)"
    },
    {
      key: "sub_cat_id",
      label: "Sub Category",
      type: "select",
      required: true,
      tab: "general",
      placeholder: "Select Sub Category",
      endpoint: "/api/product-categories?parent={cat_id}",
      description: "Sub Category ID (Tier 2)"
    },
    {
      key: "nested_sub_cat_id",
      label: "Nested Sub Category",
      type: "select",
      required: true,
      tab: "general",
      placeholder: "Select Nested Sub Category",
      endpoint: "/api/product-categories?parent={sub_cat_id}",
      description: "Nested Sub Category ID (Tier 3)"
    },
    {
      key: "brandId",
      label: "Brand",
      type: "select",
      required: false,
      tab: "general",
      placeholder: "Select Brand",
      endpoint: "/api/brands",
      defaultValue: null
    },
    {
      key: "description",
      label: "Full Description",
      type: "textarea",
      required: false,
      tab: "general",
      placeholder: "Detailed product description (HTML or Markdown supported)",
      defaultValue: ""
    },
    {
      key: "shortDescription",
      label: "Short Description",
      type: "textarea",
      required: false,
      tab: "general",
      placeholder: "Brief product summary displayed next to images",
      defaultValue: ""
    },
    {
      key: "isFeatured",
      label: "Featured Product",
      type: "boolean",
      required: false,
      tab: "general",
      defaultValue: false
    },
    {
      key: "thumbnail",
      label: "Main Image / Thumbnail URL or ID",
      type: "image",
      required: false,
      tab: "media",
      placeholder: "Image URL or ProductImage ObjectId",
      defaultValue: null
    },
    {
      key: "images",
      label: "Gallery Images",
      type: "array",
      itemType: "image",
      required: false,
      tab: "media",
      description: "List of secondary product image URLs or object definitions [{ url, isPrimary, altText }]",
      defaultValue: []
    },
    {
      key: "videos",
      label: "Product Videos",
      type: "array",
      itemType: "video",
      required: false,
      tab: "media",
      description: "List of video URLs",
      defaultValue: []
    },
    {
      key: "catalog_visibility",
      label: "Catalog Visibility",
      type: "select",
      required: false,
      tab: "seo",
      defaultValue: "visible",
      options: [
        { label: "Shop and search results", value: "visible" },
        { label: "Shop only", value: "catalog" },
        { label: "Search results only", value: "search" },
        { label: "Hidden", value: "hidden" }
      ]
    },
    {
      key: "metaTitle",
      label: "Meta Title (SEO)",
      type: "text",
      required: false,
      tab: "seo",
      placeholder: "SEO Title Tag",
      defaultValue: ""
    },
    {
      key: "metaDescription",
      label: "Meta Description (SEO)",
      type: "textarea",
      required: false,
      tab: "seo",
      placeholder: "Search engine summary snippet",
      defaultValue: ""
    },
    {
      key: "tags",
      label: "Product Tags",
      type: "array",
      itemType: "text",
      required: false,
      tab: "seo",
      placeholder: "Add tags (e.g. bluetooth, wireless)",
      defaultValue: []
    },
    {
      key: "upsell_ids",
      label: "Upsells",
      type: "array",
      itemType: "select",
      endpoint: "/api/products",
      required: false,
      tab: "linked_products",
      description: "Products recommended instead of the currently viewed product",
      defaultValue: []
    },
    {
      key: "cross_sell_ids",
      label: "Cross-sells",
      type: "array",
      itemType: "select",
      endpoint: "/api/products",
      required: false,
      tab: "linked_products",
      description: "Products promoted in the cart, based on the current product",
      defaultValue: []
    },
    {
      key: "virtual",
      label: "Virtual Product",
      type: "boolean",
      required: false,
      tab: "general",
      defaultValue: false,
      description: "Virtual products are intangible and aren't shipped"
    },
    {
      key: "downloadable",
      label: "Downloadable Product",
      type: "boolean",
      required: false,
      tab: "general",
      defaultValue: false,
      description: "Provides access to downloadable files upon purchase"
    },
    {
      key: "regular_price",
      altKey: "price",
      label: "Regular Price",
      type: "number",
      required: true,
      tab: "pricing",
      placeholder: "0.00",
      min: 0,
      defaultValue: null
    },
    {
      key: "sale_price",
      altKey: "salePrice",
      label: "Sale Price",
      type: "number",
      required: false,
      tab: "pricing",
      placeholder: "0.00",
      min: 0,
      defaultValue: null,
      description: "Must be strictly less than regular price"
    },
    {
      key: "date_on_sale_from",
      label: "Sale Start Date",
      type: "date",
      required: false,
      tab: "pricing",
      defaultValue: null
    },
    {
      key: "date_on_sale_to",
      label: "Sale End Date",
      type: "date",
      required: false,
      tab: "pricing",
      defaultValue: null
    },
    {
      key: "currency",
      label: "Currency",
      type: "text",
      required: false,
      tab: "pricing",
      defaultValue: "INR"
    },
    {
      key: "tax_status",
      label: "Tax Status",
      type: "select",
      required: false,
      tab: "pricing",
      defaultValue: "taxable",
      options: [
        { label: "Taxable", value: "taxable" },
        { label: "Shipping only", value: "shipping" },
        { label: "None", value: "none" }
      ]
    },
    {
      key: "tax_class",
      label: "Tax Class",
      type: "text",
      required: false,
      tab: "pricing",
      defaultValue: null
    },
    {
      key: "sku",
      label: "SKU (Stock Keeping Unit)",
      type: "text",
      required: true,
      tab: "inventory",
      placeholder: "e.g. PROD-SMPL-001",
      defaultValue: "",
      description: "Unique alphanumeric product identifier"
    },
    {
      key: "manage_stock",
      altKey: "manageStock",
      label: "Manage Stock?",
      type: "boolean",
      required: false,
      tab: "inventory",
      defaultValue: false,
      description: "Enable stock management at product level"
    },
    {
      key: "stock_quantity",
      altKey: "quantity",
      label: "Stock Quantity",
      type: "number",
      required: false,
      tab: "inventory",
      placeholder: "0",
      defaultValue: 0,
      dependsOn: {
        field: "manage_stock",
        value: true
      }
    },
    {
      key: "backorders",
      label: "Allow Backorders?",
      type: "select",
      required: false,
      tab: "inventory",
      defaultValue: "no",
      options: [
        { label: "Do not allow", value: "no" },
        { label: "Allow, but notify customer", value: "notify" },
        { label: "Allow", value: "yes" }
      ],
      dependsOn: {
        field: "manage_stock",
        value: true
      }
    },
    {
      key: "low_stock_threshold",
      altKey: "lowStockThreshold",
      label: "Low Stock Threshold",
      type: "number",
      required: false,
      tab: "inventory",
      placeholder: "2",
      defaultValue: 2,
      dependsOn: {
        field: "manage_stock",
        value: true
      }
    },
    {
      key: "sold_individually",
      label: "Sold Individually",
      type: "boolean",
      required: false,
      tab: "inventory",
      defaultValue: false,
      description: "Limit purchases to 1 item per order"
    },
    {
      key: "weight",
      label: "Weight (kg)",
      type: "number",
      required: false,
      tab: "shipping",
      placeholder: "0.0",
      min: 0,
      defaultValue: null
    },
    {
      key: "dimensions",
      label: "Dimensions (cm)",
      type: "object",
      required: false,
      tab: "shipping",
      fields: [
        { key: "length", label: "Length", type: "number", placeholder: "Length" },
        { key: "width", label: "Width", type: "number", placeholder: "Width" },
        { key: "height", label: "Height", type: "number", placeholder: "Height" }
      ],
      defaultValue: {
        length: null,
        width: null,
        height: null
      }
    },
    {
      key: "shipping_class",
      label: "Shipping Class",
      type: "text",
      required: false,
      tab: "shipping",
      defaultValue: null
    },
    {
      key: "attributes",
      label: "Product Attributes",
      type: "array",
      itemType: "object",
      required: false,
      tab: "attributes",
      fields: [
        { key: "name", label: "Attribute Name", type: "text", placeholder: "e.g. Material" },
        { key: "options", label: "Values", type: "array", itemType: "text", placeholder: "e.g. Cotton, Polyester" }
      ],
      description: "Descriptive specifications displayed on product page",
      defaultValue: []
    }
  ]
};

export const DEFAULT_SCHEMAS_MAP = {
  simple: DEFAULT_SIMPLE_SCHEMA
};
