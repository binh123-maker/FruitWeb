# FruitWeb Backend API

Backend REST API xây dựng bằng FastAPI và PostgreSQL cho hệ thống bán trái cây trực tuyến FruitWeb.

## Công nghệ sử dụng
- Python 3.12+
- FastAPI & Uvicorn
- PostgreSQL & SQLAlchemy 2.x
- Alembic (Database Migrations)
- Pydantic v2
- PyJWT & Bcrypt

## Cấu trúc thư mục
```text
backend/
├── app/
│   ├── main.py              # Entrypoint ứng dụng FastAPI
│   ├── core/                # Cấu hình hệ thống, bảo mật & database
│   ├── models/              # SQLAlchemy Models
│   ├── schemas/             # Pydantic Schemas
│   ├── routers/             # API Routers
│   ├── services/            # Business Logic
│   └── dependencies/        # Dependencies (Auth, DB session)
├── tests/                   # Automated tests (Pytest)
├── .env                     # Biến môi trường local
├── .env.example             # Mẫu cấu hình môi trường
└── requirements.txt         # Danh sách thư viện phụ thuộc
```

## Cài đặt & Chạy ứng dụng

### 1. Khởi tạo môi trường ảo & cài đặt
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Khởi chạy PostgreSQL bằng Docker
```powershell
docker run -d --name fruitweb-postgres -p 5432:5432 -e POSTGRES_DB=fruitweb -e POSTGRES_USER=fruitweb -e POSTGRES_PASSWORD=fruitweb -v fruitweb_pgdata:/var/lib/postgresql/data postgres:16-alpine
```

### 3. Cấu hình .env
Sao chép `.env.example` thành `.env` và điều chỉnh thông tin nếu cần:
```powershell
cp .env.example .env
```

### 3. Chạy Server Development
```powershell
python -m uvicorn app.main:app --reload --port 8000
```

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/api/health`

### 4. Chạy kiểm thử (Test)
```powershell
python -m pytest
```
