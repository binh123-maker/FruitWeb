from app.core.database import check_db_connection, engine
from sqlalchemy import text


def test_database_connection():
    assert check_db_connection() is True


def test_database_query():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 'FruitWeb' AS project_name")).scalar()
        assert result == "FruitWeb"
