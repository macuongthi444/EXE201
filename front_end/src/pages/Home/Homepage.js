import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon } from 'lucide-react';
import image1 from '../../assets/ImageSliderDetail/1684222267_Bia-WEB-1.jpg';
import image2 from '../../assets/ImageSliderDetail/1684223894_Cay-con.jpg';
import image3 from '../../assets/ImageSliderDetail/1585185542_florist02102016435-A.jpg';
import image4 from '../../assets/ImageSliderDetail/1684225761_Klasmann.jpg';
import image5 from '../../assets/ImageSliderDetail/hhtt.jpg';
import ApiService from '../../services/ApiService';
import CartModal from '../cart/CartModal';
import { useAuth } from '../Login/context/AuthContext';
import { CartEventBus } from '../cart/CartEventBus';
import ProductCard from './components/ProductCard';
import CategorySidebar from './components/CategorySidebar';
import PromotionalBanners from './components/PromotionalBanners';
import ProductModal from './components/ProductModal';
import ProductSection from './components/ProductSection';
import ImageSlider from './components/ImageSlider';
import products1 from './components/ImageSliderDetail';
import { BE_API_URL } from '../../config/config';

const TroocEcommerce = () => {
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productQuantity, setProductQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [addCartMessage, setAddCartMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [cartRefreshTrigger, setCartRefreshTrigger] = useState(0);
    const [products, setProducts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const bannerImages = [
        { src: image1, alt: "Banner 1" },
        { src: image2, alt: "Banner 2" },
        { src: image3, alt: "Banner 3" },
        { src: image4, alt: "Banner 4" },
        { src: image5, alt: "Banner 5" },
    ];

    const getImagePath = (imgPath) => {
        if (!imgPath) return "";
        if (imgPath.startsWith('http')) return imgPath;
        if (imgPath.startsWith('/Uploads')) return `${BE_API_URL}${imgPath}`;
        const fileName = imgPath.split("\\").pop();
        return `${BE_API_URL}/Uploads/products/${fileName}`;
    };

    const { currentUser, isLoggedIn } = useAuth();
    const userId = currentUser?.id || currentUser?._id || "";

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const productsData = await ApiService.get('/product', true);
                const activeProducts = productsData.filter(product =>
                    product.is_delete === false || product.is_delete === 'false' || product.is_delete === 0
                );
                const productsWithImages = activeProducts.map(product => ({
                    ...product,
                    thumbnail: getImagePath(product.thumbnail),
                }));
                let productsInStock = [];
                const productStockChecks = await Promise.all(
                    productsWithImages.map(async (product) => {
                        try {
                            const variants = await ApiService.get(`/product-variant/product/${product._id}`, false);
                            const activeVariants = variants.filter(variant =>
                                variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
                            );
                            const hasStock = activeVariants.length === 0 ||
                                activeVariants.some(variant =>
                                    variant.stock === undefined || variant.stock > 0
                                );
                            return { product, hasStock };
                        } catch (error) {
                            console.error(`Error checking variants for product ${product._id}:`, error);
                            return { product, hasStock: true };
                        }
                    })
                );
                productsInStock = productStockChecks
                    .filter(item => item.hasStock)
                    .map(item => item.product);
                setProducts(productsInStock);
                const categoriesData = await ApiService.get('/categories', false);
                setCategories(categoriesData);
                const sortedByDate = [...productsInStock].sort((a, b) =>
                    new Date(b.created_at) - new Date(a.created_at)
                );
                setNewProducts(sortedByDate.slice(0, 4));
                const featuredProducts = productsInStock.filter(product => product.is_feature);
                const hotProducts = productsInStock.filter(product => product.is_hot);
                const sortedBySold = [...productsInStock].sort((a, b) => b.sold - a.sold);
                const combined = [...featuredProducts, ...hotProducts, ...sortedBySold];
                const uniqueIds = new Set();
                const uniqueProducts = [];
                for (const product of combined) {
                    if (!uniqueIds.has(product._id)) {
                        uniqueIds.add(product._id);
                        uniqueProducts.push(product);
                        if (uniqueProducts.length >= 10) break;
                    }
                }
                setRecommendedProducts(uniqueProducts);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(price)
            .replace('₫', 'đ');
    };

    const addToCart = async (product, quantity = 1, fromModal = false) => {
        if (!isLoggedIn) {
            window.location.href = "/login";
            return;
        }
        if (fromModal) {
            try {
                const variants = await ApiService.get(`/product-variant/product/${product._id}`, false);
                const activeVariants = variants.filter(variant =>
                    variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
                );
                const hasVariants = activeVariants && activeVariants.length > 0;
                if (hasVariants && !selectedVariant) {
                    setAddCartMessage("Vui lòng chọn biến thể sản phẩm trước khi thêm vào giỏ hàng");
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                    }, 3000);
                    return;
                }
            } catch (error) {
                console.error("Error checking product variants:", error);
            }
        }
        try {
            let cartId;
            try {
                const cartResponse = await ApiService.get(`/cart/user/${userId}`, false);
                cartId = cartResponse._id;
            } catch (error) {
                const newCart = await ApiService.post('/cart/create', { user_id: userId });
                cartId = newCart._id;
            }
            const payload = {
                cart_id: cartId,
                product_id: product._id,
                quantity: fromModal ? productQuantity : quantity
            };
            if (fromModal && selectedVariant) {
                payload.variant_id = selectedVariant._id;
            }
            await ApiService.post('/cart/add-item', payload);
            CartEventBus.publish('cartUpdated');
            if (showCartModal) {
                setShowCartModal(false);
            }
            setAddCartMessage(`${product.name} đã được thêm vào giỏ hàng!`);
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
            }, 3000);
            setCartRefreshTrigger(prev => prev + 1);
            if (fromModal) {
                setShowProductModal(false);
                setProductQuantity(1);
                setSelectedVariant(null);
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
            setAddCartMessage("Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.");
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
            }, 3000);
        }
    };

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
        if (variant) {
            setProductQuantity(1);
        }
    };

    const handleQuantityChange = (newQuantity) => {
        setProductQuantity(newQuantity);
    };

    const handleProductClick = async (product) => {
        try {
            const updatedProduct = await ApiService.get(`/product/${product._id}`, false);
            if (updatedProduct.is_active === true || updatedProduct.is_active === 'true' || updatedProduct.is_active === 1) {
                const variants = await ApiService.get(`/product-variant/product/${updatedProduct._id}`, false);
                const activeVariants = variants.filter(variant =>
                    variant.is_active === true || variant.is_active === 'true' || variant.is_active === 1
                );
                const hasStock = activeVariants.length === 0 ||
                    activeVariants.some(variant =>
                        variant.stock === undefined || variant.stock > 0
                    );
                if (hasStock) {
                    setSelectedProduct(updatedProduct);
                    setShowProductModal(true);
                    setProductQuantity(1);
                    setSelectedVariant(null);
                } else {
                    setAddCartMessage("Sản phẩm này hiện đã hết hàng.");
                    setShowMessage(true);
                    setTimeout(() => {
                        setShowMessage(false);
                    }, 3000);
                }
            } else {
                setAddCartMessage("Sản phẩm này hiện không có sẵn.");
                setShowMessage(true);
                setTimeout(() => {
                    setShowMessage(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error fetching product details:", error);
            setSelectedProduct(product);
            setShowProductModal(true);
            setProductQuantity(1);
            setSelectedVariant(null);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Đang tải dữ liệu...</h2>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#F1F5F9] min-h-screen flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2 text-red-600">Đã xảy ra lỗi</h2>
                    <p className="text-gray-600">{error}</p>
                    <button
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-[#F1F5F9] pb-20 relative' style={{ zIndex: 100 }}>
            {showMessage && (
                <div className="fixed top-5 right-5 bg-white p-4 rounded-lg shadow-lg z-[20] border-l-4 border-green-500">
                    <p>{addCartMessage}</p>
                </div>
            )}
            <CartModal
                isOpen={showCartModal}
                onClose={() => setShowCartModal(false)}
                refreshTrigger={cartRefreshTrigger}
                style={{ zIndex: 1500 }}
            />
            <div className="max-w-7xl mx-auto">
                <div className="w-full">
                    <div className="pt-16 pb-4 bg-[#F1F5F9]" style={{ zIndex: 100, position: 'relative' }}>
                        <div className="space-y-2">
                            <div className="w-full flex gap-x-8 justify-center">
                                <div className='h-80' style={{ zIndex: 100 }}>
                                    <ImageSlider products={products1} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <ProductSection
                        title="SẢN PHẨM MỚI"
                        products={newProducts}
                        hoveredProduct={hoveredProduct}
                        setHoveredProduct={setHoveredProduct}
                        handleProductClick={handleProductClick}
                        addToCart={addToCart}
                        formatPrice={formatPrice}
                    />
                    <PromotionalBanners />
                    <div className="mt-10 p-4 bg-white pb-10">
                        <div className="w-full">
                            <h2 className="text-lg text-center font-bold text-red-500">GỢI Ý HÔM NAY</h2>
                        </div>
                        <div className="bg-red-500 h-[4px] my-2"></div>
                        <div className="grid grid-cols-4 gap-4 pt-8 px-4">
                            {recommendedProducts.slice(0, 4).map((product, index) => (
                                <ProductCard
                                    key={product._id}
                                    product={product}
                                    index={`rec1-${index}`}
                                    isHoveredProduct={hoveredProduct === `rec1-${index}`}
                                    onHover={setHoveredProduct}
                                    onClick={handleProductClick}
                                    onAddToCart={addToCart}
                                    formatPrice={formatPrice}
                                />
                            ))}
                        </div>
                        {recommendedProducts.length > 5 && (
                            <div className="grid grid-cols-4 gap-4 pt-8">
                                {recommendedProducts.slice(4, 8).map((product, index) => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        index={`rec2-${index}`}
                                        isHoveredProduct={hoveredProduct === `rec2-${index}`}
                                        onHover={setHoveredProduct}
                                        onClick={handleProductClick}
                                        onAddToCart={addToCart}
                                        formatPrice={formatPrice}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showProductModal && selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    selectedVariant={selectedVariant}
                    quantity={productQuantity}
                    onVariantSelect={handleVariantSelect}
                    onQuantityChange={handleQuantityChange}
                    onAddToCart={addToCart}
                    onClose={() => setShowProductModal(false)}
                    formatPrice={formatPrice}
                />
            )}
            <button
                className="fixed bottom-24 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 z-[10] flex items-center justify-center"
                onClick={() => {
                    setShowCartModal(true);
                }}
            >
                <ShoppingCartIcon size={24} />
            </button>
        </div>
    );
};

export default TroocEcommerce;