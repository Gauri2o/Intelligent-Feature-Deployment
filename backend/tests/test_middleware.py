from unittest.mock import patch

from app.middleware.feature_flag_client import FeatureFlagClient


def test_middleware_fetches_flag():

    client = FeatureFlagClient(
        base_url="http://localhost:8000",
        refresh_interval=60,
    )

    fake_response = {
        "flag_key": "dark_mode",
        "enabled": True,
        "default_value": "true",
        "environment_id": 1,
        "reason": "Default evaluation",
    }

    with patch.object(
        client,
        "_fetch_flag",
        return_value=fake_response,
    ) as mock_fetch:

        result = client.get_value(
            flag_key="dark_mode",
            environment_id=1,
            user_id="user123",
        )

        assert result["flag_key"] == "dark_mode"
        assert result["enabled"] is True
        assert result["environment_id"] == 1

        mock_fetch.assert_called_once()


def test_middleware_uses_local_cache():

    client = FeatureFlagClient(
        base_url="http://localhost:8000",
        refresh_interval=60,
    )

    fake_response = {
        "flag_key": "dark_mode",
        "enabled": True,
        "default_value": "true",
        "environment_id": 1,
        "reason": "Default evaluation",
    }

    with patch.object(
        client,
        "_fetch_flag",
        return_value=fake_response,
    ) as mock_fetch:

        first_result = client.get_value(
            flag_key="dark_mode",
            environment_id=1,
            user_id="user123",
        )

        second_result = client.get_value(
            flag_key="dark_mode",
            environment_id=1,
            user_id="user123",
        )

        assert first_result == second_result

        assert mock_fetch.call_count == 1


def test_middleware_is_enabled():

    client = FeatureFlagClient(
        base_url="http://localhost:8000",
        refresh_interval=60,
    )

    fake_response = {
        "flag_key": "dark_mode",
        "enabled": True,
        "default_value": "true",
        "environment_id": 1,
        "reason": "Default evaluation",
    }

    with patch.object(
        client,
        "_fetch_flag",
        return_value=fake_response,
    ):

        result = client.is_enabled(
            flag_key="dark_mode",
            environment_id=1,
            user_id="user123",
        )

        assert result is True