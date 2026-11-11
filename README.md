# GIAO DIỆN HỆ THỐNG QUẢN LÝ NHÂN VIÊN

## 1. Giới thiệu

Đây là phần giao diện người dùng (Frontend) của dự án Employee Management System, được xây dựng bằng React và Vite.

Giao diện kết nối với Backend Spring Boot thông qua RESTful API, hỗ trợ quản trị viên quản lý nhân sự và nhân viên theo dõi thông tin cá nhân, chấm công.

## 2. Công nghệ sử dụng

- **Thư viện giao diện:** React
- **Công cụ xây dựng:** Vite
- **Ngôn ngữ:** JavaScript
- **Định tuyến:** React Router DOM
- **Gọi API:** Axios
- **Giao diện:** CSS

## 3. Các chức năng chính

### Dành cho quản trị viên (ADMIN)

- Xem tổng quan tình hình nhân sự trên Dashboard.
- Quản lý thông tin nhân viên.
- Quản lý phòng ban.
- Quản lý tài khoản và phân quyền.
- Theo dõi lịch sử chấm công.
- Tạo mã QR phục vụ chấm công.

### Dành cho nhân viên (EMPLOYEE)

- Đăng nhập vào hệ thống.
- Xem thông tin cá nhân.
- Theo dõi thông tin chấm công.
- Quét mã QR để xác nhận chấm công.

## 4. Cấu trúc thư mục

```text
src/
├── layouts/
│   └── AdminLayout.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── EmployeeManagement.jsx
│   ├── DepartmentManagement.jsx
│   ├── AccountManagement.jsx
│   ├── AttendanceManagement.jsx
│   ├── EmployeeDashboard.jsx
│   ├── QrAttendance.jsx
│   └── QrScanner.jsx
├── services/
│   └── api.js
├── App.jsx
├── App.css
├── index.css
└── main.jsx
```

## 5. Cài đặt và chạy dự án

### Yêu cầu môi trường

- Node.js.
- npm.
- Backend Spring Boot đang hoạt động.

### Bước 1: Clone dự án

```bash
git clone https://github.com/nguyentuanvu-26/employee-management-frontend.git
```

### Bước 2: Di chuyển vào thư mục dự án

```bash
cd employee-management-frontend
```

### Bước 3: Cài đặt thư viện

```bash
npm install
```

### Bước 4: Khởi chạy giao diện

```bash
npm run dev
```

Mở địa chỉ được hiển thị trong Terminal, mặc định:

`http://localhost:5173`

## 6. Kết nối Backend

Frontend sử dụng Axios để gửi HTTP Request đến Backend Spring Boot.

Backend mặc định chạy tại:

`http://localhost:8080`

Đảm bảo Backend và MySQL đã được khởi chạy trước khi sử dụng các chức năng của hệ thống.

## 7. Tác giả

**Nguyễn Tuấn Vũ**

Dự án cá nhân phục vụ học tập và thực hành phát triển ứng dụng Web với React và Spring Boot.