import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader,
  X,
  Eye,
  Upload,
  ToggleLeft,
  ToggleRight,
  Calendar,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from './Sidebar';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import { BE_API_URL } from '../../src/config/config';
import VariantFormModal from './VariantFormModal'; // Import component đã tách ra

// Product Details Modal Component
const ProductDetailsModal = ({ product, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);
  const [variants, setVariants] = useState([]);
  const [error, setError] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [isEditingVariant, setIsEditingVariant] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const fetchedProduct = await ApiService.get(`/product/${product.id || product._id}`);
        setProductDetails(fetchedProduct);
        const fetchedVariants = await ApiService.get(`/product-variant/product/${product.id || product._id}`);
        setVariants(fetchedVariants || []);
        setError(null);
      } catch (err) {
        setError('Không thể tải thông tin chi tiết sản phẩm. Vui lòng thử lại sau.');
        setProductDetails(product);
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product]);

  const handleAddVariant = () => {
    setCurrentVariant({
      product_id: product.id || product._id,
      name: '',
      price: '',
      stock: 0,
      attributes: {},
      images: [],
      is_default: variants.length === 0
    });
    setIsEditingVariant(false);
    setShowVariantModal(true);
  };

  const handleEditVariant = (variant) => {
    const variantToEdit = {
      ...variant,
      attributes: variant.attributes instanceof Map ?
        Object.fromEntries(variant.attributes) : variant.attributes || {}
    };
    setCurrentVariant(variantToEdit);
    setIsEditingVariant(true);
    setShowVariantModal(true);
  };

  const handleDeleteVariant = async (variantId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      return;
    }

    try {
      setLoading(true);
      await ApiService.delete(`/product-variant/delete/${variantId}`);
      setVariants(variants.filter(v => v._id !== variantId));
      setError(null);
    } catch (err) {
      setError('Không thể xóa biến thể. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultVariant = async (variantId) => {
    try {
      setLoading(true);
      const productId = product.id || product._id;
      await ApiService.put(`/product-variant/product/${productId}/default/${variantId}`);
      setVariants(variants.map(v => ({
        ...v,
        is_default: v._id === variantId
      })));
      setError(null);
    } catch (err) {
      setError('Không thể đặt biến thể mặc định. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const renderAttributes = (attributes) => {
    if (!attributes) return null;
    const attrObj = attributes instanceof Map ? Object.fromEntries(attributes) : attributes;
    return (
      <ul className="list-disc list-inside pl-2">
        {Object.entries(attrObj).map(([key, value]) => (
          <li key={key}><span className="font-medium">{key}:</span> {value}</li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-medium">Chi tiết sản phẩm</h3>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin mr-2" />
            <p>Đang tải thông tin chi tiết...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Chi tiết sản phẩm</h3>
          <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-6">
            {error}
          </div>
        )}

        {productDetails && (
          <div className="space-y-6">
            {/* Product Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Image */}
              <div className="col-span-1">
                <div className="border rounded-md p-2 h-80 flex items-center justify-center">
                  {productDetails.thumbnail ? (
                    <img
                      src={productDetails.thumbnail}
                      alt={productDetails.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/api/placeholder/200/200";
                      }}
                    />
                  ) : (
                    <div className="text-gray-300 text-center">
                      <p>Không có hình ảnh</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="col-span-2 space-y-4">
                <h2 className="text-2xl font-bold">{productDetails.name}</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Giá bán</p>
                    <p className="text-xl font-semibold">{productDetails.price?.toLocaleString()}₫</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Đã bán</p>
                    <p>{productDetails.sold || 0}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Slug</p>
                    <p className="truncate">{productDetails.slug}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full mr-2 ${productDetails.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>{productDetails.is_active ? 'Đang hoạt động' : 'Tạm ẩn'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Khối lượng</p>
                    <p>{productDetails.weight} gram</p>
                  </div>

                
                </div>

                <div>
                  <p className="text-sm text-gray-500">Mô tả</p>
                  <p className="text-gray-700">{productDetails.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {productDetails.is_hot && (
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">Nổi bật</span>
                  )}
                  {productDetails.is_feature && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Đặc trưng</span>
                  )}
                </div>
              </div>
            </div>

            <hr className="my-6" />

            {/* Product Detail Section */}
            <div style={{zIndex:2000}}>
              <h4 className="text-lg font-medium mb-3">Chi tiết sản phẩm</h4>
              <div className="prose max-w-none">
                <p>{productDetails.detail}</p>
              </div>
            </div>

            <hr className="my-6" />

            {/* Product Variants Section */}
            <div style={{zIndex:2000}}>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Biến thể sản phẩm</h4>
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded flex items-center text-sm"
                  onClick={handleAddVariant}
                >
                  <Plus size={16} className="mr-1" />
                  Thêm biến thể
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-center p-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">Sản phẩm chưa có biến thể nào.</p>
                  <p className="text-gray-500 text-sm mt-1">Nhấn "Thêm biến thể" để tạo biến thể mới.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-2 px-4 text-left border">Biến thể</th>
                        <th className="py-2 px-4 text-left border">Thuộc tính</th>
                        <th className="py-2 px-4 text-left border">Giá</th>
                        <th className="py-2 px-4 text-left border">Tồn kho</th>
                        <th className="py-2 px-4 text-left border">Trạng thái</th>
                        <th className="py-2 px-4 text-left border">Mặc định</th>
                        <th className="py-2 px-4 text-left border">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr key={variant._id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border">{variant.name}</td>
                          <td className="py-2 px-4 border">
                            {renderAttributes(variant.attributes)}
                          </td>
                          <td className="py-2 px-4 border">{variant.price?.toLocaleString()}₫</td>
                          <td className="py-2 px-4 border">{variant.stock}</td>
                          <td className="py-2 px-4 border">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${variant.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{variant.is_active ? 'Hiện' : 'Ẩn'}</span>
                          </td>
                          <td className="py-2 px-4 border">
                            <input
                              type="radio"
                              checked={variant.is_default}
                              onChange={() => handleSetDefaultVariant(variant._id)}
                              className="mr-2"
                            />
                            {variant.is_default ? 'Mặc định' : ''}
                          </td>
                          <td className="py-2 px-4 border">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditVariant(variant)}
                                className="text-blue-500"
                                title="Sửa biến thể"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteVariant(variant._id)}
                                className="text-red-500"
                                title="Xóa biến thể"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SEO Information */}
            <div style={{zIndex:2000}}>
              <h4 className="text-lg font-medium mb-3">Thông tin SEO</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Meta Title</p>
                  <p className="truncate">{productDetails.meta_title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Meta Keyword</p>
                  <p className="truncate">{productDetails.meta_keyword}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Meta Description</p>
                  <p className="truncate">{productDetails.meta_description}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sử dụng component VariantFormModal đã tách */}
        {showVariantModal && currentVariant && (
          <VariantFormModal
            variant={currentVariant}
            isEditing={isEditingVariant}
            onClose={() => setShowVariantModal(false)}
            onSave={(newVariant) => {
              if (isEditingVariant) {
                setVariants(variants.map(v =>
                  v._id === newVariant._id ? newVariant : v
                ));
              } else {
                setVariants([...variants, newVariant]);
              }
              setShowVariantModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Edit Product Modal Component
const EditProductModal = ({ product, onClose, onUpdate }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [categoriesResponse, brandsResponse] = await Promise.all([
          ApiService.get('/categories'),
          ApiService.get('/brand')
        ]);

        setCategories(categoriesResponse || []);
        setBrands(brandsResponse || []);

        if (product) {
          // Log để debug
          console.log("Original product data:", product);
          
          setEditingProduct({
            ...product,
            category_id: product.category_id ?
              (Array.isArray(product.category_id) ?
                product.category_id.map(cat => cat._id || cat) : [product.category_id]) : [],
            brand_id: product.brand_id?._id || product.brand_id || ''
            // Đã xóa việc thiết lập trường condition
          });
        }
      } catch (error) {
        setFormErrors({
          submit: 'Lỗi khi tải dữ liệu danh mục và thương hiệu'
        });
        setCategories([]);
        setBrands([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Log để debug
    
    setEditingProduct({
      ...editingProduct,
      [name]: value
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: checked
    });
  };

  // Thay đổi từ multi-select dropdown sang checkbox
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    
    if (checked) {
      // Add the category to the array if checked
      setEditingProduct({
        ...editingProduct,
        category_id: [...editingProduct.category_id, value]
      });
    } else {
      // Remove the category from the array if unchecked
      setEditingProduct({
        ...editingProduct,
        category_id: editingProduct.category_id.filter(catId => catId !== value)
      });
    }

    if (formErrors.category_id) {
      setFormErrors({
        ...formErrors,
        category_id: ''
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

      if (!validImageTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file hình ảnh (JPEG, JPG, PNG, GIF, WEBP)');
        e.target.value = '';
        return;
      }

      setImageFile(file);
      setEditingProduct({
        ...editingProduct,
        thumbnail: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!editingProduct.name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!editingProduct.price) errors.price = 'Giá sản phẩm là bắt buộc';
    // if (!editingProduct.brand_id) errors.brand_id = 'Thương hiệu là bắt buộc';
    if (!editingProduct.slug) errors.slug = 'Slug là bắt buộc';
    if (!editingProduct.weight) errors.weight = 'Khối lượng sản phẩm là bắt buộc';
    if (!editingProduct.category_id || editingProduct.category_id.length === 0) {
      errors.category_id = 'Danh mục là bắt buộc';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu sản phẩm (đã loại bỏ condition)
      const productData = {
        name: editingProduct.name,
        slug: editingProduct.slug,
        price: parseFloat(editingProduct.price),
        weight: parseFloat(editingProduct.weight),
        brand_id: editingProduct.brand_id,
        category_id: editingProduct.category_id,
        description: editingProduct.description || "",
        detail: editingProduct.detail || "",
        // Đã xóa trường condition
        meta_title: editingProduct.meta_title || "",
        meta_keyword: editingProduct.meta_keyword || "",
        meta_description: editingProduct.meta_description || "",
        is_active: editingProduct.is_active || false,
        is_hot: editingProduct.is_hot || false,
        is_feature: editingProduct.is_feature || false,
        is_delete: editingProduct.is_delete || false
      };
      
      console.log("Sending product data:", productData); // Log để debug

      // Nếu có thumbnail URL và không thay đổi
      if (editingProduct.thumbnail && !imageFile && !editingProduct.thumbnail.startsWith('blob:')) {
        productData.thumbnail_url = editingProduct.thumbnail;
      }

      let updatedProduct;
      
      if (imageFile) {
        // Nếu có upload file mới, dùng FormData
        const formData = new FormData();
        
        // Thêm dữ liệu cơ bản vào FormData
        Object.keys(productData).forEach(key => {
          if (key === 'category_id') {
            // Xử lý đặc biệt cho mảng category_id
            productData[key].forEach((catId, index) => {
              formData.append(`category_id[${index}]`, catId);
            });
          } else {
            formData.append(key, productData[key]);
          }
        });
        
        // Thêm file hình ảnh
        formData.append('thumbnail', imageFile);
        
        updatedProduct = await ApiService.putFormData(
          `/product/edit/${editingProduct._id || editingProduct.id}`,
          formData
        );
      } else {
        // Không có file mới, gửi dữ liệu JSON thông thường
        updatedProduct = await ApiService.put(
          `/product/edit/${editingProduct._id || editingProduct.id}`,
          productData
        );
      }

      if (onUpdate) {
        onUpdate(updatedProduct);
      }

      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      setFormErrors({
        submit: error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!editingProduct) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">Chỉnh sửa sản phẩm</h3>
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin mr-2" />
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {formErrors.submit && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {formErrors.submit}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingProduct.name || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Giá */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={editingProduct.price || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.price && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={editingProduct.slug || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.slug ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.slug && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.slug}</p>
                )}
              </div>

              {/* Thương hiệu */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thương hiệu <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand_id"
                  value={editingProduct.brand_id || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.brand_id ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {formErrors.brand_id && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.brand_id}</p>
                )}
              </div> */}

              {/* Khối lượng */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Khối lượng (gram) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={editingProduct.weight || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${formErrors.weight ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {formErrors.weight && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.weight}</p>
                )}
              </div>

              {/* ĐÃ XÓA: Tình trạng */}

              {/* Danh mục - CHANGED to checkboxes */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <div className={`p-3 border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white max-h-60 overflow-y-auto`}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <div key={category._id} className="flex items-start mb-2">
                        <input
                          type="checkbox"
                          id={`category-${category._id}`}
                          name="category_id"
                          value={category._id}
                          checked={editingProduct.category_id.includes(category._id)}
                          onChange={handleCategoryChange}
                          className="h-4 w-4 mt-1 mr-2"
                        />
                        <label 
                          htmlFor={`category-${category._id}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {formErrors.category_id && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.category_id}</p>
                )}
              </div>

              {/* Mô tả */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  value={editingProduct.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Chi tiết */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chi tiết sản phẩm
                </label>
                <textarea
                  name="detail"
                  value={editingProduct.detail || ''}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Thumbnail */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh sản phẩm
                </label>
                <div
                  className="border-dashed border-2 border-gray-300 p-4 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={() => document.getElementById('edit-image-upload').click()}
                >
                  {editingProduct.thumbnail ? (
                    <div className="text-center">
                      <img
                        src={editingProduct.thumbnail}
                        alt="Product preview"
                        className="max-h-48 mx-auto mb-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/200/200";
                        }}
                      />
                      <p className="text-sm text-gray-500">Nhấp để thay đổi hình ảnh</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <p className="text-gray-500">Upload or drop a file right here</p>
                      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, JPG...</p>
                    </div>
                  )}
                  <input
                    id="edit-image-upload"
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Meta fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={editingProduct.meta_title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Keyword
                </label>
                <input
                  type="text"
                  name="meta_keyword"
                  value={editingProduct.meta_keyword || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  value={editingProduct.meta_description || ''}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Status toggles */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={editingProduct.is_active || false}
                    onChange={handleToggleChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Hiển thị trên cửa hàng
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_hot"
                    name="is_hot"
                    checked={editingProduct.is_hot || false}
                    onChange={handleToggleChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="is_hot" className="text-sm font-medium text-gray-700">
                    Sản phẩm nổi bật
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_feature"
                    name="is_feature"
                    checked={editingProduct.is_feature || false}
                    onChange={handleToggleChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="is_feature" className="text-sm font-medium text-gray-700">
                    Sản phẩm đặc trưng
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_delete"
                    name="is_delete"
                    checked={editingProduct.is_delete || false}
                    onChange={handleToggleChange}
                    className="h-4 w-4 mr-2"
                  />
                  <label htmlFor="is_delete" className="text-sm font-medium text-gray-700">
                    Xóa sản phẩm
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-5 border-t">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ProductList = () => {
  const navigate = useNavigate();
  const fetchInProgress = React.useRef(false);
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productVariants, setProductVariants] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [updatingProducts, setUpdatingProducts] = useState({});
  
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // UI helpers
  const handleViewProduct = (product) => {
    setViewProduct(product);
    setDetailsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Data fetching
  useEffect(() => {
    let isMounted = true;

    const fetchShopAndProducts = async () => {
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;

      try {
        setLoading(true);

        if (!AuthService.isLoggedIn()) {
          throw new Error('User not authenticated');
        }

        const shop = await ApiService.get('/shops/my-shop');
        if (!isMounted) return;

        if (!shop) {
          throw new Error('No shop found for this user');
        }

        const shopId = shop._id;
        
        // Fetch all products for the shop - regardless of status
        const allProductsUrl = `/product`;
        const fetchedProducts = await ApiService.get(allProductsUrl);
        
        // Filter by shop ID (since /product returns products from all shops)
        const shopProducts = fetchedProducts.filter(product => 
          (product.shop_id === shopId) || 
          (product.shop_id?._id === shopId) ||
          (typeof product.shop_id === 'object' && product.shop_id.toString() === shopId)
        );
        
        if (!isMounted) return;

        const formattedProducts = shopProducts.map(product => ({
          id: product._id,
          _id: product._id,
          name: product.name,
          stock: product.quantity || 0,
          price: product.price,
          sold: product.sold || 0,
          slug: product.slug || '',
          description: product.description || '',
          detail: product.detail || '',
          meta_title: product.meta_title || '',
          meta_keyword: product.meta_keyword || '',
          meta_description: product.meta_description || '',
          weight: product.weight || 0,
          condition: product.condition || 'new',
          is_active: product.is_active === true || product.is_active === 'true' || product.is_active === 1,
          is_hot: product.is_hot || false,
          is_feature: product.is_feature || false,
          is_delete: product.is_delete || false,
          type: product.type || 'single',
          thumbnail: product.thumbnail || '',
          createdAt: new Date(product.created_at || product.createdAt),
          category_id: product.category_id || [],
          // brand_id: product.brand_id || '',
          category: product.category_id && product.category_id.name ? product.category_id.name : 'Không phân loại'
        }));

        setProducts(formattedProducts);

        // Fetch variants for each product
        const variantsPromises = formattedProducts.map(product =>
          ApiService.get(`/product-variant/product/${product.id}`)
            .then(variants => ({ productId: product.id, variants }))
            .catch(err => ({ productId: product.id, variants: [] }))
        );

        const variantsResults = await Promise.all(variantsPromises);
        const variantsMap = {};
        variantsResults.forEach(({ productId, variants }) => {
          variantsMap[productId] = variants || [];
        });

        setProductVariants(variantsMap);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
        fetchInProgress.current = false;
      }
    };

    fetchShopAndProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Cuộn lên đầu trang khi chuyển trang
  };

  // Filtering and sorting
  const activeProdCount = useMemo(() => {
    return products.filter(p => p.is_active === true && p.is_delete === false).length;
  }, [products]);

  const inactiveProdCount = useMemo(() => {
    return products.filter(p => p.is_active === false && p.is_delete === false).length;
  }, [products]);

  const deletedProdCount = useMemo(() => {
    return products.filter(p => p.is_delete === true).length;
  }, [products]);

  const totalProdCount = useMemo(() => {
    return products.filter(p => p.is_delete === false).length;
  }, [products]);

  const sortedProducts = useMemo(() => {
    // Lọc sản phẩm theo trạng thái và trạng thái xóa
    let filteredProducts = [...products];
    
    // Chỉ hiển thị các sản phẩm không bị xóa hoàn toàn
    filteredProducts = filteredProducts.filter(product => !product.is_delete);
    
    // Lọc theo trạng thái hoạt động
    if (statusFilter === 'active') {
      filteredProducts = filteredProducts.filter(product => product.is_active === true);
    } else if (statusFilter === 'inactive') {
      filteredProducts = filteredProducts.filter(product => product.is_active === false);
    }
    
    // Áp dụng lọc tìm kiếm
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Áp dụng sắp xếp
    if (sortConfig.key) {
      filteredProducts.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredProducts;
  }, [products, sortConfig, searchTerm, statusFilter]);

  // Cập nhật tổng số trang mỗi khi sortedProducts thay đổi
  useEffect(() => {
    setTotalPages(Math.ceil(sortedProducts.length / itemsPerPage));
  }, [sortedProducts, itemsPerPage]);

  // Áp dụng phân trang cho danh sách sản phẩm đã lọc và sắp xếp
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Reset currentPage về 1 khi có thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setIsSortDropdownOpen(false);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ?
      <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  // Product operations
  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setEditModalOpen(true);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === updatedProduct.id || product.id === updatedProduct._id ?
          {
            ...updatedProduct,
            id: updatedProduct.id || updatedProduct._id,
            _id: updatedProduct._id || updatedProduct.id
          } : product
      )
    );
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    try {
      setUpdatingProducts(prev => ({
        ...prev,
        [productId]: true
      }));

      const newStatus = !currentStatus;
      
      await ApiService.put(`/product/toggle-status/${productId}`, {
        is_active: newStatus
      });

      if (currentStatus) {
        alert('Sản phẩm đã được ẩn khỏi cửa hàng');
      } else {
        alert('Sản phẩm đã được hiển thị lại trên cửa hàng');
      }

      setProducts(prevProducts =>
        prevProducts.map(product =>
          product.id === productId ?
            {
              ...product,
              is_active: newStatus
            } : product
        )
      );

      setError(null);
    } catch (err) {
      console.error("Error toggling product status:", err);
      setError(`Không thể cập nhật trạng thái sản phẩm.`);
      alert('Không thể cập nhật trạng thái sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setUpdatingProducts(prev => ({
        ...prev,
        [productId]: false
      }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }
    
    try {
      setLoading(true);
      await ApiService.delete(`/product/delete/${productId}`);
      
      // Thay vì xóa sản phẩm khỏi danh sách, chúng ta đánh dấu nó đã xóa
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? 
            { ...product, is_delete: true } : 
            product
        )
      );
      
      setError(null);
      alert('Sản phẩm đã được xóa thành công');
    } catch (err) {
      console.error("Error deleting product:", err);
      setError('Không thể xóa sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Cấu trúc đã được cập nhật để khắc phục vấn đề hai thanh cuộn
  return (
    <div className="flex bg-gray-100">
      {/* Sidebar với chiều cao cố định */}
      <div className="w-64 flex-shrink-0 h-screen">
        <Sidebar onNavigate={(path) => navigate(path)} />
      </div>

      {/* Main content - không có overflow */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="font-semibold">
                Sản phẩm ({totalProdCount})
              </span>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/seller-dashboard/add-product')}
            >
              <Plus size={20} className="mr-2" />
              Thêm mới
            </button>
          </div>

          {/* Functionality Bar */}
          <div className="p-4 border-b flex justify-between items-center">
            <div className="text-gray-600">
              {statusFilter === 'all' 
                ? 'Hiển thị tất cả sản phẩm' 
                : statusFilter === 'active'
                  ? 'Sản phẩm đang hiển thị trên gian hàng của bạn'
                  : 'Sản phẩm đang bị ẩn khỏi gian hàng của bạn'}
            </div>
            <div className="flex space-x-4">
              {/* Bộ lọc trạng thái */}
              <div className="relative">
                <div
                  className="flex items-center border rounded px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setIsFilterDropdownOpen(!isFilterDropdownOpen);
                    setIsSortDropdownOpen(false);
                  }}
                >
                  <Filter size={16} className="mr-2" />
                  <span>Lọc theo trạng thái</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isFilterDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-56 bg-white border rounded shadow-lg">
                    <div
                      className={`p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer ${statusFilter === 'all' ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => {
                        setStatusFilter('all');
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      Tất cả sản phẩm
                      <span className="text-xs text-gray-500">({totalProdCount})</span>
                    </div>
                    <div
                      className={`p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer ${statusFilter === 'active' ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => {
                        setStatusFilter('active');
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      Đang hiển thị
                      <span className="text-xs text-gray-500">({activeProdCount})</span>
                    </div>
                    <div
                      className={`p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer ${statusFilter === 'inactive' ? 'bg-blue-50 text-blue-600' : ''}`}
                      onClick={() => {
                        setStatusFilter('inactive');
                        setIsFilterDropdownOpen(false);
                      }}
                    >
                      Đang ẩn
                      <span className="text-xs text-gray-500">({inactiveProdCount})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sắp xếp theo */}
              <div className="relative">
                <div
                  className="flex items-center border rounded px-3 py-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setIsSortDropdownOpen(!isSortDropdownOpen);
                    setIsFilterDropdownOpen(false);
                  }}
                >
                  <span>Sắp xếp theo</span>
                  <ChevronDown size={16} className="ml-2" />
                </div>
                {isSortDropdownOpen && (
                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                    <div
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('price')}
                    >
                      Giá
                      {getSortIcon('price')}
                    </div>
                    <div
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Tên A-Z
                      {getSortIcon('name')}
                    </div>
                    <div
                      className="p-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      Ngày tạo
                      {getSortIcon('createdAt')}
                    </div>
                  </div>
                )}
              </div>

              {/* Tìm kiếm */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm"
                  className="border rounded px-3 py-2 w-64 pr-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm('')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-8 flex justify-center items-center">
              <Loader className="animate-spin mr-2" />
              <span>Đang tải sản phẩm...</span>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="p-4 my-4 mx-6 bg-red-50 border border-red-200 rounded-md text-red-600 flex items-start">
              <AlertCircle className="flex-shrink-0 mr-2" size={20} />
              <div>
                <p className="font-medium">Đã xảy ra lỗi</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && sortedProducts.length === 0 && (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="text-gray-400" size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Không có sản phẩm nào
              </h3>
              <p className="text-gray-500 mb-6">
                {statusFilter === 'all' 
                  ? 'Không có sản phẩm nào trong cửa hàng của bạn.' 
                  : statusFilter === 'active'
                    ? 'Không có sản phẩm nào đang hiển thị.'
                    : 'Không có sản phẩm nào đang bị ẩn.'}
              </p>
              {statusFilter !== 'all' && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => setStatusFilter('all')}
                >
                  Xem tất cả sản phẩm
                </button>
              )}
            </div>
          )}

          {/* Product Table */}
          {!loading && !error && sortedProducts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    {/* Đã xóa checkbox header */}
                    <th
                      className="p-4 text-left cursor-pointer w-2/5"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        TÊN SẢN PHẨM
                        {getSortIcon('name')}
                      </div>
                    </th>
                    <th className="p-4 text-left w-24">TỔNG SỐ LƯỢNG</th>
                    <th
                      className="p-4 text-left cursor-pointer w-24"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center">
                        GIÁ
                        {getSortIcon('price')}
                      </div>
                    </th>
                    <th className="p-4 text-left w-20">TRẠNG THÁI</th>
                    <th
                      className="p-4 text-left w-28 cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        NGÀY TẠO
                        {getSortIcon('createdAt')}
                      </div>
                    </th>
                    <th className="p-4 text-left w-32">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      {/* Đã xóa checkbox row */}
                      <td className="p-4 w-2/5">
                        <div className="flex items-center">
                          <div className="w-12 h-12 mr-4 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                            <img
                              src={product.thumbnail}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/api/placeholder/50/50";
                              }}
                            />
                          </div>
                          <span className="truncate font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 w-24">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {productVariants[product.id]
                              ? productVariants[product.id].reduce((total, variant) => total + (variant.stock || 0), 0)
                              : 0
                            }
                          </span>
                          <span className="ml-1 text-xs text-gray-500">sản phẩm</span>
                        </div>
                      </td>
                      <td className="p-4 w-24 font-medium">{product.price?.toLocaleString()}₫</td>
                      <td className="p-4 w-20">
                        <div className="flex items-center">
                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${product.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>{product.is_active ? 'Hiển thị' : 'Ẩn'}</span>
                        </div>
                      </td>
                      <td className="p-4 w-28">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={14} className="mr-1" />
                          <span>{formatDate(product.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-4 w-32">
                        <div className="flex space-x-2 justify-center">
                          <button
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            onClick={() => handleViewProduct(product)}
                            title="Xem chi tiết sản phẩm"
                          >
                            <Eye size={20} />
                          </button>
                          <button
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                            onClick={() => handleEditProduct(product)}
                            title="Chỉnh sửa sản phẩm"
                          >
                            <Edit size={20} />
                          </button>
                          
                          <button
                            className={`p-1 ${product.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'} rounded-full transition-colors`}
                            onClick={() => handleToggleProductStatus(product.id, product.is_active)}
                            disabled={updatingProducts[product.id]}
                            title={product.is_active ? "Ẩn sản phẩm khỏi cửa hàng" : "Hiển thị sản phẩm trên cửa hàng"}
                          >
                            {updatingProducts[product.id] ? (
                              <Loader size={20} className="animate-spin" />
                            ) : product.is_active ? (
                              <ToggleLeft size={20} />
                            ) : (
                              <ToggleRight size={20} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Thêm phân trang */}
              <div className="px-4 py-3 flex justify-between items-center border-t">
                <div className="flex items-center">
                  <button
                    className={`p-1 rounded-md border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Hiển thị 5 trang xung quanh trang hiện tại
                    const pageNumber = totalPages <= 5 
                      ? i + 1 
                      : Math.max(1, Math.min(currentPage - 2 + i, totalPages));
                      
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`mx-1 px-3 py-1 rounded-md ${currentPage === pageNumber ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  
                  <button
                    className={`p-1 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="flex items-center text-sm">
                  <span>Trang {currentPage} / {totalPages}</span>
                  <span className="mx-4">-</span>
                  <span>Hiển thị</span>
                  <select 
                    className="mx-2 border rounded p-1" 
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số mục hiển thị
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>/</span>
                  <span className="ml-2">{sortedProducts.length} sản phẩm</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editModalOpen && currentProduct && (
        <EditProductModal
          product={currentProduct}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateProduct}
        />
      )}

      {detailsModalOpen && viewProduct && (
        <ProductDetailsModal
          product={viewProduct}
          onClose={() => setDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};


export default ProductList;