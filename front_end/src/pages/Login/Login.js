import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { BE_API_URL } from "../../config/config";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false); // Thêm state cho hiển thị mật khẩu
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isLoggedIn, login, handleGoogleAuthLogin, userRoles } = useAuth();

    // Hàm chuyển hướng dựa trên vai trò
    const redirectBasedOnRole = (roles = []) => {
        console.log("Redirecting based on roles:", roles);
        let redirectPath = '/';
        if (!Array.isArray(roles)) {
            console.error("Roles is not an array:", roles);
            roles = [];
        }
        const hasAdminRole = roles.some(role => typeof role === 'string' && (role.toUpperCase() === 'ROLE_ADMIN' || role.toUpperCase() === 'ADMIN'));
        const hasSellerRole = roles.some(role => typeof role === 'string' && (role.toUpperCase() === 'ROLE_SELLER' || role.toUpperCase() === 'SELLER'));
        if (hasAdminRole) {
            redirectPath = '/admin';
            console.log("Redirecting to admin dashboard");
        } else if (hasSellerRole) {
            redirectPath = '/seller-dashboard';
            console.log("Redirecting to seller dashboard");
        } else {
            console.log("Redirecting to home (member role)");
        }
        navigate(redirectPath);
    };

    // Kiểm tra đăng nhập và chuyển hướng
    useEffect(() => {
        if (isLoggedIn && userRoles) {
            console.log("User is already logged in with roles:", userRoles);
            redirectBasedOnRole(userRoles);
        }
    }, [isLoggedIn, userRoles, navigate]);

    // Xử lý Google auth redirect
    useEffect(() => {
        const googleAuthData = searchParams.get('googleAuth');
        if (googleAuthData) {
            processGoogleAuthData(googleAuthData);
        }
    }, [searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const result = await login(formData.email, formData.password);
            console.log("Login successful, result:", result);
            const roles = result?.roles || userRoles || [];
            console.log("Roles for redirection:", roles);
            redirectBasedOnRole(roles);
        } catch (error) {
            console.error("Login error:", error);
            setError(error || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRedirect = () => {
        window.location.href = `${BE_API_URL}/api/auth/google`;
    };

    const processGoogleAuthData = (userDataEncoded) => {
        try {
            const userData = JSON.parse(decodeURIComponent(userDataEncoded));
            console.log("Google auth data:", userData);
            const success = handleGoogleAuthLogin(userData);
            if (success) {
                console.log("Google login successful, roles:", userData.roles);
                setTimeout(() => {
                    redirectBasedOnRole(userData.roles || []);
                }, 500);
            } else {
                setError("Lỗi xử lý dữ liệu đăng nhập Google");
            }
        } catch (error) {
            console.error("Error processing Google auth data:", error);
            setError("Lỗi xử lý đăng nhập Google: " + error.message);
        }
    };

    return (
        <div className="flex h-screen w-full">
            <div className="w-5/12 bg-green-600 flex items-center p-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="relative z-10">
                    <h1 className="text-white text-6xl font-bold leading-tight">
                        The Real<br />
                        Options On<br />
                        Customers
                    </h1>
                </div>
                <img 
                    src="https://cellphones.com.vn/sforum/wp-content/uploads/2023/12/hinh-nen-xanh-la-2.jpg" 
                    alt="Decorative plants" 
                    className="absolute right-0 bottom-0 w-3/4 h-auto opacity-80"
                />
            </div>
            <div className="w-7/12 flex items-center justify-center">
                <div className="w-full max-w-md px-8">
                    <h2 className="text-3xl font-bold text-green-600 mb-8">Đăng nhập tài khoản</h2>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block mb-1">
                                <span className="font-medium">Email <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="abcxyz@gmail.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">
                                <span className="font-medium">Password <span className="text-red-500">*</span></span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="********"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng nhập"}
                        </button>
                    </form>
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập bằng</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={handleGoogleRedirect}
                                className="flex items-center justify-center px-6 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
                            >
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-5 w-5">
                                        <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                        <path fill="#34A853" d="M168.9 350.2L212.7 470 340.9 136.1 168.9 350.2z" />
                                        <path fill="#FBBC05" d="M168.9 350.2L212.7 470 340.9 136.1 168.9 350.2z" />
                                        <path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                                    </svg>
                                </div>
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <a href="/forgot-password" className="text-green-600 hover:underline text-sm">
                            Bạn quên mật khẩu? Click vào đây
                        </a>
                        <div className="mt-1">
                            <a href="/register" className="text-green-600 hover:underline text-sm">
                                Đăng kí tài khoản
                            </a>
                        </div>
                        <div className="mt-1">
                            <a href="/" className="text-green-600 hover:underline text-sm">
                                Về trang chủ
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;