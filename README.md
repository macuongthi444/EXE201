# EXE201 - Thương Mại Điện Tử Kết Hợp AI

Dự án **EXE201** là một nền tảng thương mại điện tử hiện đại, tích hợp Trí tuệ nhân tạo (AI) giúp tối ưu hóa trải nghiệm người dùng và quản lý cửa hàng hiệu quả. Hệ thống được xây dựng trên mô hình Client-Server với các công nghệ tiên tiến nhất.

## 🚀 Tính năng chính

### 🛒 Dành cho Người dùng (Khách hàng)
- **Hệ thống Tài khoản:** Đăng ký, đăng nhập qua JWT và Google OAuth 2.0.
- **Mua sắm:** Xem sản phẩm, phân loại theo thương hiệu/danh mục, quản lý giỏ hàng.
- **Thanh toán:** Tích hợp cổng thanh toán **PayOS** an toàn và nhanh chóng.
- **Đánh giá & Phản hồi:** Đánh giá sản phẩm và nhận xét dịch vụ cửa hàng.
- **Trò chuyện:** Chat trực tuyến với chủ cửa hàng qua Socket.IO.
- **Hỗ trợ AI:** Tích hợp **Google Gemini AI** để hỗ trợ tư vấn sản phẩm và giải đáp thắc mắc.

### 🏪 Dành cho Chủ cửa hàng (Shops)
- **Quản lý Sản phẩm:** Thêm/sửa/xóa sản phẩm, quản lý biến thể (variant) và thuộc tính (attribute).
- **Quản lý Đơn hàng:** Theo dõi trạng thái đơn hàng, vận chuyển.
- **Khuyến mãi:** Tạo mã giảm giá (Coupon) và các chương trình ưu đãi (Discount).
- **Thống kê:** Báo cáo doanh thu và biểu đồ tăng trưởng (sử dụng Recharts).
- **Quản lý Tài chính:** Kết nối tài khoản ngân hàng để nhận thanh toán.

### 🛡️ Quản trị viên (Admin)
- Quản lý người dùng, phân quyền (Role management).
- Phê duyệt cửa hàng và kiểm duyệt nội dung.

---

## 🛠️ Công nghệ sử dụng

### Frontend (ReactJS)
- **Thư viện chính:** React 19, React Router Dom.
- **Giao diện:** Tailwind CSS, Lucide Icons, Swiper (carousel).
- **Dữ liệu & Biểu đồ:** Axios, Recharts.
- **Real-time:** Socket.io-client.
- **Thông báo:** React Toastify.

### Backend (Node.js & Express)
- **Cơ sở dữ liệu:** MongoDB (Mongoose).
- **Xác thực:** JWT, Passport.js (Google OAuth).
- **AI:** Google Generative AI (@google/generative-ai).
- **Thanh toán:** PayOS SDK.
- **Lưu trữ hình ảnh:** Cloudinary & Multer.
- **Gửi Email:** Nodemailer.
- **Real-time:** Socket.IO.

---

## 💻 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js >= 18.x
- MongoDB (Local hoặc Atlas)

### 1. Cấu hình Backend
Di chuyển vào thư mục `back_end`:
```bash
cd back_end
npm install
```
Tạo file `.env` và cấu hình các biến sau:
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_NAME`, `KEY`, `SECRET`
- `PAYOS_CLIENT_ID`, `API_KEY`, `CHECKSUM_KEY`
- `GEMINI_API_KEY`

Chạy server:
```bash
npm start
```

### 2. Cấu hình Frontend
Di chuyển vào thư mục `front_end`:
```bash
cd front_end
npm install
```
Chạy ứng dụng:
```bash
npm start
```

---

## 📁 Cấu trúc thư mục
- `/back_end`: Chứa mã nguồn server, API, models và xử lý logic AI.
- `/front_end`: Giao diện người dùng build bằng React.
- `/docs` (nếu có): Tài liệu hướng dẫn sử dụng và kiến trúc hệ thống.

---

## 📝 Giấy phép
Dự án được phát triển cho mục đích học tập trong môn học **EXE201**.

---
*Phát triển bởi Nhóm dự án EXE201.*