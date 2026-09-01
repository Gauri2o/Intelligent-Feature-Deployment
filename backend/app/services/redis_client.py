import json
import redis

from datetime import datetime, timezone


# =========================================================
# REDIS CONNECTION
# =========================================================

redis_client = redis.Redis(
    host="localhost",
    port=6379,
    db=0,
    decode_responses=True,
)


# =========================================================
# TEST REDIS CONNECTION
# =========================================================

def test_redis():
    try:
        return redis_client.ping()

    except Exception as e:
        print(
            "Redis PING error:",
            e,
        )

        return False


# =========================================================
# SET CACHE
# =========================================================

def set_cache(
    key: str,
    value,
    expire: int = 300,
):
    """
    Store a value in Redis.

    Default cache lifetime:
    5 minutes.
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
            e,
        )

        return False


# =========================================================
# GET CACHE
# =========================================================

def get_cache(
    key: str,
):
    """
    Retrieve a cached value from Redis.

    Returns:
        Parsed JSON value if found.
        None if key does not exist or Redis fails.
    """

    try:

        value = redis_client.get(
            key
        )

        if value is None:
            return None

        return json.loads(
            value
        )

    except Exception as e:

        print(
            "Redis GET error:",
            e,
        )

        return None


# =========================================================
# DELETE SINGLE CACHE
# =========================================================

def delete_cache(
    key: str,
):
    try:

        redis_client.delete(
            key
        )

        print(
            f"REDIS CACHE DELETED: {key}"
        )

        return True

    except Exception as e:

        print(
            "Redis DELETE error:",
            e,
        )

        return False


# =========================================================
# DELETE ALL EVALUATION CACHE FOR A FLAG
# =========================================================

def delete_flag_evaluation_cache(
    flag_key: str,
):
    """
    Delete all cached evaluations belonging
    to a specific feature flag.

    Example:

    evaluation:dark_mode:1:user123
    evaluation:dark_mode:1:user999
    evaluation:dark_mode:2:user123
    """

    try:

        pattern = (
            f"evaluation:{flag_key}:*"
        )

        keys = redis_client.keys(
            pattern
        )

        if not keys:

            print(
                f"REDIS CACHE CLEAR: "
                f"No cache found for {flag_key}"
            )

            return True

        redis_client.delete(
            *keys
        )

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
            e,
        )

        return False


# =========================================================
# EVALUATION COUNTER
# =========================================================

def increment_evaluation_counter(
    flag_key: str,
):
    """
    Increment the daily evaluation counter
    for a feature flag.

    Counter format:

        evaluation_count:{flag_key}:{YYYY-MM-DD}

    Example:

        evaluation_count:dark_mode:2026-08-31

    The counter is stored using Redis INCR.

    The first increment of a new day also
    receives a 24-hour expiry.
    """

    try:

        # -------------------------------------------------
        # UTC date
        # -------------------------------------------------

        today = datetime.now(
            timezone.utc
        ).strftime(
            "%Y-%m-%d"
        )


        # -------------------------------------------------
        # Redis counter key
        # -------------------------------------------------

        counter_key = (
            f"evaluation_count:"
            f"{flag_key}:"
            f"{today}"
        )


        # -------------------------------------------------
        # Atomic increment
        # -------------------------------------------------

        count = redis_client.incr(
            counter_key
        )


        # -------------------------------------------------
        # Set expiry only when counter is new
        #
        # 86400 seconds = 24 hours
        # -------------------------------------------------

        if count == 1:

            redis_client.expire(
                counter_key,
                86400,
            )


        print(
            f"REDIS EVALUATION COUNT: "
            f"{flag_key} = {count}"
        )

        return count

    except Exception as e:

        print(
            "Redis evaluation counter error:",
            e,
        )

        return None


# =========================================================
# GET EVALUATION COUNT
# =========================================================

def get_evaluation_count(
    flag_key: str,
    date: str | None = None,
):
    """
    Get the evaluation count for a flag.

    If date is omitted, today's UTC date is used.

    Example:

        get_evaluation_count("dark_mode")

    or:

        get_evaluation_count(
            "dark_mode",
            "2026-08-31"
        )
    """

    try:

        if date is None:

            date = datetime.now(
                timezone.utc
            ).strftime(
                "%Y-%m-%d"
            )


        counter_key = (
            f"evaluation_count:"
            f"{flag_key}:"
            f"{date}"
        )


        value = redis_client.get(
            counter_key
        )


        if value is None:
            return 0


        return int(
            value
        )

    except Exception as e:

        print(
            "Redis evaluation count "
            "read error:",
            e,
        )

        return 0


# =========================================================
# GET EVALUATION COUNTS FOR MULTIPLE DAYS
# =========================================================

def get_evaluation_counts(
    flag_key: str,
    days: int = 7,
):
    """
    Return daily evaluation counts.

    Result format:

    {
        "2026-08-31": 10,
        "2026-08-30": 7,
        ...
    }
    """

    try:

        from datetime import timedelta


        today = datetime.now(
            timezone.utc
        ).date()


        results = {}


        for offset in range(
            days
        ):

            current_date = (
                today
                - timedelta(days=offset)
            )


            date_string = (
                current_date.strftime(
                    "%Y-%m-%d"
                )
            )


            counter_key = (
                f"evaluation_count:"
                f"{flag_key}:"
                f"{date_string}"
            )


            value = redis_client.get(
                counter_key
            )


            results[
                date_string
            ] = (
                int(value)
                if value is not None
                else 0
            )


        return results

    except Exception as e:

        print(
            "Redis evaluation counts "
            "read error:",
            e,
        )

        return {}


# =========================================================
# GET ALL COUNTERS FOR A FLAG
# =========================================================

def get_flag_evaluation_counter_keys(
    flag_key: str,
):
    """
    Return all Redis evaluation counter
    keys for a specific flag.
    """

    try:

        pattern = (
            f"evaluation_count:"
            f"{flag_key}:*"
        )


        return redis_client.keys(
            pattern
        )

    except Exception as e:

        print(
            "Redis evaluation counter "
            "keys error:",
            e,
        )

        return []