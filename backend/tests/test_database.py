from unittest.mock import patch
from app.core.database import check_db_connection


def test_database_connection_mocked():
    with patch("app.core.database.engine.connect") as mock_connect:
        mock_connect.return_value.__enter__.return_value.execute.return_value = True
        assert check_db_connection() is True


def test_database_connection_failure_mocked():
    with patch("app.core.database.engine.connect", side_effect=Exception("DB Offline")):
        assert check_db_connection() is False
