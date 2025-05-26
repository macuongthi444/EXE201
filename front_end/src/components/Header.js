import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    Search,
    User,
    Heart,
    ShoppingCart,
    Globe,
    PiggyBank,
    ChevronRight,
    LogOut,
    MessageSquare,
    Package,
    MapPin,
    Lock,
    UserCircle,
    Store
} from 'lucide-react';
import CartModal from '../pages/cart/CartModal';
import logo from '../assets/LogoNew1.jpg';
import AuthService from '../services/AuthService';
import ApiService from '../services/ApiService';
import { MessageEventBus } from '../pages/UserProfile/components/Message';
import { CartEventBus } from '../pages/cart/CartEventBus';
import ProductCategoriesSidebar from './ProductCategoriesSidebar';
import CategoryDropdown from './CategoryDropdown';
import headerBg from '../assets/Header.jpg';

const flashingAnimation = `
@keyframes flash {
  0%, 100% { 
    color: #ff3333; 
    transform: scale(1);
  }
  25% { 
    color: #ff0000; 
    transform: scale(1.05);
  }
  50% { 
    color: #ffcc00; 
    transform: scale(1);
  }
  75% { 
    color: #ff3333; 
    transform: scale(1.05);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes trainEffect {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    transform: translateX(-70%);
    opacity: 1;
  }
  25% {
    transform: translateX(0%);
    opacity: 1;
  }
  45% {
    transform: translateX(0%);
    opacity: 1;
  }
  65% {
    transform: translateX(70%);
    opacity: 1;
  }
  75% {
    transform: translateX(70%);
    opacity: 0;
  }
  90% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% { 
    transform: translateX(100%);
    opacity: 0;
  }
}
.navbar-container {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  position: relative;
  margin-left: -100px; 
}

.promotion-container {
  position: relative;
  overflow: hidden;
  width: 340px;
  margin-left: auto;
}

.flashing-text {
  animation: flash 2s infinite, bounce 1.5s infinite, trainEffect 10s linear infinite;
  font-weight: bold;
  background-size: 200% 200%;
  color: white;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: visible;
  position: relative;
  min-width: 340px;
}

.flashing-text:hover {
  background-position: right center;
  transform: scale(1.05);
  animation-play-state: paused;
}

.piggy-bank-icon {
  animation: bounce 1.5s infinite;
  display: inline-block;
}

.user-dropdown {
  max-height: 400px;
  overflow-y: auto;
  z-index: 1900;
}
`;

const Header = () => {
    const navigate = useNavigate();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [language, setLanguage] = useState('Vietnamese');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCategoriesSidebarOpen, setIsCategoriesSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isLoggedIn());
    const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
    const categoriesButtonRef = useRef(null);
    const userDropdownRef = useRef(null);
    const userButtonRef = useRef(null);

    useEffect(() => {
        const unsubscribe = MessageEventBus.subscribe('unreadCountChanged', (count) => {
            setUnreadMessageCount(count);
        });
        return () => unsubscribe();
    }, []);

    const userId = currentUser?.id || currentUser?._id || "";

    useEffect(() => {
        if (isLoggedIn) {
            fetchCartTotal();
        } else {
            setCartTotal(0);
        }
    }, [isLoggedIn, userId]);

    useEffect(() => {
        if (isLoggedIn && isCartOpen) {
            fetchCartTotal();
        }
    }, [isCartOpen]);

    useEffect(() => {
        const unsubscribe = CartEventBus.subscribe('cartUpdated', () => {
            console.log('Cart updated, refreshing total...');
            fetchCartTotal();
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const handleStorageChange = () => {
            const user = AuthService.getCurrentUser();
            const loggedIn = AuthService.isLoggedIn();
            setIsLoggedIn(loggedIn);
            setCurrentUser(user);
            console.log('Header detected auth change:', { loggedIn, userRoles: user?.roles });
        };
        window.addEventListener('storage', handleStorageChange);
        handleStorageChange();
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const isSeller = () => {
        if (!isLoggedIn || !currentUser?.roles) return false;
        return currentUser.roles.some(role =>
            (typeof role === 'object' && role?.name && (role.name === 'SELLER' || role.name === 'ROLE_SELLER')) ||
            (typeof role === 'string' && (role === 'SELLER' || role === 'ROLE_SELLER'))
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price).replace('₫', 'đ');
    };

    const fetchCartTotal = async () => {
        if (!userId) {
            setCartTotal(0);
            return;
        }
        try {
            const response = await ApiService.get(`/cart/user/${userId}`);
            if (response && response.items && response.items.length > 0) {
                const itemsWithCompleteVariants = await ensureCompleteVariantInfo(response.items);
                const total = itemsWithCompleteVariants.reduce((sum, item) => {
                    if (item.variant_id && typeof item.variant_id === 'object' && item.variant_id.price) {
                        return sum + (item.variant_id.price * item.quantity);
                    }
                    const price = item.product_id && typeof item.product_id === 'object'
                        ? (item.product_id.discounted_price || item.product_id.price || 0)
                        : 0;
                    return sum + price * item.quantity;
                }, 0);
                setCartTotal(total);
            } else {
                setCartTotal(0);
            }
        } catch (error) {
            console.error('Error fetching cart total:', error);
            setCartTotal(0);
        }
    };

    const ensureCompleteVariantInfo = async (items) => {
        const updatedItems = [...items];
        for (let i = 0; i < updatedItems.length; i++) {
            const item = updatedItems[i];
            if (item.variant_id && (typeof item.variant_id === 'string' || !item.variant_id.attributes)) {
                const productId = typeof item.product_id === 'object'
                    ? item.product_id._id
                    : item.product_id;
                const variantId = typeof item.variant_id === 'string'
                    ? item.variant_id
                    : item.variant_id._id;
                if (productId && variantId) {
                    try {
                        const variants = await ApiService.get(`/product-variant/product/${productId}`, false);
                        const fullVariant = variants.find(v => v._id === variantId);
                        if (fullVariant) {
                            updatedItems[i] = { ...item, variant_id: fullVariant };
                        }
                    } catch (error) {
                        console.error(`Failed to fetch complete variant data for product ${productId}:`, error);
                    }
                }
            }
        }
        return updatedItems;
    };

    const toggleCategoriesSidebar = () => {
        setIsCategoriesSidebarOpen(!isCategoriesSidebarOpen);
    };

    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(!isUserDropdownOpen);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/categories?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = () => {
        AuthService.logout();
        setIsUserDropdownOpen(false);
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/');
        window.location.reload();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target) &&
                userButtonRef.current &&
                !userButtonRef.current.contains(event.target)
            ) {
                setIsUserDropdownOpen(false);
            }
        };
        if (isUserDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUserDropdownOpen]);

    return (
        <div
            className="bg-cover bg-center bg-no-repeat shadow-sm relative"
            style={{ backgroundImage: `url(${headerBg})`, minHeight: '220px', zIndex: 1 }}
        >
            <div className="bg-white bg-opacity-80 shadow-sm relative">
                <style>{flashingAnimation}</style>
                <nav
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-white bg-opacity-80 shadow px-4 py-2 rounded-md max-w-6xl w-full"
                    style={{ zIndex: 1800 }}
                >
                    <div className="flex items-center justify-between">
                        <a href="/" className="navbar-logo relative">
                            <img src={logo} alt="GreenGarden" className="w-28 h-16 object-contain scale-125" />
                        </a>
                        <div className="flex items-center justify-between mt-2 space-x-6 text-sm px-8">
                            <a href="/introduction" className="hover:text-purple-600 font-semibold">Giới Thiệu</a>
                            <CategoryDropdown />
                            <a href="/categories" className="hover:text-purple-600 font-semibold">Sản phẩm</a>
                            {!isSeller() && (
                                <a href="/shop-registration" className="text-red-500 font-semibold hover:text-red-600">
                                    Đăng ký bán hàng
                                </a>
                            )}
                        </div>
                        <div className="flex-grow flex items-center space-x-4 px-4">
                            <form onSubmit={handleSearch} className="flex-grow relative w-2/5">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm sản phẩm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    aria-label="Tìm kiếm sản phẩm"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 bottom-0 px-4 bg-[#2E7D32] text-white rounded-r-md hover:bg-purple-700"
                                    aria-label="Tìm kiếm"
                                >
                                    <Search size={20} />
                                </button>
                            </form>
                        </div>
                        <div className="flex items-center space-x-12">
                            <div className="relative">
                                {isLoggedIn ? (
                                    <button
                                        ref={userButtonRef}
                                        className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs relative"
                                        onClick={toggleUserDropdown}
                                        aria-label="Menu tài khoản"
                                        aria-expanded={isUserDropdownOpen}
                                    >
                                        <User size={24} />
                                        <span>Tài khoản</span>
                                        {unreadMessageCount > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                            </div>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        className="flex flex-col items-center text-gray-600 hover:text-purple-600 text-xs"
                                        onClick={() => navigate('/login')}
                                        aria-label="Đăng nhập"
                                    >
                                        <User size={24} />
                                        <span>Đăng nhập</span>
                                    </button>
                                )}
                                {isLoggedIn && isUserDropdownOpen && (
                                    <div
                                        ref={userDropdownRef}
                                        className="absolute user-dropdown right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border"
                                        role="menu"
                                    >
                                        <div className="px-4 py-2 border-b">
                                            <div className="font-medium text-gray-900">{currentUser?.email}</div>
                                        </div>
                                        <a
                                            href="/user-profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            role="menuitem"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <UserCircle size={16} className="mr-2" />
                                            Tài khoản của tôi
                                        </a>
                                        <a
                                            href="/user-profile/orders"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            role="menuitem"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <Package size={16} className="mr-2" />
                                            Đơn mua
                                        </a>
                                        <a
                                            href="/user-profile/messages"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center relative"
                                            role="menuitem"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <MessageSquare size={16} className="mr-2" />
                                            Tin nhắn
                                            {unreadMessageCount > 0 && (
                                                <div className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                                </div>
                                            )}
                                        </a>
                                        <a
                                            href="/user-profile/addresses"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            role="menuitem"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <MapPin size={16} className="mr-2" />
                                            Địa chỉ nhận hàng
                                        </a>
                                        <a
                                            href="/user-profile/followed-shops"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            role="menuitem"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <Store size={16} className="mr-2" />
                                            Cửa hàng đã theo dõi
                                        </a>
                                        <a
                                            href="/user-profile/password"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                            role="menuitem"
                                            onClick={() => setIsUserDropdownOpen(false)}
                                        >
                                            <Lock size={16} className="mr-2" />
                                            Đổi mật khẩu
                                        </a>
                                        {isSeller() && (
                                            <a
                                                href="/seller-dashboard"
                                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 flex items-center"
                                                role="menuitem"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                            >
                                                <Store size={16} className="mr-2" />
                                                Quản lý cửa hàng
                                            </a>
                                        )}
                                        <div className="border-t mt-1">
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsUserDropdownOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                                role="menuitem"
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
<div className="flex items-center gap-3 bg-white/80 px-3 py-2 rounded-lg shadow-md">
    <button
        id="cartbutton"
        className="cartbutton flex flex-col items-center text-purple-700 hover:text-white hover:bg-purple-600 active:bg-purple-800 active:scale-110 transition-all duration-200 ease-in-out text-sm font-bold rounded-md p-2 border-2 border-purple-300 hover:border-purple-500"
        onClick={() => setIsCartOpen(true)}
        aria-label="Mở giỏ hàng"
    >
        <ShoppingCart size={28} />
        <span>Giỏ hàng</span>
    </button>
    <div className="flex flex-col items-center text-purple-700 text-sm font-semibold">
        <span>{formatPrice(cartTotal)}</span>
    </div>
</div>

                            <CartModal 
    isOpen={isCartOpen} 
    onClose={() => setIsCartOpen(false)} 
    style={{ 
        zIndex: 1500, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Nền mờ đậm hơn
        border: '3px solid #6b46c1', // Viền dày hơn
        borderRadius: '10px', // Góc bo tròn lớn hơn
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Bóng đổ đậm hơn
        transform: isCartOpen ? 'scale(1)' : 'scale(0.9)', 
        opacity: isCartOpen ? 1 : 0, // Hiệu ứng mờ dần
        transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out' // Chuyển động và độ mờ
    }} 
/>
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default Header;