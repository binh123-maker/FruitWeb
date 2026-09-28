from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.routers import health
from app.schemas.common import error_response

app = FastAPI(
    title=settings.APP_NAME,
    description="REST API cho hệ thống bán trái cây trực tuyến FruitWeb",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers to keep unified response format
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    formatted_errors = {}
    for err in exc.errors():
        field = ".".join([str(loc) for loc in err["loc"] if loc != "body"])
        formatted_errors[field] = err["msg"]

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response(
            message="Thông tin không hợp lệ",
            errors=formatted_errors,
        ),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    # Check if exc.detail is already a dict or str
    msg = exc.detail if isinstance(exc.detail, str) else "Đã xảy ra lỗi"
    errs = exc.detail if isinstance(exc.detail, dict) else {}
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=msg, errors=errs),
    )


# Root endpoint
@app.get("/", tags=["Root"])
def root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


# Include Routers
app.include_router(health.router, prefix="/api")
