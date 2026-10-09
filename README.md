# 🍎 FruitWeb — Online Fresh Fruit E-Commerce Platform

FruitWeb là nền tảng thương mại điện tử chuyên cung cấp trái cây tươi sạch trực tuyến. Dự án được xây dựng với kiến trúc Full-Stack hiện đại, an toàn và sẵn sàng cho môi trường production.

---

## 🏗️ 1. Kiến trúc hệ thống (Architecture)

Toàn bộ hệ thống chạy qua kiến trúc container hóa với Nginx đóng vai trò Reverse Proxy & Web Server:

```text
Browser / Client
      │
      ▼
Nginx Reverse Proxy (:80)
   ├── /api/*  ────────► FastAPI Backend (:8000)
   └── /*      ────────► React Frontend (Static Build)
                                │
                                ▼
                         PostgreSQL 16 (:5432)
                                │
                         fruitweb_pgdata (Named Volume)
```

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS.
- **Backend**: FastAPI (Python 3.12) + SQLAlchemy ORM + Pydantic v2.
- **Database**: PostgreSQL 16 Alpine với volume liên tục `fruitweb_pgdata`.
- **Database Migrations**: Alembic.
- **Authentication & Security**: JWT (HS256) + bcrypt, Refresh Token rotation, CORS hạn chế theo môi trường, validation dữ liệu chặt chẽ.
- **Reverse Proxy & Deployment**: Nginx Alpine + Docker Compose đa dịch vụ có healthcheck độc lập.

---

## ✨ 2. Trạng thái và tính năng dự án

### ✅ Các tính năng đã hoàn thành (Phase 7 – Phase 11)
- **Phase 7 (Backend Production Readiness & Security Hardening)**:
  - Cấu hình môi trường an toàn (`DEBUG=false`, bắt buộc khóa JWT tối thiểu 32 ký tự trên production).
  - CORS strict per environment, chuẩn hóa xử lý lỗi thống nhất `ApiResponse`.
  - Cơ chế băm mật khẩu `bcrypt` và kiểm soát đặc quyền người dùng.
- **Phase 8 (Frontend & Backend Integration: Auth, Categories, Products)**:
  - Tích hợp API xác thực (Đăng ký, Đăng nhập, Refresh Token, Thông tin người dùng).
  - Tích hợp danh mục và hiển thị sản phẩm trực tiếp từ PostgreSQL thông qua FastAPI.
- **Phase 9 (Full-Stack Dockerization)**:
  - Đóng gói toàn bộ hệ thống bằng Docker Compose (`postgres`, `backend`, `frontend`).
  - Nginx reverse proxy định tuyến `/api` tới backend và phục vụ SPA frontend.
  - Sử dụng volume PostgreSQL `fruitweb_pgdata` bảo toàn dữ liệu.
- **Phase 10 (Backend Cart, Orders, Coupons & Admin User Management)**:
  - **Cart API**: Xem giỏ hàng, thêm sản phẩm, cập nhật số lượng, xóa từng món, làm trống giỏ hàng. Tính toán giá server-side và kiểm tra tồn kho.
  - **Orders API**: Đặt hàng (từ giỏ hàng hoặc danh sách mặt hàng), tính tiền server-side, trừ tồn kho trong transaction an toàn, xem lịch sử đơn, chi tiết đơn, hủy đơn (hoàn trả tồn kho), Admin xem toàn bộ và cập nhật trạng thái đơn hàng.
  - **Coupons API**: Admin tạo/quản lý mã giảm giá (percentage, fixed amount, hạn sử dụng, giới hạn lượt dùng, đơn hàng tối thiểu, mức giảm tối đa). User kiểm tra và áp dụng mã giảm giá.
  - **Admin User Management API**: Admin xem danh sách người dùng (phân trang, tìm kiếm), xem chi tiết, đổi vai trò (USER ↔ ADMIN), khóa/mở khóa tài khoản. Bảo vệ chống tự hạ quyền hoặc khóa tài khoản của chính mình và bảo vệ Admin cuối cùng.
- **Phase 11 (Frontend Integration: Cart, Orders, Coupons & Admin Users)**:
  - **Cart Frontend**: Giỏ hàng kết nối trực tiếp với backend qua `/api/cart`. Đồng bộ thêm, sửa số lượng, xóa sản phẩm và làm trống giỏ hàng theo thời gian thực.
  - **Coupons Frontend**: Nhập mã giảm giá tại Giỏ hàng và Trang Thanh toán, gọi trực tiếp `POST /api/coupons/validate` để xác thực và áp dụng số tiền giảm phía server.
  - **Orders Frontend**: Trang thanh toán `/checkout` gửi thông tin đơn hàng tới `POST /api/orders`, giỏ hàng tự động làm trống sau khi đặt hàng thành công. Trang `/orders` hiển thị lịch sử đơn hàng, xem chi tiết modal và hủy đơn khi đơn ở trạng thái `pending`.
  - **Admin User Management Frontend**: Trang `/admin/users` hỗ trợ tìm kiếm, lọc theo vai trò (USER/ADMIN), lọc trạng thái (Active/Blocked), phân trang, xem chi tiết, đổi quyền vai trò và khóa/mở khóa tài khoản có hộp thoại xác nhận và bảo vệ an toàn.
  - **Admin Orders Frontend**: Trang `/admin/orders` quản lý toàn bộ đơn hàng hệ thống, phân trang, lọc theo trạng thái, chuyển đổi trạng thái đơn hàng theo đúng state machine của backend.

### ⏳ Giới hạn hiện tại / Kế hoạch tiếp theo
- **Cổng thanh toán trực tuyến**: Hiện tại hệ thống hỗ trợ phương thức đặt hàng thanh toán khi nhận hàng (COD). Tùy chọn thanh toán trực tuyến là chế độ mô phỏng đặt trước và chưa tích hợp cổng thanh toán bên thứ ba (VNPAY / MoMo / ZaloPay).
- **Email Service**: Chưa cấu hình SMTP/dịch vụ gửi email thông báo hóa đơn tự động.
- **Triển khai Cloud**: Triển khai hạ tầng Cloud phân tán (Oracle Cloud / AWS).

---

## 🌐 3. Danh sách Frontend Routes

| Đường dẫn (Route) | Quyền truy cập | Mô tả |
|---|---|---|
| `/` | Public | Trang chủ giới thiệu sản phẩm nổi bật, danh mục |
| `/products` | Public | Danh sách sản phẩm, bộ lọc giá, tìm kiếm, phân trang |
| `/products/:id` | Public | Chi tiết sản phẩm, chọn số lượng, thêm vào giỏ |
| `/categories/:slug` | Public | Xem sản phẩm theo danh mục |
| `/search` | Public | Kết quả tìm kiếm sản phẩm theo từ khóa |
| `/cart` | Public / Customer | Giỏ hàng, cập nhật số lượng, xóa món, áp dụng coupon |
| `/checkout` | Authenticated | Điền thông tin giao hàng, chọn thanh toán, đặt đơn |
| `/order-success` | Authenticated | Thông báo đặt hàng thành công và mã đơn hàng |
| `/orders` | Authenticated | Lịch sử đơn hàng, chi tiết đơn hàng, hủy đơn |
| `/profile` | Authenticated | Quản lý thông tin tài khoản và địa chỉ giao hàng |
| `/login` | Public | Đăng nhập tài khoản |
| `/register` | Public | Đăng ký tài khoản mới |
| `/admin` | ADMIN | Dashboard thống kê tổng quan doanh thu, đơn hàng |
| `/admin/products` | ADMIN | Quản lý danh sách, tạo mới, chỉnh sửa, xóa sản phẩm |
| `/admin/categories` | ADMIN | Quản lý danh mục sản phẩm |
| `/admin/orders` | ADMIN | Quản lý đơn hàng toàn hệ thống, chuyển trạng thái |
| `/admin/users` | ADMIN | Quản lý người dùng, phân quyền, khóa/mở khóa tài khoản |

---

## 📡 4. Danh sách REST API Endpoints

### 🩺 Health & System
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/health` | Public | Kiểm tra trạng thái hoạt động backend |

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Đăng ký tài khoản mới (mặc định role USER) |
| `POST` | `/api/auth/login` | Public | Đăng nhập nhận Access & Refresh Token |
| `POST` | `/api/auth/refresh` | Public | Cấp mới Access Token bằng Refresh Token |
| `GET` | `/api/auth/me` | Authenticated | Lấy thông tin tài khoản hiện tại |

### 📂 Categories (`/api/categories`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/categories` | Public | Lấy danh sách danh mục (có lọc `is_active`) |
| `GET` | `/api/categories/{id}` | Public | Lấy chi tiết danh mục theo ID |
| `POST` | `/api/categories` | ADMIN | Tạo mới danh mục |
| `PUT` | `/api/categories/{id}` | ADMIN | Cập nhật danh mục |
| `DELETE` | `/api/categories/{id}` | ADMIN | Xóa danh mục |

### 🍏 Products (`/api/products`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/products` | Public | Tìm kiếm, lọc danh mục/giá, sắp xếp, phân trang |
| `GET` | `/api/products/{id}` | Public | Lấy chi tiết sản phẩm theo ID hoặc slug |
| `POST` | `/api/products` | ADMIN | Tạo mới sản phẩm |
| `PUT` | `/api/products/{id}` | ADMIN | Cập nhật sản phẩm |
| `DELETE` | `/api/products/{id}` | ADMIN | Xóa mềm / vô hiệu hóa sản phẩm |

### 🛒 Cart (`/api/cart`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | Xem giỏ hàng hiện tại của người dùng |
| `POST` | `/api/cart/items` | Authenticated | Thêm sản phẩm vào giỏ (tự động cộng dồn số lượng) |
| `PUT` | `/api/cart/items/{id}` | Authenticated | Cập nhật số lượng một mặt hàng trong giỏ |
| `DELETE` | `/api/cart/items/{id}` | Authenticated | Xóa một mặt hàng khỏi giỏ |
| `DELETE` | `/api/cart` | Authenticated | Làm trống toàn bộ giỏ hàng |

### 📦 Orders (`/api/orders`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/orders` | Authenticated | Tạo đơn hàng (từ giỏ hoặc trực tiếp, trừ tồn kho DB) |
| `GET` | `/api/orders` | Authenticated | Xem danh sách đơn hàng của người dùng hiện tại |
| `GET` | `/api/orders/{id}` | Authenticated | Xem chi tiết đơn hàng của người dùng hiện tại |
| `PUT` | `/api/orders/{id}/cancel` | Authenticated | Hủy đơn hàng (hoàn lại tồn kho và lượt coupon) |
| `GET` | `/api/orders/admin/all` | ADMIN | Xem toàn bộ đơn hàng hệ thống (phân trang, lọc status) |
| `PUT` | `/api/orders/admin/{id}/status` | ADMIN | Cập nhật trạng thái đơn (pending → confirmed → shipping → delivered / cancelled) |

### 🎟️ Coupons (`/api/coupons`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | Authenticated | Kiểm tra mã giảm giá với số tiền đơn hàng |
| `GET` | `/api/coupons` | Authenticated | Danh sách mã giảm giá khả dụng |
| `POST` | `/api/coupons` | ADMIN | Tạo mã giảm giá mới |
| `GET` | `/api/coupons/{id}` | ADMIN | Lấy chi tiết mã giảm giá |
| `PUT` | `/api/coupons/{id}` | ADMIN | Cập nhật thông tin mã giảm giá |
| `DELETE` | `/api/coupons/{id}` | ADMIN | Vô hiệu hóa hoặc xóa mã giảm giá |

### 👥 Admin User Management (`/api/admin/users`)
| Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|
| `GET` | `/api/admin/users` | ADMIN | Danh sách tài khoản (phân trang, lọc role, tìm kiếm) |
| `GET` | `/api/admin/users/{id}` | ADMIN | Xem chi tiết tài khoản (đã lọc bỏ mật khẩu hash) |
| `PUT` | `/api/admin/users/{id}/role` | ADMIN | Cập nhật vai trò (USER ↔ ADMIN, bảo vệ self & last admin) |
| `PUT` | `/api/admin/users/{id}/status` | ADMIN | Khóa hoặc mở khóa tài khoản |

---

## ⚙️ 5. Cấu hình môi trường (Environment Variables)

Dự án cung cấp mẫu cấu hình chuẩn:
- Root: `.env.example`
- Backend: `backend/.env.example`
- Frontend: `frontend/.env.example`

### Thiết lập tệp `.env` tại thư mục gốc:
```bash
cp .env.example .env
```

Nội dung cấu hình mẫu:
```env
# PostgreSQL
POSTGRES_DB=fruitweb
POSTGRES_USER=fruitweb
POSTGRES_PASSWORD=fruitweb

# Backend
APP_NAME=FruitWeb API
ENVIRONMENT=production
DEBUG=false
JWT_SECRET_KEY=fruitweb-production-secure-jwt-secret-key-32chars-min-2026
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost,http://127.0.0.1

# Frontend (bỏ trống để gọi relative URL qua Nginx)
VITE_API_URL=
```

---

## 🚀 6. Hướng dẫn chạy dự án

### Cách 1: Chạy bằng Docker Compose (Khuyến nghị cho Production / Demo)

1. **Khởi động toàn bộ dịch vụ:**
   ```bash
   docker compose up -d --build
   ```

2. **Kiểm tra trạng thái các container:**
   ```bash
   docker compose ps
   ```

3. **Truy cập ứng dụng:**
   - Frontend UI: `http://localhost`
   - Backend API: `http://localhost/api`
   - Healthcheck: `http://localhost/api/health`

4. **Dừng hệ thống an toàn (KHÔNG làm mất dữ liệu volume):**
   ```bash
   docker compose down
   ```
   > ⚠️ **LƯU Ý:** Tuyệt đối không thêm cờ `-v` để tránh xóa volume dữ liệu `fruitweb_pgdata`.

---

### Cách 2: Chạy Local Development

#### 1. Khởi động PostgreSQL
Đảm bảo PostgreSQL đang chạy trên cổng 5432 với database `fruitweb`. Hoặc chỉ chạy container Postgres:
```bash
docker compose up -d postgres
```

#### 2. Khởi động Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Trên Windows
# source venv/bin/activate     # Trên Linux/macOS

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### 3. Khởi động Frontend
```bash
cd frontend
npm install
npm run dev
```
Truy cập Frontend dev server tại: `http://localhost:5173`.

---

## 🗄️ 7. Quản lý Migration cơ sở dữ liệu (Alembic)

Alembic quản lý lịch sử schema database trong thư mục `backend/alembic`:

- **Kiểm tra revision hiện tại:**
  ```bash
  # Local:
  cd backend && alembic current
  # Hoặc qua Docker:
  docker compose exec backend alembic current
  ```

- **Kiểm tra head revision:**
  ```bash
  # Local:
  cd backend && alembic heads
  # Hoặc qua Docker:
  docker compose exec backend alembic heads
  ```

- **Áp dụng migration mới nhất:**
  ```bash
  # Local:
  cd backend && alembic upgrade head
  # Hoặc qua Docker:
  docker compose exec backend alembic upgrade head
  ```

- **Revision hiện tại của dự án**: `c83910ef1234` (Bổ sung bảng `cart_items`, `coupons` và các trường `orders`).

---

## 🧪 8. Kiểm thử và Kiểm tra chất lượng (Testing & Build)

### Kiểm tra Build Frontend
```bash
cd frontend
npm run build
```
Đảm bảo TypeScript biên dịch không lỗi (`tsc -b`) và Vite tạo bundle thành công.

### Chạy Backend Test Suite
Suite kiểm thử tự động sử dụng SQLite in-memory độc lập, hoàn toàn không ảnh hưởng đến PostgreSQL:
```bash
# Local:
cd backend
pytest -v

# Hoặc bên trong container Docker backend:
docker compose exec backend pytest -q
```
**Kết quả kiểm thử thực tế:**
- Tổng cộng: **72 passed**, 0 failed.
- Bao gồm các bộ test: Auth, Categories, Products, Cart, Orders, Coupons, Admin User Management, Config & Security.

---

## 🔒 9. Lưu ý bảo mật và bảo vệ dữ liệu

1. **Volume bảo toàn dữ liệu:**
   Dữ liệu PostgreSQL được lưu trữ trong Docker named volume `fruitweb_pgdata`. Không chạy `docker compose down -v` hoặc `docker volume rm fruitweb_pgdata`.
2. **Bảo vệ mật khẩu:**
   Mọi mật khẩu người dùng đều được băm bằng thuật toán `bcrypt` trước khi lưu vào database. API và giao diện quản trị tuyệt đối không hiển thị chuỗi hash mật khẩu.
3. **Tính toán server-side:**
   Giá sản phẩm, tổng tiền đơn hàng và giá trị giảm giá đều được truy vấn và tính toán trực tiếp trên server, không tin tưởng dữ liệu giá hoặc tổng tiền từ client.
4. **Phân quyền và bảo vệ tài khoản:**
   Tất cả tài khoản đăng ký công khai đều có vai trò `USER`. Chỉ quản trị viên `ADMIN` mới có thể thao tác quản lý người dùng, duyệt đơn và cấu hình mã giảm giá. Hệ thống áp dụng chính sách ngăn chặn Admin tự khóa hoặc hạ quyền chính mình, đồng thời ngăn chặn việc loại bỏ quản trị viên cuối cùng.