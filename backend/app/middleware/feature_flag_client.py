import threading
import time
from typing import Optional

import requests


class FeatureFlagClient:
    """
    Lightweight client for consuming the Feature Flag API.

    Features:
    - In-memory caching
    - Automatic background refresh
    - Evaluation through /evaluation/
    - Reduces API calls for consuming applications
    """

    def __init__(
        self,
        base_url: str,
        refresh_interval: int = 60,
    ):
        self.base_url = base_url.rstrip("/")
        self.refresh_interval = refresh_interval

        # Local in-memory cache
        self.cache = {}

        # Lock for thread-safe cache access
        self.lock = threading.Lock()

        # Stop signal for background refresh
        self._stop_event = threading.Event()

        # Start background refresh thread
        self._refresh_thread = threading.Thread(
            target=self._refresh_loop,
            daemon=True,
        )

        self._refresh_thread.start()

    # -------------------------------------------------
    # Create cache key
    # -------------------------------------------------

    def _cache_key(
        self,
        flag_key: str,
        environment_id: int,
        user_id: Optional[str],
    ) -> str:

        return (
            f"{flag_key}:"
            f"{environment_id}:"
            f"{user_id or 'anonymous'}"
        )

    # -------------------------------------------------
    # Evaluate flag through API
    # -------------------------------------------------

    def _fetch_flag(
        self,
        flag_key: str,
        environment_id: int,
        user_id: Optional[str] = None,
    ):

        url = f"{self.base_url}/evaluation/"

        payload = {
            "flag_key": flag_key,
            "environment_id": environment_id,
            "user_context": (
                {
                    "user_id": user_id
                }
                if user_id
                else None
            ),
        }

        response = requests.post(
            url,
            json=payload,
            timeout=5,
        )

        response.raise_for_status()

        return response.json()

    # -------------------------------------------------
    # Get flag evaluation
    # -------------------------------------------------

    def get_value(
        self,
        flag_key: str,
        environment_id: int,
        user_id: Optional[str] = None,
    ):

        cache_key = self._cache_key(
            flag_key=flag_key,
            environment_id=environment_id,
            user_id=user_id,
        )

        # ---------------------------------------------
        # Check local cache
        # ---------------------------------------------

        with self.lock:

            cached_value = self.cache.get(
                cache_key
            )

        if cached_value is not None:

            return cached_value

        # ---------------------------------------------
        # Cache miss -> call API
        # ---------------------------------------------

        result = self._fetch_flag(
            flag_key=flag_key,
            environment_id=environment_id,
            user_id=user_id,
        )

        # ---------------------------------------------
        # Store in local cache
        # ---------------------------------------------

        with self.lock:

            self.cache[cache_key] = result

        return result

    # -------------------------------------------------
    # Check whether flag is enabled
    # -------------------------------------------------

    def is_enabled(
        self,
        flag_key: str,
        environment_id: int,
        user_id: Optional[str] = None,
    ) -> bool:

        result = self.get_value(
            flag_key=flag_key,
            environment_id=environment_id,
            user_id=user_id,
        )

        return bool(
            result.get("enabled", False)
        )

    # -------------------------------------------------
    # Refresh cached values
    # -------------------------------------------------

    def refresh(
        self,
        flag_key: str,
        environment_id: int,
        user_id: Optional[str] = None,
    ):

        result = self._fetch_flag(
            flag_key=flag_key,
            environment_id=environment_id,
            user_id=user_id,
        )

        cache_key = self._cache_key(
            flag_key=flag_key,
            environment_id=environment_id,
            user_id=user_id,
        )

        with self.lock:

            self.cache[cache_key] = result

        return result

    # -------------------------------------------------
    # Background refresh loop
    # -------------------------------------------------

    def _refresh_loop(self):

        while not self._stop_event.wait(
            self.refresh_interval
        ):

            self._refresh_cache()

    # -------------------------------------------------
    # Refresh all locally cached flags
    # -------------------------------------------------

    def _refresh_cache(self):

        with self.lock:

            cached_keys = list(
                self.cache.keys()
            )

        for cache_key in cached_keys:

            try:

                parts = cache_key.split(":", 2)

                if len(parts) != 3:
                    continue

                flag_key = parts[0]
                environment_id = int(parts[1])
                user_id = parts[2]

                if user_id == "anonymous":
                    user_id = None

                self.refresh(
                    flag_key=flag_key,
                    environment_id=environment_id,
                    user_id=user_id,
                )

            except Exception as error:

                print(
                    "Middleware refresh error:",
                    error,
                )

    # -------------------------------------------------
    # Clear local cache
    # -------------------------------------------------

    def clear_cache(self):

        with self.lock:

            self.cache.clear()

    # -------------------------------------------------
    # Stop background thread
    # -------------------------------------------------

    def close(self):

        self._stop_event.set()

        if self._refresh_thread.is_alive():

            self._refresh_thread.join(
                timeout=2
            )