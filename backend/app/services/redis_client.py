import json
import redis
from datetime import datetime, timezone

# =====================================================
# Redis Connection
# =====================================================

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True,
)


# =====================================================
# Test Redis Connection
# =====================================================

def test_redis():
    try:
        return redis_client.ping()

    except Exception as e:
        print("Redis PING error:", e)
        return False


# =====================================================
# Set Cache
# =====================================================

def set_cache(
    key: str,
    value,
    expire: int = 300,
):
    """
    Store value in Redis.
    Default cache lifetime = 5 minutes.
    """

    try:

        redis_client.setex(
            key,
            expire,
            json.dumps(value),
        )

        print(
            f"REDIS CACHE SET: {key}"
        )

        return True

    except Exception as e:

        print(
            "Redis SET error:",
            e
        )

        return False


# =====================================================
# Get Cache
# =====================================================

def get_cache(key: str):

    try:

        value = redis_client.get(key)

        if value is None:

            return None

        return json.loads(value)

    except Exception as e:

        print(
            "Redis GET error:",
            e
        )

        return None


# =====================================================
# Delete Single Cache
# =====================================================

def delete_cache(key: str):

    try:

        redis_client.delete(key)

        print(
            f"REDIS CACHE DELETED: {key}"
        )

        return True

    except Exception as e:

        print(
            "Redis DELETE error:",
            e
        )

        return False


# =====================================================
# Delete All Evaluation Cache For A Flag
# =====================================================

def delete_flag_evaluation_cache(
    flag_key: str,
):
    """
    Delete all cached evaluations
    belonging to a specific flag.

    Example cache key:

    evaluation:dark_mode:1:user123
    evaluation:dark_mode:1:user999
    evaluation:dark_mode:2:user123
    """

    try:

        pattern = (
            f"evaluation:{flag_key}:*"
        )

        keys = redis_client.keys(pattern)

        if not keys:

            print(
                f"REDIS CACHE CLEAR: "
                f"No cache found for {flag_key}"
            )

            return True

        redis_client.delete(*keys)

        print(
            f"REDIS CACHE CLEAR: "
            f"Deleted {len(keys)} cache(s) "
            f"for {flag_key}"
        )

        return True

    except Exception as e:

        print(
            "Redis evaluation cache "
            "delete error:",
            e
        )

        return False
    


# =====================================================
# EVALUATION ANALYTICS COUNTER
# =====================================================

def increment_evaluation_counter(
    flag_key: str
):
    """
    Increment evaluation count for the current UTC hour.

    Redis key example:

    evaluation_count:day15_test:2026083014
    """

    try:

        current_hour = datetime.now(
            timezone.utc
        ).strftime("%Y%m%d%H")

        key = (
            f"evaluation_count:"
            f"{flag_key}:"
            f"{current_hour}"
        )

        count = redis_client.incr(key)

        # Keep metric key available until the
        # daily flush has a chance to process it.
        redis_client.expire(
            key,
            8 * 24 * 60 * 60
        )

        print(
            f"REDIS EVALUATION COUNT: "
            f"{key} = {count}"
        )

        return count

    except Exception as e:

        print(
            "Redis evaluation counter error:",
            e
        )

        return None