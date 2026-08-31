from django.shortcuts import render

# Create your views here.
import os

import requests
from django.http import JsonResponse


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


def evaluate_flag(flag_key, user_id=None):
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
        return {
            "error": response.text,
            "status_code": response.status_code,
        }

    return response.json()


def demo(request, flag_key):

    user_id = request.GET.get("user_id")

    result = evaluate_flag(
        flag_key=flag_key,
        user_id=user_id,
    )

    return JsonResponse({
        "flag_key": flag_key,
        "enabled": result.get("enabled"),
        "reason": result.get("reason"),
        "environment_id": ENVIRONMENT_ID,
    })
def middleware_demo(request, flag_key):

    user_id = request.GET.get("user_id")

    enabled = request.flag_enabled(
        flag_key,
        user_id=user_id,
    )

    return JsonResponse({
        "flag_key": flag_key,
        "enabled": enabled,
        "environment_id": ENVIRONMENT_ID,
        "middleware": "FeatureFlagMiddleware",
    })