import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.models.user import User, UserRole

# SQLite in-memory database for isolated, fast test execution
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def override_database_dependency():
    def _get_test_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _get_test_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def admin_headers(db_session):
    admin_user = User(
        full_name="Admin Test",
        email="admin_test@fruitweb.com",
        password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E.5R0zZ5y5j1y.0Y2p3p4q5r6s7t8u",
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)

    token = create_access_token(subject=str(admin_user.id), role=admin_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def user_headers(db_session):
    regular_user = User(
        full_name="User Test",
        email="user_test@fruitweb.com",
        password_hash="$2b$12$eImiTXuWVxfM37uY4JANjO5E.5R0zZ5y5j1y.0Y2p3p4q5r6s7t8u",
        role=UserRole.USER.value,
        is_active=True,
    )
    db_session.add(regular_user)
    db_session.commit()
    db_session.refresh(regular_user)

    token = create_access_token(subject=str(regular_user.id), role=regular_user.role)
    return {"Authorization": f"Bearer {token}"}
