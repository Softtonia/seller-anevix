'use client';
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CloudUploadOutlined,
  DescriptionOutlined,
  FileDownloadOutlined,
  CloseOutlined,
  AddBoxOutlined,
  LayersOutlined,
  AddPhotoAlternateOutlined,
  CheckCircleOutlineOutlined,
  RefreshOutlined,
  DataObjectOutlined,
  VisibilityOutlined,
  InfoOutlined,
  VideoCameraBackOutlined,
  FileUploadOutlined,
  SearchOutlined,
  KeyboardArrowDownOutlined,
} from '@mui/icons-material';
import Link from 'next/link';
import toast from 'react-hot-toast';
import apiClient, { productService, uploadService } from '@/api';
import { Autocomplete, TextField } from '@mui/material';
import dynamic from 'next/dynamic';
import ProductVariations from '@/components/ProductVariations';
import HsnAutocompleteSelect from '@/components/HsnAutocompleteSelect';
import 'react-quill-new/dist/quill.snow.css';
import './CatalogUpload.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

function CatalogUploadContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'bulk' ? 'bulk' : 'single');
  const [sellerId, setSellerId] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState({});

  // --- Bulk Upload State ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // --- Single Product State ---
  const [singleProduct, setSingleProduct] = useState({
    productType: searchParams.get('type') || 'simple', // 'simple' | 'variable' | 'external' | 'grouped'
    title: '',
    sku: '',
    category: '',
    brand: '',
    price: '',
    mrp: '',
    stock: '',
    description: '',
    // External Product fields
    externalUrl: '',
    buttonText: 'Buy Now',
    // Variable Product fields
    variations: [
      { attributeName: 'Size', attributeValue: 'M', sku: '', price: '', stock: '' },
    ],
    // Grouped Product fields (bundle of sub-products)
    groupedProducts: [
      { name: 'Included Item 1', sku: '', price: '', quantity: '1' },
    ],
    images: [],
  });
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Temporary inputs for array fields (tags, media, attributes)
  const [tagInput, setTagInput] = useState({});
  const [newAttrState, setNewAttrState] = useState({ name: '', options: '' });

  // --- Real-time Upload Session & Stream Progress State ---
  const [activeUploadId, setActiveUploadId] = useState(null);
  const [uploadProgresses, setUploadProgresses] = useState({ thumbnail: null, images: null, videos: null });
  const [uploadingStates, setUploadingStates] = useState({ thumbnail: false, images: false, videos: false });
  const sseRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const galleryImageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Clean up Server-Sent Events stream when unmounting
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  // Fetch product for editing
  useEffect(() => {
    if (editId) {
      apiClient.get(`/products/${editId}`)
        .then(res => {
          const p = res.data?.data || res.data?.product || res.data;
          if (p) {
            setSingleProduct(prev => ({
              ...prev,
              ...p,
              productType: p.productType || p.type || 'simple',
              title: p.name || p.title || '',
            }));
            setSchemaFormData(prev => ({
              ...prev,
              ...p,
              name: p.name || p.title || ''
            }));
          }
        })
        .catch(err => {
          console.error("Failed to load product for editing:", err);
          toast.error("Failed to load product for editing");
        });
    }
  }, [editId]);

  // --- Product Types Schema API State ---
  const [productTypes, setProductTypes] = useState([
    {
      type: 'simple',
      name: 'Simple product',
      description: 'Covers the vast majority of any products you may sell. Simple products are shipped and have no options.',
      endpoint: '/api/products/schema/simple',
    },
    {
      type: 'grouped',
      name: 'Grouped product',
      description: 'A collection of related products that can be purchased individually and only consist of simple products.',
      endpoint: '/api/products/schema/grouped',
    },
    {
      type: 'external',
      name: 'External/Affiliate product',
      description: 'One that you list and describe on your web site, but is sold elsewhere.',
      endpoint: '/api/products/schema/external',
    },
    {
      type: 'variable',
      name: 'Variable product',
      description: 'A product with variations, each of which may have a different SKU, price, stock level, etc.',
      endpoint: '/api/products/schema/variable',
    },
  ]);
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState(null);

  // Dynamic type schema details state (tabs & fields returned from /api/products/schema/:type)
  const [typeSchema, setTypeSchema] = useState(null);
  const [loadingTypeSchema, setLoadingTypeSchema] = useState(false);
  const [typeSchemaError, setTypeSchemaError] = useState(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState('general');

  // Build initial form data from a schema object
  const buildInitialFormData = (schema) => {
    if (!schema || !Array.isArray(schema.fields)) return {};
    const initialValues = {};
    schema.fields.forEach((f) => {
      if (f.defaultValue !== undefined && f.defaultValue !== null) {
        initialValues[f.key] = f.defaultValue;
      } else if (f.type === 'array') {
        initialValues[f.key] = [];
      } else if (f.type === 'boolean') {
        initialValues[f.key] = false;
      } else if (f.type === 'object' && f.fields) {
        initialValues[f.key] = {};
        f.fields.forEach((subF) => {
          initialValues[f.key][subF.key] = subF.defaultValue ?? '';
        });
      } else {
        initialValues[f.key] = '';
      }
    });
    return initialValues;
  };

  const [schemaFormData, setSchemaFormData] = useState({});
  const [showVariablesModal, setShowVariablesModal] = useState(false);
  const [currentGuidelines, setCurrentGuidelines] = useState([]);

  // Fetch product types from schema API
  const fetchProductSchema = async () => {
    try {
      setLoadingSchema(true);
      setSchemaError(null);
      const res = await productService.getProductTypesSchema();
      const types = res?.data?.productTypes || res?.productTypes;
      if (Array.isArray(types) && types.length > 0) {
        setProductTypes(types);
      }
    } catch (err) {
      console.warn('Failed to load dynamic product schema types, using fallback:', err?.message || err);
      setSchemaError(err?.message || 'Using offline product types');
    } finally {
      setLoadingSchema(false);
    }
  };

  useEffect(() => {
    fetchProductSchema();

    const fetchSellerProfile = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        console.log('Seller Profile Response:', response.data);
        
const fetchedId = response.data?.profile?.b2cProfileId || response.data?.b2cProfile?._id || response.data?.profile?._id || response.data?._id;


        if (fetchedId) {
          setSellerId(fetchedId);
          console.log("Successfully loaded Seller ID:", fetchedId);
        } else {
          console.warn("Could not find seller _id in response!", response.data);
          toast.error("Could not extract Seller ID from profile response.");
        }
      } catch (error) {
        console.error('Error fetching seller profile:', error);
      }
    };
    
    fetchSellerProfile();
  }, []);

  // Apply schema definition to state and form values
  const applySchema = (schema) => {
    if (!schema || !schema.fields) return;
    
    const filteredSchema = {
      ...schema,
      fields: schema.fields
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
        })
    };

    setTypeSchema(filteredSchema);
    if (filteredSchema.tabs && filteredSchema.tabs.length > 0) {
      setActiveSchemaTab(filteredSchema.tabs[0].id);
    }
    const freshDefaults = buildInitialFormData(filteredSchema);
    setSchemaFormData((prev) => ({
      ...freshDefaults,
      ...prev,
    }));
  };

  // Fetch schema details for currently selected productType
  const currentSchemaRequest = useRef(null);
  const fetchProductTypeSchema = async (type) => {
    currentSchemaRequest.current = type;
    if (!type) return;
    try {
      setLoadingTypeSchema(true);
      setTypeSchemaError(null);
      const res = await productService.getProductTypeSchema(type);
      // axios returns { data: { success: true, data: { productType, tabs, fields } } }
      const data = res?.data?.data || res?.data || res;
      if (currentSchemaRequest.current !== type) return; // Prevent race conditions
      if (data && data.tabs && data.fields) {
        applySchema(data);
      } else {
        throw new Error('Invalid schema format from API');
      }
    } catch (err) {
      console.warn(`Failed to fetch schema for productType "${type}":`, err?.message || err);
      setTypeSchemaError(err?.message || `Failed to load schema for ${type}`);
    } finally {
      setLoadingTypeSchema(false);
    }
  };

  useEffect(() => {
    if (singleProduct.productType) {
      fetchProductTypeSchema(singleProduct.productType);
    }
  }, [singleProduct.productType]);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type && type !== singleProduct.productType) {
      setSingleProduct(prev => ({ ...prev, productType: type }));
    }
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    setAddMenuOpen(false);
  }, [searchParams]);

  useEffect(() => {
    if (!typeSchema?.fields) return;

    typeSchema.fields.forEach(async (field) => {
      if (field.type === 'select' && field.endpoint) {
        let url = field.endpoint;
        let shouldFetch = true;

        const matches = url.match(/\{([a-zA-Z0-9_]+)\}/g);
        if (matches) {
          matches.forEach((match) => {
            const key = match.replace(/[{}]/g, '');
            const val = schemaFormData[key];
            if (!val) {
              shouldFetch = false;
            } else {
              url = url.replace(match, val);
            }
          });
        }

        if (shouldFetch) {
          console.log(`Fetching options for ${field.key} from ${url}`);
          try {
            const res = await apiClient.get(url);
            console.log(`Response for ${field.key}:`, res.data);
            
            // Handle various backend response structures
            let resData = [];
            if (Array.isArray(res.data)) {
              resData = res.data;
            } else if (res.data && Array.isArray(res.data.data)) {
              resData = res.data.data;
            } else if (res.data && typeof res.data === 'object') {
              // Just in case it's in some other key like 'categories'
              const arrayValues = Object.values(res.data).find(val => Array.isArray(val));
              if (arrayValues) resData = arrayValues;
            }

            if (resData.length > 0) {
              const options = resData.map(item => ({
                label: item.cat_name || item.name || item.title || item.label || item.id || item._id,
                value: item.id || item._id || item.value,
                guidelines: item.guidelines || []
              }));
              setDropdownOptions(prev => ({ ...prev, [field.key]: options }));
            } else {
              setDropdownOptions(prev => ({ ...prev, [field.key]: [] }));
            }
          } catch (err) {
            console.error(`Failed to fetch options for ${field.key} from ${url}:`, err);
            setDropdownOptions(prev => ({ ...prev, [field.key]: [] }));
          }
        } else {
          setDropdownOptions(prev => ({ ...prev, [field.key]: [] }));
        }
      }
    });
  }, [typeSchema, schemaFormData.cat_id, schemaFormData.sub_cat_id]);

  const selectedTypeInfo = productTypes.find(
    (pt) => pt.type === singleProduct.productType
  );

  const handleSchemaFieldChange = (key, value) => {
    setSchemaFormData((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === 'name' && value) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }

      // Handle category cascading dropdown reset and guidelines update
      if (key === 'cat_id') {
        updated.sub_cat_id = '';
        updated.nested_sub_cat_id = '';
      }
      if (key === 'sub_cat_id') {
        updated.nested_sub_cat_id = '';
      }

      return updated;
    });

    // Update guidelines based on selection
    if (['cat_id', 'sub_cat_id', 'nested_sub_cat_id'].includes(key) && value) {
      const selectedOption = dropdownOptions[key]?.find(opt => String(opt.value) === String(value));
      if (selectedOption?.guidelines?.length > 0) {
        setCurrentGuidelines(selectedOption.guidelines);
      }
    } else if (['cat_id', 'sub_cat_id', 'nested_sub_cat_id'].includes(key) && !value) {
      // If cleared, we might want to revert to parent guidelines, but for simplicity:
      setCurrentGuidelines([]);
    }
  };

  // Nested object change handler (e.g., dimensions)
  const handleSchemaNestedFieldChange = (parentKey, childKey, value) => {
    setSchemaFormData((prev) => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] || {}),
        [childKey]: value,
      },
    }));
  };

  // Array tag handlers (e.g. for tags, videos, etc.)
  const handleAddTagItem = (fieldKey) => {
    const rawVal = tagInput[fieldKey]?.trim();
    if (!rawVal) return;
    const currentList = Array.isArray(schemaFormData[fieldKey]) ? schemaFormData[fieldKey] : [];
    if (!currentList.includes(rawVal)) {
      setSchemaFormData((prev) => ({
        ...prev,
        [fieldKey]: [...currentList, rawVal],
      }));
    }
    setTagInput((prev) => ({ ...prev, [fieldKey]: '' }));
  };

  const handleRemoveTagItem = (fieldKey, indexToRemove) => {
    const currentList = Array.isArray(schemaFormData[fieldKey]) ? schemaFormData[fieldKey] : [];
    setSchemaFormData((prev) => ({
      ...prev,
      [fieldKey]: currentList.filter((_, i) => i !== indexToRemove),
    }));
  };

  // Dynamic Product Attributes handler (for attributes array of objects)
  const handleAddAttributeItem = (fieldKey) => {
    if (!newAttrState.name.trim()) {
      toast.error('Please enter an attribute name (e.g. Material or Color)');
      return;
    }
    const currentList = Array.isArray(schemaFormData[fieldKey]) ? schemaFormData[fieldKey] : [];
    const optionsArray = newAttrState.options
      ? newAttrState.options.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    setSchemaFormData((prev) => ({
      ...prev,
      [fieldKey]: [
        ...currentList,
        { name: newAttrState.name.trim(), options: optionsArray },
      ],
    }));
    setNewAttrState({ name: '', options: '' });
  };

  const handleRemoveAttributeItem = (fieldKey, indexToRemove) => {
    const currentList = Array.isArray(schemaFormData[fieldKey]) ? schemaFormData[fieldKey] : [];
    setSchemaFormData((prev) => ({
      ...prev,
      [fieldKey]: currentList.filter((_, i) => i !== indexToRemove),
    }));
  };

  // --- Real-time Upload Stream SSE Listener ---
  const startUploadStream = (uploadId, fieldKey) => {
    if (!uploadId || typeof window === 'undefined') return;
    if (sseRef.current) {
      sseRef.current.close();
    }
    const streamUrl = uploadService.getStreamUrl(uploadId);
    try {
      const eventSource = new EventSource(streamUrl);
      sseRef.current = eventSource;

      eventSource.addEventListener('progress', (e) => {
        try {
          const data = JSON.parse(e.data);
          setUploadProgresses(prev => ({ ...prev, [fieldKey]: data }));
          if (data.status === 'completed' || data.progress === 100) {
            setTimeout(() => {
              setUploadProgresses(prev => ({ ...prev, [fieldKey]: null }));
              eventSource.close();
            }, 1200);
          }
        } catch (parseErr) {
          console.warn('Error parsing SSE progress data:', parseErr);
        }
      });

      eventSource.addEventListener('error', () => {
        // SSE error or stream ended
        eventSource.close();
      });
    } catch (streamErr) {
      console.warn('Failed to connect to upload progress stream:', streamErr);
    }
  };

  // Helper to initialize session and get uploadId
  const getOrInitUploadSession = async (fileCount = 1, fieldKey) => {
    try {
      const res = await uploadService.initUpload({ totalFiles: fileCount });
      const upId = res?.data?.uploadId || res?.uploadId;
      if (upId) {
        setActiveUploadId(upId);
        startUploadStream(upId, fieldKey);
        return upId;
      }
    } catch (err) {
      console.warn('Could not initialize upload session, proceeding directly:', err);
    }
    return null;
  };

  // 1. Upload Thumbnail Handler
  const handleUploadThumbnailFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fieldKey = 'thumbnail';
      setUploadingStates(prev => ({ ...prev, thumbnail: true }));
      setUploadProgresses(prev => ({ ...prev, thumbnail: { progress: 10, status: 'uploading', text: 'Starting thumbnail upload...' } }));

      const uploadId = await getOrInitUploadSession(1, fieldKey);
      const formData = new FormData();
      formData.append('thumbnail', file);
      if (uploadId) formData.append('uploadId', uploadId);

      const res = await uploadService.uploadThumbnail(formData, (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgresses((prev) => ({
            ...prev,
            thumbnail: {
              ...prev.thumbnail,
              progress: pct,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              status: pct >= 100 ? 'processing' : 'uploading',
            }
          }));
        }
      });

      const resData = res?.data || res;
      const uploadedUrl = resData?.thumbnail || resData?.url;

      if (uploadedUrl) {
        // Update both schemaFormData and singleProduct
        setSchemaFormData((prev) => ({
          ...prev,
          thumbnail: uploadedUrl,
        }));
        setSingleProduct((prev) => ({
          ...prev,
          thumbnail: uploadedUrl,
          images: prev.images.includes(uploadedUrl) ? prev.images : [uploadedUrl, ...prev.images],
        }));
        toast.success('Thumbnail uploaded successfully!');
      }
    } catch (err) {
      console.error('Thumbnail upload failed:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload thumbnail');
    } finally {
      setUploadingStates(prev => ({ ...prev, thumbnail: false }));
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    }
  };

  // 2. Upload Batch Media (Images or Videos) Handler
  const handleUploadBatchMediaFiles = async (e, type = 'image') => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    try {
      const fieldKey = type === 'video' ? 'videos' : 'images';
      setUploadingStates(prev => ({ ...prev, [fieldKey]: true }));
      setUploadProgresses(prev => ({ ...prev, [fieldKey]: { progress: 10, status: 'uploading', text: `Uploading ${fileList.length} ${type}(s)...` } }));

      const uploadId = await getOrInitUploadSession(fileList.length, fieldKey);
      const formData = new FormData();
      if (uploadId) formData.append('uploadId', uploadId);

      // Append files to appropriate field name
      fileList.forEach((file) => {
        if (type === 'video' || file.type.startsWith('video/')) {
          formData.append('videos', file);
        } else {
          formData.append('images', file);
        }
      });

      const res = await uploadService.uploadBatch(formData, (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgresses((prev) => ({
            ...prev,
            [fieldKey]: {
              ...prev[fieldKey],
              progress: pct,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              status: pct >= 100 ? 'processing' : 'uploading',
            }
          }));
        }
      });

      const resData = res?.data || res;
      const uploadedImages = resData?.images || [];
      const uploadedVideos = resData?.videos || [];

      // Update state with newly returned URLs
      if (uploadedImages.length > 0) {
        setSchemaFormData((prev) => {
          const existingImages = Array.isArray(prev.images) ? prev.images : [];
          return {
            ...prev,
            images: [...existingImages, ...uploadedImages],
          };
        });
        setSingleProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages],
        }));
      }

      if (uploadedVideos.length > 0) {
        setSchemaFormData((prev) => {
          const existingVideos = Array.isArray(prev.videos) ? prev.videos : [];
          return {
            ...prev,
            videos: [...existingVideos, ...uploadedVideos],
          };
        });
      }

      const totalUploaded = uploadedImages.length + uploadedVideos.length;
      toast.success(`${totalUploaded} media file(s) uploaded successfully!`);
    } catch (err) {
      console.error('Batch media upload failed:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload media files');
    } finally {
      const fieldKey = type === 'video' ? 'videos' : 'images';
      setUploadingStates(prev => ({ ...prev, [fieldKey]: false }));
      if (galleryImageInputRef.current) galleryImageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Bulk Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select an Excel (.xlsx, .xls) or CSV (.csv) file.');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
      } else {
        toast.error('Please drop an Excel (.xlsx, .xls) or CSV (.csv) file.');
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a catalog file first.');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast.success(`Catalog "${selectedFile.name}" uploaded successfully! Products are being processed.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
  };

  const handleDownloadSample = async () => {
    try {
      const response = await apiClient.get('/products/template/download', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'anevix_catalog_template.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Sample template downloaded!');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template.');
    }
  };

  // Single Product Handlers
  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setSingleProduct((prev) => ({ ...prev, [name]: value }));

    if (name === 'title' && value) {
      setSchemaFormData((prev) => ({
        ...prev,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  };

  // Variation handlers
  const handleAddVariation = () => {
    setSingleProduct((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        { attributeName: 'Size', attributeValue: '', sku: '', price: '', stock: '' },
      ],
    }));
  };

  const handleRemoveVariation = (index) => {
    if (singleProduct.variations.length <= 1) {
      toast.error('At least one variation row is required for variable products.');
      return;
    }
    setSingleProduct((prev) => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index),
    }));
  };

  const handleVariationChange = (index, field, value) => {
    setSingleProduct((prev) => {
      const updated = [...prev.variations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variations: updated };
    });
  };

  // Grouped Product handlers
  const handleAddGroupedProduct = () => {
    setSingleProduct((prev) => ({
      ...prev,
      groupedProducts: [
        ...prev.groupedProducts,
        { name: '', sku: '', price: '', quantity: '1' },
      ],
    }));
  };

  const handleRemoveGroupedProduct = (index) => {
    if (singleProduct.groupedProducts.length <= 1) {
      toast.error('At least one item is required in a grouped product bundle.');
      return;
    }
    setSingleProduct((prev) => ({
      ...prev,
      groupedProducts: prev.groupedProducts.filter((_, i) => i !== index),
    }));
  };

  const handleGroupedProductChange = (index, field, value) => {
    setSingleProduct((prev) => {
      const updated = [...prev.groupedProducts];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, groupedProducts: updated };
    });
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    if (singleProduct.images.length >= 6) {
      toast.error('Maximum 6 product images allowed.');
      return;
    }
    setSingleProduct((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setSingleProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSingleProductSubmit = async (e) => {
    e.preventDefault();

    // If dynamic schema is available, validate required fields defined in schema
    if (typeSchema?.fields && Array.isArray(typeSchema.fields)) {
      const missingRequired = typeSchema.fields.filter((f) => {
        if (!f.required) return false;
        // If dependent on another field, only validate if condition met
        if (f.dependsOn) {
          const depVal = schemaFormData[f.dependsOn.field];
          if (depVal !== f.dependsOn.value) return false;
        }
        
        // Special case for sub categories: only require them if options were actually loaded from API
        if (f.key === 'sub_cat_id' || f.key === 'nested_sub_cat_id') {
          const options = dropdownOptions[f.key] || [];
          if (options.length === 0) return false;
        }

        const val = schemaFormData[f.key];
        return val === undefined || val === null || val === '';
      });

      if (missingRequired.length > 0) {
        toast.error(`Please fill required schema field: "${missingRequired[0].label}" (Tab: ${missingRequired[0].tab})`);
        setActiveSchemaTab(missingRequired[0].tab);
        return;
      }
    } else {
      // Fallback static validation
      if (!singleProduct.title || !singleProduct.category) {
        toast.error('Please fill in required fields: Product Title and Category.');
        return;
      }
      if (singleProduct.productType === 'simple' && !singleProduct.price) {
        toast.error('Please enter the selling price for simple product.');
        return;
      }
      if (singleProduct.productType === 'external' && !singleProduct.externalUrl) {
        toast.error('Please provide the external affiliate or product URL.');
        return;
      }
    }

    setSubmittingProduct(true);
    try {
      if (!sellerId) {
        toast.error('Cannot submit product: Seller ID is missing or failed to load.');
        setSubmittingProduct(false);
        return;
      }

      // Clean up variants to only include fields mentioned in the UI
      let cleanedVariants = schemaFormData.variants;
      if (Array.isArray(schemaFormData.variants)) {
        cleanedVariants = schemaFormData.variants.map(v => ({
          attributes: v.attributes,
          mrp_price: v.mrp_price,
          anevix_price: v.anevix_price,
          sale_price: v.sale_price,
          dimensions: v.dimensions,
          description: v.description,
          stock_quantity: v.stock_quantity,
          images: v.images
        }));
      }

      // Consolidate final payload with all uploaded media URLs
      const finalPayload = {
        productType: singleProduct.productType,
        sellerId: sellerId,
        seller: sellerId,
        ...schemaFormData,
        variants: cleanedVariants,
        thumbnail: schemaFormData.thumbnail || singleProduct.thumbnail || (singleProduct.images[0] ?? null),
        images: Array.from(new Set([
          ...(Array.isArray(schemaFormData.images) ? schemaFormData.images : []),
          ...(Array.isArray(singleProduct.images) ? singleProduct.images : []),
        ])),
        videos: Array.from(new Set(
          Array.isArray(schemaFormData.videos) ? schemaFormData.videos : []
        )),
      };

      const productTitle =
        finalPayload.name ||
        singleProduct.title ||
        'New Product';
      const typeLabel = (singleProduct.productType || 'simple').toUpperCase();
      console.log('Final Product Payload with uploaded media:', finalPayload);
      
      let res;
      if (editId) {
        res = await apiClient.put(`/products/${editId}`, finalPayload);
      } else {
        res = await productService.createProduct(finalPayload);
      }
      
      const resMessage = res?.data?.message || res?.message;
      if (resMessage) {
        toast.success(resMessage);
      } else {
        toast.success(
          `Product "${productTitle}" (${typeLabel}) ${editId ? 'updated' : 'published'} successfully with ${finalPayload.images.length} images and ${finalPayload.videos.length} videos!`
        );
      }
      
      // Optionally reset form here
    } catch (error) {
      console.error('Failed to create product:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create product. Please try again.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  return (
    <div className="catalog-upload-container">
      {/* Header & Mode Switcher */}
      <div className="catalog-header">
        <div>
          <h2>{editId ? 'Edit Product' : 'Add & Manage Products'}</h2>
          <p>{editId ? 'Modify the details of your product below.' : 'Choose whether to add an individual product or bulk import your catalog via spreadsheet.'}</p>
        </div>

        {/* Tab Switcher */}
        <div className="catalog-mode-tabs" style={{ position: 'relative' }}>
          <button
            type="button"
            className={`catalog-tab-btn ${activeTab === 'single' ? 'active' : ''}`}
            onClick={() => setAddMenuOpen(!addMenuOpen)}
          >
            <AddBoxOutlined fontSize="small" />
            Add {singleProduct?.productType ? singleProduct.productType.charAt(0).toUpperCase() + singleProduct.productType.slice(1) : 'Single'} Product
            <KeyboardArrowDownOutlined fontSize="small" style={{ marginLeft: '4px' }} />
          </button>
          {addMenuOpen && (
            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50, minWidth: '100%', overflow: 'hidden' }}>
              {['simple', 'variable', 'grouped', 'external'].map(type => (
                <Link key={type} href={{ pathname: '/business/catalog-upload', query: { tab: 'single', type: type } }} style={{ display: 'block', padding: '10px 16px', fontSize: '13px', color: '#1e293b', textDecoration: 'none', borderBottom: '1px solid #f1f5f9', textTransform: 'capitalize' }}>
                  {type} Product
                </Link>
              ))}
            </div>
          )}
          <button
            type="button"
            className={`catalog-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            <LayersOutlined fontSize="small" />
            Bulk Catalog Upload
          </button>
        </div>
      </div>

      {/* Mode 1: Add Single Product */}
      {activeTab === 'single' && (
        <form onSubmit={handleSingleProductSubmit} className="single-product-grid">
          <div className="single-product-main">
            {/* Product Type Selector */}
            <div className="form-section-card product-type-card">
              {/* Dynamic Schema Tabs Navigation */}
              {typeSchema?.tabs && typeSchema.tabs.length > 0 && (
                <div className="schema-nav-tabs">
                  {typeSchema.tabs.map((tab) => {
                    const tabFieldsCount = typeSchema.fields?.filter((f) => f.tab === tab.id)?.length || 0;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`schema-tab-pill ${activeSchemaTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveSchemaTab(tab.id)}
                      >
                        {tab.label}
                        <span className="tab-pill-badge">{tabFieldsCount}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dynamic Schema Form Section for the Active Tab */}
            {typeSchema?.fields && (
              <div className="form-section-card dynamic-schema-card">
                <div className="dynamic-schema-card-header">
                  <div>
                    <h3 className="section-title">
                      {typeSchema.tabs?.find((t) => t.id === activeSchemaTab)?.label || 'Product Details'}
                    </h3>
                    <p className="section-sub" style={{ margin: 0 }}>
                      Configured from dynamic product schema ({singleProduct.productType})
                    </p>
                  </div>
                  <span className="schema-field-counter">
                    Tab: {activeSchemaTab}
                  </span>
                </div>

                {/* Display Category Guidelines if available */}
                {currentGuidelines && currentGuidelines.length > 0 && (
                  <div className="category-guidelines-banner" style={{ margin: '16px 24px', padding: '16px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', margin: '0 0 12px 0', fontSize: '15px' }}>
                      <InfoOutlined fontSize="small" /> Category Guidelines
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentGuidelines.map(guide => (
                        <div key={guide.id} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #e0f2fe' }}>
                          <h5 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '14px' }}>{guide.title}</h5>
                          {guide.description && <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '13px' }}>{guide.description}</p>}
                          {guide.content?.items && guide.content.items.length > 0 && (
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#334155', fontSize: '13px' }}>
                              {guide.content.items.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSchemaTab === 'attributes' || activeSchemaTab === 'variations' ? (
                  <ProductVariations 
                    schemaFormData={schemaFormData} 
                    setSchemaFormData={setSchemaFormData} 
                    forcedTab={activeSchemaTab} 
                  />
                ) : (
                  <div className="schema-fields-container">
                    {typeSchema.fields
                      .filter((field) => field.tab === activeSchemaTab)
                    .map((field) => {
                      // Check field dependency
                      if (field.dependsOn) {
                        const depVal = schemaFormData[field.dependsOn.field];
                        if (depVal !== field.dependsOn.value) {
                          return null; // hide dependent field
                        }
                      }

                      // Render Boolean Switch
                      if (field.key === 'hsnCode') {
                        return (
                          <div key={field.key} className="form-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="required-star">*</span>}
                            </label>
                            <HsnAutocompleteSelect
                              value={schemaFormData[field.key] ?? ''}
                              onChange={(val) => handleSchemaFieldChange(field.key, val)}
                            />
                            {field.description && (
                              <p className="field-hint-text">{field.description}</p>
                            )}
                          </div>
                        );
                      }

                      // Render Boolean Switch
                      if (field.type === 'boolean') {
                        return (
                          <div key={field.key} className="form-group schema-boolean-group">
                            <label className="checkbox-custom-label">
                              <input
                                type="checkbox"
                                checked={!!schemaFormData[field.key]}
                                onChange={(e) => handleSchemaFieldChange(field.key, e.target.checked)}
                              />
                              <span className="checkbox-text">
                                {field.label} {field.required && <span className="required-star">*</span>}
                              </span>
                            </label>
                            {field.description && (
                              <p className="field-hint-text">{field.description}</p>
                            )}
                          </div>
                        );
                      }

                      // Render Select Dropdown
                      if (field.type === 'select') {
                        const options = dropdownOptions[field.key] && dropdownOptions[field.key].length > 0
                          ? dropdownOptions[field.key]
                          : (field.options || []);

                        // Hide sub category and nested sub category fields if there are no options
                        if (['sub_cat_id', 'nested_sub_cat_id'].includes(field.key) && options.length === 0) {
                          return null;
                        }

                        const selectedVal = schemaFormData[field.key] ?? '';
                        const selectedOption = options.find(opt => String(opt.value) === String(selectedVal)) || null;

                        return (
                          <div key={field.key} className="form-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="required-star">*</span>}
                            </label>
                            <Autocomplete
                              options={options}
                              getOptionLabel={(option) => option.label || ''}
                              value={selectedOption}
                              onChange={(_e, newValue) => {
                                handleSchemaFieldChange(field.key, newValue ? newValue.value : '');
                              }}
                              isOptionEqualToValue={(option, value) => String(option.value) === String(value.value)}
                              slotProps={{
                                paper: {
                                  sx: {
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    mt: '4px',
                                    '& .MuiAutocomplete-option': {
                                      fontSize: '14px',
                                      color: '#0f172a',
                                      padding: '10px 14px',
                                      transition: 'background-color 0.15s ease',
                                    },
                                    '& .MuiAutocomplete-option[aria-selected="true"]': {
                                      backgroundColor: '#fff7ed',
                                      color: '#ea580c',
                                      fontWeight: 600,
                                    },
                                    '& .MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
                                      backgroundColor: '#ffedd5',
                                    },
                                    '& .MuiAutocomplete-option.Mui-focused': {
                                      backgroundColor: '#f8fafc',
                                    }
                                  }
                                }
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder={field.placeholder || `Search ${field.label}...`}
                                  variant="outlined"
                                  size="small"
                                  slotProps={{
                                    ...params.slotProps,
                                    input: {
                                      ...params.slotProps?.input,
                                      startAdornment: (
                                        <>
                                          <SearchOutlined sx={{ color: '#94a3b8', ml: 1, mr: -0.5, fontSize: '20px' }} />
                                          {params.slotProps?.input?.startAdornment || params.InputProps?.startAdornment}
                                        </>
                                      ),
                                    }
                                  }}
                                  sx={{
                                    mt: 0.5,
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '8px',
                                      backgroundColor: '#ffffff',
                                      fontSize: '14px',
                                      color: '#0f172a',
                                      paddingLeft: '6px',
                                      '& fieldset': {
                                        borderColor: '#cbd5e1',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: '#cbd5e1',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#ff8c00',
                                        borderWidth: '1px',
                                        boxShadow: '0 0 0 3px rgba(255, 140, 0, 0.15)',
                                      },
                                    }
                                  }}
                                />
                              )}
                            />
                            {field.description && (
                              <p className="field-hint-text">{field.description}</p>
                            )}
                          </div>
                        );
                      }

                      // Render Textarea
                      if (field.type === 'textarea') {
                        return (
                          <div key={field.key} className="form-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="required-star">*</span>}
                            </label>
                            <div className="rich-text-editor-container" style={{ marginTop: '4px' }}>
                              <ReactQuill
                                theme="snow"
                                value={schemaFormData[field.key] ?? ''}
                                onChange={(content) => handleSchemaFieldChange(field.key, content)}
                                placeholder={field.placeholder || ''}
                                modules={{
                                  toolbar: [
                                    [{ 'header': [1, 2, 3, false] }],
                                    ['bold', 'italic', 'underline', 'strike'],
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    ['link', 'clean']
                                  ],
                                }}
                              />
                            </div>
                            {field.description && (
                              <p className="field-hint-text">{field.description}</p>
                            )}
                          </div>
                        );
                      }

                      // Render Object (e.g. Dimensions: length, width, height)
                      if (field.type === 'object' && Array.isArray(field.fields)) {
                        return (
                          <div key={field.key} className="form-group schema-nested-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="required-star">*</span>}
                            </label>
                            <div className="nested-fields-grid">
                              {field.fields.map((nested) => (
                                <div key={nested.key} className="nested-field-col">
                                  <label className="nested-label">{nested.label}</label>
                                  <input
                                    type={nested.type === 'number' ? 'number' : 'text'}
                                    className="form-input"
                                    placeholder={nested.placeholder || nested.label}
                                    value={schemaFormData[field.key]?.[nested.key] ?? ''}
                                    onChange={(e) =>
                                      handleSchemaNestedFieldChange(field.key, nested.key, e.target.value)
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                            {field.description && (
                              <p className="field-hint-text">{field.description}</p>
                            )}
                          </div>
                        );
                      }

                      // Render Dynamic Array Field (e.g. tags, upsell_ids, cross_sell_ids, attributes, images)
                      if (field.type === 'array') {
                        // Special Case: Attributes Array of Objects [{ name, options: [] }]
                        if (field.itemType === 'object') {
                          const attrList = Array.isArray(schemaFormData[field.key]) ? schemaFormData[field.key] : [];
                          return (
                            <div key={field.key} className="form-group schema-array-group">
                              <label className="form-label">
                                {field.label} {field.required && <span className="required-star">*</span>}
                              </label>
                              {field.description && (
                                <p className="field-hint-text" style={{ marginBottom: '10px' }}>{field.description}</p>
                              )}

                              <div className="attributes-builder-wrap">
                                {attrList.map((attr, idx) => (
                                  <div key={idx} className="attribute-row-card">
                                    <div className="attr-name-input">
                                      <strong>{attr.name}</strong>
                                    </div>
                                    <div className="attr-values-input">
                                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                                        {Array.isArray(attr.options) ? attr.options.join(', ') : String(attr.options || '')}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      className="remove-var-btn"
                                      onClick={() => handleRemoveAttributeItem(field.key, idx)}
                                      title="Remove attribute"
                                    >
                                      <CloseOutlined fontSize="small" />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <div className="attribute-row-card" style={{ background: '#f8fafc', borderStyle: 'dashed' }}>
                                <input
                                  type="text"
                                  className="form-input attr-name-input"
                                  placeholder="Attribute Name (e.g. Material)"
                                  value={newAttrState.name}
                                  onChange={(e) => setNewAttrState((prev) => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                  type="text"
                                  className="form-input attr-values-input"
                                  placeholder="Values comma separated (e.g. Cotton, Wool)"
                                  value={newAttrState.options}
                                  onChange={(e) => setNewAttrState((prev) => ({ ...prev, options: e.target.value }))}
                                />
                                <button
                                  type="button"
                                  className="add-attr-btn"
                                  onClick={() => handleAddAttributeItem(field.key)}
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          );
                        }

                        // Special Case: Media Array (images / videos) with Direct Upload & URL Input
                        if (field.itemType === 'image' || field.itemType === 'video') {
                          const isVideoField = field.itemType === 'video';
                          const mediaList = Array.isArray(schemaFormData[field.key]) ? schemaFormData[field.key] : [];
                          return (
                            <div key={field.key} className="form-group schema-array-group">
                              <label className="form-label">
                                {field.label} {field.required && <span className="required-star">*</span>}
                              </label>
                              {field.description && (
                                <p className="field-hint-text" style={{ marginBottom: '8px' }}>{field.description}</p>
                              )}

                              {/* Upload Action Bar */}
                              <div className="media-uploader-box">
                                <div className="media-upload-actions-bar">
                                  <input
                                    type="file"
                                    multiple
                                    accept={isVideoField ? 'video/*' : 'image/*'}
                                    style={{ display: 'none' }}
                                    ref={isVideoField ? videoInputRef : galleryImageInputRef}
                                    onChange={(e) => handleUploadBatchMediaFiles(e, isVideoField ? 'video' : 'image')}
                                  />
                                  <button
                                    type="button"
                                    className="media-file-btn"
                                    disabled={uploadingStates[field.key]}
                                    onClick={() => {
                                      if (isVideoField) videoInputRef.current?.click();
                                      else galleryImageInputRef.current?.click();
                                    }}
                                  >
                                    {isVideoField ? <VideoCameraBackOutlined fontSize="small" /> : <FileUploadOutlined fontSize="small" />}
                                    Upload {isVideoField ? 'Video(s)' : 'Image(s)'}
                                  </button>
                                </div>

                                {/* Progress Bar if active */}
                                {uploadProgresses[field.key] && uploadingStates[field.key] && (
                                  <div className="upload-stream-progress-card">
                                    <div className="progress-header">
                                      <span>
                                        <span className="stream-live-dot" /> Live Uploading {uploadProgresses[field.key].status || 'in progress'}...
                                      </span>
                                      <span className="progress-pct">{uploadProgresses[field.key].progress ?? 0}%</span>
                                    </div>
                                    <div className="progress-track">
                                      <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgresses[field.key].progress ?? 0}%` }}
                                      />
                                    </div>
                                    {activeUploadId && (
                                      <div className="stream-status-pill">
                                        Session ID: <code>{activeUploadId}</code>
                                      </div>
                                    )}
                                  </div>
                                )}


                              </div>

                              {/* Gallery Grid Preview */}
                              {mediaList.length > 0 && (
                                <div className="media-gallery-grid">
                                  {mediaList.map((item, idx) => {
                                    const mediaUrl = typeof item === 'object' ? item.url : item;
                                    return (
                                      <div key={idx} className="media-gallery-item">
                                        <span className="media-badge-tag">{isVideoField ? 'Video' : `#${idx + 1}`}</span>
                                        {isVideoField ? (
                                          <video src={mediaUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                          <img
                                            src={mediaUrl}
                                            alt={`Media ${idx + 1}`}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Invalid'; }}
                                          />
                                        )}
                                        <button
                                          type="button"
                                          className="media-remove-btn"
                                          onClick={() => handleRemoveTagItem(field.key, idx)}
                                          title="Delete media"
                                        >
                                          <CloseOutlined style={{ fontSize: '13px' }} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Text Tags or URLs Array (tags, upsells, cross-sells)
                        const itemsList = Array.isArray(schemaFormData[field.key]) ? schemaFormData[field.key] : [];
                        return (
                          <div key={field.key} className="form-group schema-array-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="required-star">*</span>}
                            </label>
                            {field.description && (
                              <p className="field-hint-text">{field.description}</p>
                            )}
                            <div className="tags-pills-wrap">
                              {itemsList.map((item, idx) => (
                                <span key={idx} className="tag-pill-item">
                                  {typeof item === 'object' ? JSON.stringify(item) : item}
                                  <button
                                    type="button"
                                    className="tag-pill-remove"
                                    onClick={() => handleRemoveTagItem(field.key, idx)}
                                  >
                                    <CloseOutlined style={{ fontSize: '13px' }} />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="tag-add-row">
                              <input
                                type="text"
                                className="form-input"
                                placeholder={field.placeholder || `Add ${field.label} item and press Add`}
                                value={tagInput[field.key] || ''}
                                onChange={(e) => setTagInput((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTagItem(field.key);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="tag-add-btn"
                                onClick={() => handleAddTagItem(field.key)}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // Dedicated Single Image Upload (e.g. field.type === 'image' / thumbnail)
                      if (field.type === 'image') {
                        const currentImg = schemaFormData[field.key];
                        return (
                          <div key={field.key} className="form-group schema-array-group">
                            <label className="form-label">
                              {field.label} {field.required && <span className="required-star">*</span>}
                            </label>
                            {field.description && (
                              <p className="field-hint-text" style={{ marginBottom: '8px' }}>{field.description}</p>
                            )}

                            <div className="media-uploader-box">
                              <div className="media-upload-actions-bar">
                                <input
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  ref={thumbnailInputRef}
                                  onChange={handleUploadThumbnailFile}
                                />
                                <button
                                  type="button"
                                  className="media-file-btn"
                                  disabled={uploadingStates.thumbnail}
                                  onClick={() => thumbnailInputRef.current?.click()}
                                >
                                  <AddPhotoAlternateOutlined fontSize="small" />
                                  Upload Thumbnail Image
                                </button>
                              </div>
                            </div>

                            {/* Progress Bar if active */}
                            {uploadProgresses.thumbnail && uploadingStates.thumbnail && (
                              <div className="upload-stream-progress-card">
                                <div className="progress-header">
                                  <span>
                                    <span className="stream-live-dot" /> Live Uploading {uploadProgresses.thumbnail.status || 'in progress'}...
                                  </span>
                                  <span className="progress-pct">{uploadProgresses.thumbnail.progress ?? 0}%</span>
                                </div>
                                <div className="progress-track">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${uploadProgresses.thumbnail.progress ?? 0}%` }}
                                  />
                                </div>
                                {activeUploadId && (
                                  <div className="stream-status-pill">
                                    Session ID: <code>{activeUploadId}</code>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Preview */}
                            {currentImg && (
                              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div className="thumbnail-preview-hero">
                                  <img
                                    src={currentImg}
                                    alt="Product Thumbnail"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/140?text=Invalid'; }}
                                  />
                                </div>
                                <div>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                                    Primary Thumbnail URL
                                  </div>
                                  <code style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
                                    {currentImg}
                                  </code>
                                  <div style={{ marginTop: '6px' }}>
                                    <button
                                      type="button"
                                      className="remove-var-btn"
                                      style={{ color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                      onClick={() => handleSchemaFieldChange(field.key, '')}
                                    >
                                      Remove Thumbnail
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Standard text, number, date, url input
                      return (
                        <div key={field.key} className="form-group">
                          <label className="form-label">
                            {field.label} {field.required && <span className="required-star">*</span>}
                            {field.altKey && (
                              <span className="field-alt-alias"> (alias: {field.altKey})</span>
                            )}
                          </label>
                          <input
                            type={
                              field.type === 'number'
                                ? 'number'
                                : field.type === 'date'
                                ? 'date'
                                : field.type === 'url'
                                ? 'url'
                                : 'text'
                            }
                            min={field.min}
                            className="form-input"
                            placeholder={field.placeholder || ''}
                            value={schemaFormData[field.key] ?? ''}
                            onChange={(e) => handleSchemaFieldChange(field.key, e.target.value)}
                          />
                          {field.description && (
                            <p className="field-hint-text">{field.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab Navigation Footer inside Schema Card */}
                {typeSchema.tabs && typeSchema.tabs.length > 1 && (
                  <div className="schema-form-footer">
                    {(() => {
                      const currentTabIdx = typeSchema.tabs.findIndex((t) => t.id === activeSchemaTab);
                      const prevTab = currentTabIdx > 0 ? typeSchema.tabs[currentTabIdx - 1] : null;
                      const nextTab = currentTabIdx < typeSchema.tabs.length - 1 ? typeSchema.tabs[currentTabIdx + 1] : null;

                      return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          {prevTab ? (
                            <button
                              type="button"
                              className="catalog-tab-btn"
                              style={{ padding: '8px 16px', fontSize: '12px' }}
                              onClick={() => setActiveSchemaTab(prevTab.id)}
                            >
                              ← Previous: {prevTab.label}
                            </button>
                          ) : <div />}

                          {nextTab ? (
                            <button
                              type="button"
                              className="catalog-tab-btn active"
                              style={{ padding: '8px 16px', fontSize: '12px', background: '#ff8c00', color: '#fff' }}
                              onClick={() => setActiveSchemaTab(nextTab.id)}
                            >
                              Next: {nextTab.label} →
                            </button>
                          ) : null}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Fallback Static Forms (Only rendered if no dynamic schema loaded) */}
            {(!typeSchema || !typeSchema.fields) && (
              <>
                {/* Basic Information */}
                <div className="form-section-card">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-group">
                <label className="form-label">
                  Product Title <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Slim Fit Cotton Formal Shirt"
                  value={singleProduct.title}
                  onChange={handleProductInputChange}
                  required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    Category <span className="required-star">*</span>
                  </label>
                  <select
                    name="category"
                    className="form-input"
                    value={singleProduct.category}
                    onChange={handleProductInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Men Fashion">Men's Fashion</option>
                    <option value="Women Fashion">Women's Fashion</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Sports & Fitness">Sports & Fitness</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input
                    type="text"
                    name="brand"
                    className="form-input"
                    placeholder="e.g. Anevix Studio"
                    value={singleProduct.brand}
                    onChange={handleProductInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  rows={4}
                  className="form-input textarea"
                  placeholder="Provide comprehensive details about materials, care instructions, and sizing..."
                  value={singleProduct.description}
                  onChange={handleProductInputChange}
                />
              </div>
            </div>

            {/* If External Product: Link & Button Text */}
            {singleProduct.productType === 'external' && (
              <div className="form-section-card">
                <h3 className="section-title">External Product Settings</h3>
                <p className="section-sub">Direct buyers to an external checkout or partner website.</p>
                
                <div className="form-group">
                  <label className="form-label">
                    Product External URL <span className="required-star">*</span>
                  </label>
                  <input
                    type="url"
                    name="externalUrl"
                    className="form-input"
                    placeholder="https://example.com/item/123?affiliate=anevix"
                    value={singleProduct.externalUrl}
                    onChange={handleProductInputChange}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Button Call To Action Text</label>
                    <input
                      type="text"
                      name="buttonText"
                      className="form-input"
                      placeholder="e.g. Buy on Brand Site"
                      value={singleProduct.buttonText}
                      onChange={handleProductInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Listed Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      placeholder="e.g. 1499"
                      value={singleProduct.price}
                      onChange={handleProductInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Grouped Product: Bundled / Child Products */}
            {singleProduct.productType === 'grouped' && (
              <div className="form-section-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <h3 className="section-title">Grouped Bundle Items</h3>
                    <p className="section-sub" style={{ margin: 0 }}>Add the products or kit items bundled inside this group.</p>
                  </div>
                  <button
                    type="button"
                    className="add-variation-row-btn"
                    onClick={handleAddGroupedProduct}
                  >
                    + Add Grouped Item
                  </button>
                </div>

                <div className="variations-table-wrapper">
                  <table className="variations-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Item SKU</th>
                        <th>Unit Price (₹)</th>
                        <th>Qty in Bundle</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {singleProduct.groupedProducts.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <input
                              type="text"
                              className="variant-cell-input"
                              placeholder="e.g. Cleanser 100ml"
                              value={item.name}
                              onChange={(e) => handleGroupedProductChange(idx, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="variant-cell-input"
                              placeholder="SKU-ITEM-01"
                              value={item.sku}
                              onChange={(e) => handleGroupedProductChange(idx, 'sku', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="variant-cell-input"
                              placeholder="499"
                              value={item.price}
                              onChange={(e) => handleGroupedProductChange(idx, 'price', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="variant-cell-input"
                              placeholder="1"
                              value={item.quantity}
                              onChange={(e) => handleGroupedProductChange(idx, 'quantity', e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="remove-var-btn"
                              onClick={() => handleRemoveGroupedProduct(idx)}
                              title="Remove item"
                            >
                              <CloseOutlined fontSize="small" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="form-row-2" style={{ marginTop: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Bundle Special Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      placeholder="e.g. 1299 (Discounted combo price)"
                      value={singleProduct.price}
                      onChange={handleProductInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bundle SKU</label>
                    <input
                      type="text"
                      name="sku"
                      className="form-input"
                      placeholder="e.g. BUNDLE-KIT-01"
                      value={singleProduct.sku}
                      onChange={handleProductInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Simple Product: Single Price & Stock Fields */}
            {singleProduct.productType === 'simple' && (
              <div className="form-section-card">
                <h3 className="section-title">Pricing & Stock</h3>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">
                      Selling Price (₹) <span className="required-star">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      className="form-input"
                      placeholder="999"
                      value={singleProduct.price}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">MRP (₹)</label>
                    <input
                      type="number"
                      name="mrp"
                      className="form-input"
                      placeholder="1999"
                      value={singleProduct.mrp}
                      onChange={handleProductInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      className="form-input"
                      placeholder="50"
                      value={singleProduct.stock}
                      onChange={handleProductInputChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="form-label">SKU / Product Code</label>
                  <input
                    type="text"
                    name="sku"
                    className="form-input"
                    placeholder="e.g. SHT-BLK-M-01"
                    value={singleProduct.sku}
                    onChange={handleProductInputChange}
                  />
                </div>
              </div>
            )}
              </>
            )}
            {/* Only show Publish button if it's the last tab (or if there are no tabs) */}
            {(!typeSchema?.tabs || typeSchema.tabs.length === 0 || activeSchemaTab === typeSchema.tabs[typeSchema.tabs.length - 1].id) && (
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-product-btn"
                  disabled={submittingProduct}
                >
                  {submittingProduct
                    ? 'Saving Product...'
                    : `Publish ${singleProduct.productType === 'variable' ? 'Variable' : singleProduct.productType === 'grouped' ? 'Grouped' : singleProduct.productType === 'external' ? 'External' : 'Simple'} Product`}
                </button>
              </div>
            )}
          </div>


        </form>
      )}

      {/* Mode 2: Bulk Catalog Upload */}
      {activeTab === 'bulk' && (
        <div className="upload-options-grid">
          {/* Main Upload Area */}
          <div className="upload-card">
            <div
              className={`dropzone-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
              />
              <CloudUploadOutlined className="dropzone-icon" />
              <h4 className="dropzone-title">Click to browse or drag and drop your file</h4>
              <p className="dropzone-sub">Supported formats: CSV, XLSX, XLS (Max file size: 25MB)</p>
              <button
                type="button"
                className="browse-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Computer
              </button>
            </div>

            {selectedFile && (
              <div className="selected-file-preview">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DescriptionOutlined style={{ color: '#ff8c00' }} />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <CloseOutlined fontSize="small" />
                </button>
              </div>
            )}

            <button
              type="button"
              className="upload-action-btn"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Processing & Validating Catalog...' : 'Upload & Process Catalog'}
            </button>
          </div>

          {/* Template & Guidelines */}
          <div className="template-card">
            <h3>Catalog Template</h3>
            <p>
              Use our pre-configured spreadsheet template with all required product attributes, categories, and inventory columns.
            </p>

            <button
              type="button"
              className="download-template-btn"
              onClick={handleDownloadSample}
            >
              <FileDownloadOutlined fontSize="small" /> Download CSV Template
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />

            <h4 style={{ fontSize: '13px', fontWeight: '700', margin: '0 0 8px', color: '#0f172a' }}>
              Upload Checklist
            </h4>
            <ul className="upload-guidelines">
              <li>Ensure product Title, Price, MRP, and SKU are filled in.</li>
              <li>Images can be hosted URL links separated by commas.</li>
              <li>Stock must be numeric and greater than or equal to 0.</li>
              <li>Max 5,000 product rows allowed per single upload.</li>
            </ul>
          </div>
        </div>
      )}
      {/* Modal Dialog: Schema Variables & Import Variables Guide */}
      {showVariablesModal && typeSchema && (
        <div className="schema-modal-overlay" onClick={() => setShowVariablesModal(false)}>
          <div className="schema-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="schema-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DataObjectOutlined style={{ color: '#ff8c00' }} />
                  <h3 className="schema-modal-title">
                    Schema Variables: {typeSchema.title || typeSchema.productType}
                  </h3>
                </div>
                <p className="schema-modal-sub">
                  Endpoint: <code>/api/products/schema/{typeSchema.productType}</code> • {typeSchema.fields?.length || 0} variables defined
                </p>
              </div>
              <button
                type="button"
                className="schema-modal-close"
                onClick={() => setShowVariablesModal(false)}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="schema-modal-body">
              <div className="schema-modal-tabs-info">
                <strong>Tabs Defined:</strong>
                <div className="schema-modal-tab-tags">
                  {typeSchema.tabs?.map((t) => (
                    <span key={t.id} className="schema-tab-tag">
                      {t.label} (<code>{t.id}</code>)
                    </span>
                  ))}
                </div>
              </div>

              <div className="schema-table-responsive">
                <table className="schema-variables-table">
                  <thead>
                    <tr>
                      <th>Key / Variable</th>
                      <th>Label</th>
                      <th>Type</th>
                      <th>Tab</th>
                      <th>Required</th>
                      <th>Default / Options</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeSchema.fields?.map((f) => (
                      <tr key={f.key}>
                        <td>
                          <code className="var-key">{f.key}</code>
                          {f.altKey && (
                            <div className="var-alias">alias: <code>{f.altKey}</code></div>
                          )}
                        </td>
                        <td className="var-label">{f.label}</td>
                        <td>
                          <span className={`var-type-badge var-type-${f.type}`}>
                            {f.type}
                            {f.itemType ? ` <${f.itemType}>` : ''}
                          </span>
                        </td>
                        <td>
                          <span className="var-tab-pill">{f.tab}</span>
                        </td>
                        <td>
                          {f.required ? (
                            <span className="req-badge yes">Yes</span>
                          ) : (
                            <span className="req-badge no">No</span>
                          )}
                        </td>
                        <td className="var-default">
                          {f.options ? (
                            <span title={f.options.map((o) => o.value).join(', ')}>
                              {f.options.length} options
                            </span>
                          ) : f.defaultValue !== undefined ? (
                            <code>{JSON.stringify(f.defaultValue)}</code>
                          ) : (
                            <span className="var-none">-</span>
                          )}
                        </td>
                        <td className="var-desc">
                          {f.description || f.placeholder || '-'}
                          {f.endpoint && (
                            <div className="var-endpoint">api: <code>{f.endpoint}</code></div>
                          )}
                          {f.dependsOn && (
                            <div className="var-depends">
                              depends: <code>{f.dependsOn.field} = {String(f.dependsOn.value)}</code>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="schema-raw-json-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong>Raw JSON Response:</strong>
                  <button
                    type="button"
                    className="copy-json-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(typeSchema, null, 2));
                      toast.success('Schema JSON copied to clipboard!');
                    }}
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="schema-json-code">
                  {JSON.stringify(typeSchema, null, 2)}
                </pre>
              </div>
            </div>

            <div className="schema-modal-footer">
              <button
                type="button"
                className="schema-modal-action-btn"
                onClick={() => setShowVariablesModal(false)}
              >
                Close Variables View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogUploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CatalogUploadContent />
    </Suspense>
  );
}
