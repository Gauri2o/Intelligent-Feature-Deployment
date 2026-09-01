\# Intelligent Feature Deployment - Backend



Backend service for the Intelligent Feature Deployment platform.



The backend provides APIs for:



\- Feature flag management

\- Environment management

\- Flag evaluation

\- Targeting rules

\- Percentage rollouts

\- Environment overrides

\- Audit logs

\- Analytics

\- Cleanup suggestions

\- Redis-based caching

\- Evaluation middleware



\---



\## Tech Stack



\- Python 3.11+

\- FastAPI

\- SQLAlchemy

\- SQLite/PostgreSQL

\- Redis

\- Pytest

\- Uvicorn



\---



\## Project Structure



```text

backend/

│

├── app/

│   ├── api/

│   ├── core/

│   ├── models/

│   ├── schemas/

│   ├── services/

│   ├── middleware/

│   └── main.py

│

├── tests/

│   ├── test\_audit\_log.py

│   ├── test\_evaluator.py

│   ├── test\_flag\_cache.py

│   ├── test\_load\_evaluation.py

│   ├── test\_middleware.py

│   └── test\_redis.py

│

├── alembic/

├── requirements.txt

└── README.md

1\. Create Virtual Environment



From the backend directory:



python -m venv .venv



Activate it on Windows:



.venv\\Scripts\\Activate.ps1



If the virtual environment already exists:



.venv\\Scripts\\Activate.ps1

2\. Install Dependencies

pip install -r requirements.txt

3\. Environment Variables



Create a .env file if the project requires environment configuration.



Typical configuration may include:



DATABASE\_URL=sqlite:///./app.db

REDIS\_URL=redis://localhost:6379/0



Use the environment variable names already configured by the application.



Do not commit secrets or production credentials to Git.



4\. Database Migrations



Apply the latest migrations with:



alembic upgrade head



To create a new migration after changing SQLAlchemy models:



alembic revision --autogenerate -m "describe change"



Then apply it:



alembic upgrade head



To check migration history:



alembic history

5\. Start the Backend



Run:



uvicorn app.main:app --reload



The API will normally be available at:



http://127.0.0.1:8000



FastAPI documentation:



http://127.0.0.1:8000/docs

6\. Run Tests



Run the complete backend test suite:



python -m pytest -v



The Day 20 test suite covers:



Audit log accuracy

Audit logs without before/after values

User targeting

Group targeting

Percentage rollout

Deterministic percentage evaluation

Zero percent rollout

Hundred percent rollout

Environment overrides

Missing environments

Missing flags

Evaluation cache invalidation

Repeated evaluation performance

Middleware flag fetching

Middleware local caching

Middleware enabled state

Redis cache set/get

Redis cache deletion

Evaluation cache deletion

7\. Feature Flag Evaluation



The evaluation system determines the value of a feature flag for a given environment and user context.



Evaluation supports:



Disabled flags

Environment-specific overrides

User targeting

Group targeting

Percentage rollouts

Default values



The evaluator returns a deterministic result for percentage rollouts so that the same user consistently receives the same rollout decision.



8\. Evaluation Middleware



The middleware can be used by an application that needs to evaluate feature flags during request processing.



The middleware:



Receives a feature flag request.

Checks the local/cache layer.

Fetches the flag when necessary.

Evaluates the flag using the current environment and user context.

Returns the evaluated value.

Uses caching to improve repeated evaluation performance.



Example concept:



result = evaluate\_flag(

&#x20;   flag\_key="dark\_mode",

&#x20;   environment="production",

&#x20;   user\_context={

&#x20;       "user\_id": "user-123"

&#x20;   }

)



Use the actual evaluator/middleware interfaces provided by the project when integrating it into another application.



9\. Redis Cache



Redis is used to improve repeated flag evaluation performance.



Cache operations include:



Set cache

Get cache

Delete cache

Delete flag evaluation cache



When a feature flag changes, related evaluation cache entries are invalidated so stale values are not returned.



10\. Audit Logs



Important flag changes are recorded in the audit log.



Audit information can include:



Flag

Action

Actor

Before value

After value

Timestamp



This provides traceability for configuration changes.



11\. API Documentation



When the backend is running, open:



http://127.0.0.1:8000/docs



The Swagger UI can be used to inspect and test available API endpoints.



12\. Development Workflow



Recommended workflow:



1\. Start Redis

2\. Activate .venv

3\. Apply migrations

4\. Start FastAPI

5\. Run tests

6\. Start frontend

7\. Test the complete application

13\. Final Test Status



Day 20 backend testing completed successfully.



Current test suite:



29 passed



All backend tests passed successfully before final documentation/polish.



License



Internal project / internship project.





