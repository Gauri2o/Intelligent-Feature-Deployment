# Intelligent Feature Deployment - Frontend

Frontend dashboard for the Intelligent Feature Deployment platform.

The application provides a user interface for managing feature flags, environments, evaluations, audit logs, analytics, cleanup suggestions, profiles, and application settings.

---

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Recharts
- Vitest
- React Testing Library
- JavaScript

---

## Features

### Feature Flags

- View feature flags
- Search flags
- View flag details
- Create flags
- Edit flags
- Delete flags
- View enabled/disabled status
- View flag owners
- View flag types

### Environments

- View available environments
- Work with environment-specific flags
- Persist selected environment

### Evaluation

- Evaluate feature flags
- Test targeting behaviour
- Test environment-specific values

### Audit Logs

- View configuration changes
- Track flag activity
- Review historical changes

### Analytics

- View feature flag analytics
- Review rollout/evaluation information

### Cleanup

- View cleanup suggestions
- Identify potentially unnecessary flags

### User Settings

- Profile
- Settings

---

## Project Structure

```text
frontend/
│
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── EnvironmentContext.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── FlagPage.jsx
│   │   ├── CreateFlag.jsx
│   │   ├── EditFlag.jsx
│   │   ├── FlagDetail.jsx
│   │   ├── EvaluateFlag.jsx
│   │   ├── AuditLogs.jsx
│   │   ├── Analytics.jsx
│   │   ├── EnvironmentPage.jsx
│   │   ├── CleanupSuggestions.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── test/
│   │   ├── setup.js
│   │   └── FlagPage.test.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
1. Install Dependencies

From the frontend directory:

npm install
2. Start the Development Server
npm run dev

Vite will display the local development URL in the terminal.

Open that URL in the browser.

3. Build for Production

Create a production build:

npm run build

Preview the production build:

npm run preview
4. Lint

Run ESLint:

npm run lint
5. Run Frontend Tests

Run all Vitest tests:

npm run test:run

For verbose output:

npx vitest run --reporter=verbose

The frontend test suite covers:

Normal dashboard state
Feature flag rendering
Empty environment state
Search with no matching flags
API failure handling

Current Day 20 frontend test status:

4 passed
6. Dashboard Routes

The application currently includes routes for:

/

Home dashboard.

/login

Login.

/signup

Signup.

/flags

Feature flag management.

/create-flag

Create a feature flag.

/edit-flag/:key

Edit a feature flag.

/flag/:key

Feature flag details.

/evaluate

Feature flag evaluation.

/audit

Audit logs.

/analytics

Analytics.

/environments

Environment management.

/cleanup

Cleanup suggestions.

/profile

User profile.

/settings

Application settings.

7. API Connection

The frontend communicates with the backend through the Axios service configured in:

src/services/api.js

Make sure the backend is running before testing features that require API access.

Typical development setup:

Frontend
   |
   | HTTP requests
   v
FastAPI Backend
   |
   +---- Database
   |
   +---- Redis
8. Feature Flag Dashboard

The main feature flag page provides:

Selected environment
Total flag count
Enabled count
Disabled count
Environment count
Flag search
Flag table
Flag status
Flag owner
Flag type
Edit action
Delete action
Create flag action
9. Empty States

The dashboard handles environments without feature flags.

Example:

No flags found

No feature flags exist in the selected environment.

+ Create your first flag

Search also handles cases where no flag matches the query:

No flags found

Try a different search term.
10. API Failure Handling

If the backend becomes unavailable, the frontend displays an appropriate error state instead of silently failing.

The user can retry the request after the backend is available again.

11. Responsive Design

The dashboard has been checked at approximately:

Desktop : 1440px
Tablet  : 768px
Mobile  : 375px

Responsive checks include:

Sidebar/content layout
Table horizontal scrolling
Search field
Create Flag button
Dashboard cards
Text wrapping
Horizontal overflow
Demo Walkthrough
1. Login

Start from the login page.

Demonstrate:

Login form
Authentication
Navigation to the dashboard
2. Dashboard

Show the main dashboard.

Explain:

Total feature flags
Enabled flags
Disabled flags
Available environments
3. Feature Flags

Open:

Feature Flags

Demonstrate:

Flag list
Flag type
Environment
Status
Owner
Search
4. Create Flag

Click:

Create Flag

Create a sample feature flag.

Explain that feature flags allow functionality to be released independently from application deployments.

5. Edit Flag

Open an existing flag and modify its configuration.

Save the changes and return to the flag list.

6. Flag Details

Open a flag from the table.

Demonstrate the detailed configuration and available information.

7. Environments

Open:

Environments

Explain that flags can be managed independently across environments such as:

Development
Staging
Production
8. Evaluation

Open:

Evaluate

Demonstrate evaluation using:

Environment
User context
Targeting rules
Percentage rollout

Explain that the evaluator determines which value a user should receive.

9. Targeting

Explain the supported targeting behaviour:

User targeting
Group targeting
Percentage rollout
Environment override
Default value

Percentage rollout is deterministic, meaning the same user receives a consistent result for the same rollout configuration.

10. Audit Logs

Open:

Audit Logs

Show how configuration changes can be tracked.

Explain:

What changed
Previous value
New value
Action
Timestamp
11. Analytics

Open:

Analytics

Explain that analytics provide visibility into flag/evaluation activity.

12. Cleanup Suggestions

Open:

Cleanup

Explain that the system can surface feature flags that may need review or cleanup.

13. Profile and Settings

Briefly demonstrate:

Profile
Settings

These provide user/application configuration areas.

14. Caching

Explain the backend caching flow:

Request
   ↓
Flag Evaluation
   ↓
Cache lookup
   ↓
Cached result / database lookup
   ↓
Evaluation result

When a flag changes, the relevant evaluation cache is invalidated to prevent stale results.

15. Testing

Finish by showing the test results.

Backend:

29 passed

Frontend:

4 passed

Explain that the tests cover:

Targeting rules
Percentage rollout
Environment overrides
Cache invalidation
Audit logging
Middleware
Repeated evaluations
Empty UI states
Search edge cases
API failure handling
Final Demo Flow

Recommended presentation order:

Login
  ↓
Dashboard
  ↓
Feature Flags
  ↓
Create Flag
  ↓
Edit Flag
  ↓
Flag Details
  ↓
Environments
  ↓
Evaluate
  ↓
Targeting / Rollout
  ↓
Audit Logs
  ↓
Analytics
  ↓
Cleanup Suggestions
  ↓
Profile / Settings
  ↓
Testing
Final Status

The project contains a complete feature flag management workflow with:

Authentication
Feature flag management
Environment management
Flag evaluation
Targeting
Percentage rollout
Environment overrides
Redis caching
Cache invalidation
Audit logging
Analytics
Cleanup suggestions
Responsive dashboard
Frontend edge-case tests
Backend unit/integration tests



---

