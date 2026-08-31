import os

import requests


FLAG_API_URL = os.getenv(
    "FLAG_API_URL",
    "http://127.0.0.1:8000"
)

ENVIRONMENT_ID = int(
    os.getenv(
        "ENVIRONMENT_ID",
        "1"
    )
)


def evaluate_flag(
    flag_key,
    user_id=None,
):
    payload = {
        "flag_key": flag_key,
        "environment_id": ENVIRONMENT_ID,
        "user_id": user_id,
    }

    response = requests.post(
        f"{FLAG_API_URL}/evaluation/",
        json=payload,
        timeout=5,
    )

    response.raise_for_status()

    return response.json()


def flag_enabled(
    flag_key,
    user_id=None,
):
    result = evaluate_flag(
        flag_key=flag_key,
        user_id=user_id,
    )

    return result.get(
        "enabled",
        False
    )