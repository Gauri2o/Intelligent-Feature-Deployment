import os

import requests
from fastapi import FastAPI, HTTPException


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


app = FastAPI(
    title="Feature Flag FastAPI Demo",
    version="1.0.0",
)


def evaluate_flag(
    flag_key: str,
    user_id: str | None = None,
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

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text,
        )

    return response.json()


@app.get("/")
def root():
    return {
        "message": "FastAPI feature flag demo is running",
        "flag_api_url": FLAG_API_URL,
        "environment_id": ENVIRONMENT_ID,
    }


@app.get("/demo/{flag_key}")
def demo(
    flag_key: str,
    user_id: str | None = None,
):
    result = evaluate_flag(
        flag_key=flag_key,
        user_id=user_id,
    )

    return {
        "flag_key": flag_key,
        "enabled": result.get("enabled"),
        "reason": result.get("reason"),
        "environment_id": ENVIRONMENT_ID,
    }