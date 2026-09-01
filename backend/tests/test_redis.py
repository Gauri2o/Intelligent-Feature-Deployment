from unittest.mock import patch

from app.services.redis_client import (
    set_cache,
    get_cache,
    delete_cache,
    delete_flag_evaluation_cache,
)


def test_set_and_get_cache():

    fake_redis = {}

    class FakeRedis:

        def setex(self, key, expire, value):
            fake_redis[key] = value

        def get(self, key):
            return fake_redis.get(key)

    with patch(
        "app.services.redis_client.redis_client",
        FakeRedis(),
    ):

        result = set_cache(
            key="test:key",
            value={
                "enabled": True
            },
            expire=300,
        )

        assert result is True

        result = get_cache(
            "test:key"
        )

        assert result == {
            "enabled": True
        }


def test_delete_cache():

    fake_redis = {
        "test:key": '{"enabled": true}'
    }

    class FakeRedis:

        def delete(self, key):
            fake_redis.pop(
                key,
                None
            )

    with patch(
        "app.services.redis_client.redis_client",
        FakeRedis(),
    ):

        result = delete_cache(
            "test:key"
        )

        assert result is True
        assert "test:key" not in fake_redis


def test_delete_flag_evaluation_cache():

    fake_keys = [
        "evaluation:dark_mode:1:user123",
        "evaluation:dark_mode:1:user456",
        "evaluation:dark_mode:2:user123",
    ]

    deleted_keys = []

    class FakeRedis:

        def keys(self, pattern):

            assert pattern == (
                "evaluation:dark_mode:*"
            )

            return fake_keys

        def delete(self, *keys):

            deleted_keys.extend(keys)

    with patch(
        "app.services.redis_client.redis_client",
        FakeRedis(),
    ):

        result = delete_flag_evaluation_cache(
            "dark_mode"
        )

        assert result is True

        assert len(deleted_keys) == 3

        assert (
            "evaluation:dark_mode:1:user123"
            in deleted_keys
        )

        assert (
            "evaluation:dark_mode:1:user456"
            in deleted_keys
        )

        assert (
            "evaluation:dark_mode:2:user123"
            in deleted_keys
        )


def test_delete_flag_evaluation_cache_when_empty():

    class FakeRedis:

        def keys(self, pattern):

            return []

    with patch(
        "app.services.redis_client.redis_client",
        FakeRedis(),
    ):

        result = delete_flag_evaluation_cache(
            "dark_mode"
        )

        assert result is True