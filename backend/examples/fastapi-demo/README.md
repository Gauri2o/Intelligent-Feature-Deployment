# FastAPI Feature Flag Integration Demo

This is a minimal FastAPI application showing how an external
application can consume the Intelligent Feature Deployment flag API.

## Configuration

The demo uses these environment variables:

- `FLAG_API_URL` - URL of the feature flag API
- `ENVIRONMENT_ID` - environment used for evaluation

Defaults:

```text
FLAG_API_URL=http://127.0.0.1:8000
ENVIRONMENT_ID=1