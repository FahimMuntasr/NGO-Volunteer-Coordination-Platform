# NGO Volunteer Coordination Platform

A full-stack web application designed to help NGOs manage volunteers, events, teams, attendance, donations, certificates, and organizational activities through one centralized platform.

The system supports multiple user roles with different permissions and workflows:

- Volunteer
- NGO Administrator
- Coordinator
- Donor

---

## Group Members

| Name | ID |
|---|---|
| Sian Ahbab Khan | 2412833042 |
| Fahim Muntasir | 2411371042 |
| Muhammad Masrur Ahmed | 2412319042 |
| Abrar Rahman | 2412379042 |

---

# Features

## Volunteer

Volunteers can:

- Create and update a volunteer profile
- Add skills and availability information
- Browse available events
- Register for events
- View registration status
- View volunteer history
- Track completed events and volunteer hours
- View notifications
- Download participation certificates
- Verify certificates using verification codes

---

## NGO Administrator

NGO administrators can:

- Register an NGO
- Complete NGO verification
- Create and manage events
- Open, start, cancel, and complete events
- Review volunteer registrations
- Approve or reject registrations
- Assign coordinators to events
- Create volunteer teams
- Assign volunteers to teams
- Assign team leaders
- View volunteer rankings
- View donations received by the NGO
- Download event attendance reports
- Manage NGO profile information
- View notifications

Only verified NGOs are allowed to create events.

---

## Coordinator

Coordinators can:

- View assigned events
- View registrations for assigned events
- Create and manage teams
- Assign approved volunteers to teams
- Assign tasks to team members
- Mark volunteer attendance
- Update coordinator profile information
- View notifications

---

## Donor

Donors can:

- Browse verified NGOs
- Make donations
- View donation history
- Maintain donor profile information
- View notifications

Donations can only be made to verified NGOs.

---

# Event Lifecycle

Events follow the following lifecycle:

```text
DRAFT
  |
  v
OPEN
  |
  v
IN_PROGRESS
  |
  v
COMPLETED
```

An event may also be cancelled while it is in an allowed state.

Completed and cancelled events cannot be modified.

---

# Certificate System

Participation certificates are created for eligible volunteers after successful event completion.

Certificates contain a unique verification code.

Users can:

- View earned certificates
- Download certificates as PDF files
- Verify certificates through a public verification page

Certificate PDFs are generated on demand rather than permanently depending on the deployment server's local filesystem.

NGO administrators can also generate PDF attendance reports for their events.

---

# NGO Verification

An NGO must be verified before it can create events or receive donations.

The platform maintains NGO verification information such as:

- NGO name
- Registration number
- Verification status
- Registry information
- Verification date

If important NGO identity information is changed after verification, the NGO may return to a pending verification state.

---

# Technology Stack

## Backend

- Python
- Django 6
- Django REST Framework
- DRF Token Authentication
- PostgreSQL
- Neon PostgreSQL
- ReportLab
- WhiteNoise
- Gunicorn

## Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS

## Deployment

- Railway — Django backend
- Neon — PostgreSQL database
- Vercel — React frontend

---

# Project Structure

```text
NGO-Volunteer-Coordination-Platform/
│
├── accounts/
│   ├── authentication
│   ├── user roles
│   └── donor/coordinator profiles
│
├── organizations/
│   ├── NGO profiles
│   └── NGO verification
│
├── events/
│   ├── events
│   ├── registrations
│   ├── teams
│   ├── attendance
│   └── event design patterns
│
├── volunteering/
│   ├── volunteer profiles
│   ├── skills
│   ├── history
│   └── rankings
│
├── donations/
│   └── donation management
│
├── certificates/
│   ├── participation certificates
│   ├── attendance reports
│   └── Factory Method implementation
│
├── notifications/
│   └── notification system
│
├── config/
│   └── Django project configuration
│
├── ngo-frontend/
│   └── React + TypeScript frontend
│
├── manage.py
├── requirements.txt
└── README.md
```

---

# Design Patterns

The project applies software design patterns to real system functionality.

## Strategy Pattern

Used for volunteer ranking.

Different ranking strategies can determine how volunteers are ordered without changing the client code that requests the ranking.

---

## Proxy Pattern

Used for event access control.

The Proxy controls which events different users are allowed to access before delegating event operations to the real event service.

Examples:

- NGO Administrator → events belonging to their NGO
- Coordinator → assigned events
- Volunteer → open or registered events
- Donor → open events

---

## Factory Method Pattern

Used for document generation.

A common document creator interface is used to create different document generators.

Concrete document products include:

- Participation Certificate Generator
- Attendance Report Generator

This allows different PDF documents to be created through the same Factory Method structure.

---

## Facade Pattern

Used for event completion.

The client only calls:

```python
facade = EventCompletionFacade()

result = facade.complete_event(
    event,
    request.user,
)
```

The facade coordinates multiple subsystems, including:

- Event validation
- Attendance validation
- Event-hour calculation
- Volunteer progress updates
- Certificate generation
- Registration completion
- Event status updates

This keeps the API view from directly managing the entire event-completion workflow.

---

## Observer Pattern

Used for notifications.

Different system events can trigger notifications without tightly coupling the main business logic to the notification implementation.

Examples include notifications for:

- Registration updates
- Event publication
- Team assignments
- Certificate issuance
- Donations

---

## Builder Pattern

The Builder implementation is being finalized separately and will be integrated before the final project submission.

---

# Backend Setup

## 1. Clone the repository

```bash
git clone https://github.com/FahimMuntasr/NGO-Volunteer-Coordination-Platform.git
```

Enter the project:

```bash
cd NGO-Volunteer-Coordination-Platform
```

---

## 2. Create a virtual environment

Windows:

```powershell
py -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## 3. Install dependencies

```powershell
pip install -r requirements.txt
```

---

## 4. Create the environment file

Copy:

```text
.env.example
```

to:

```text
.env
```

Configure the required values.

Example local configuration:

```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173
```

If `DATABASE_URL` is not provided, Django can use the local SQLite database configuration.

For PostgreSQL/Neon, provide the PostgreSQL connection URL.

Never commit the real `.env` file.

---

## 5. Apply migrations

```powershell
py manage.py migrate
```

---

## 6. Create a superuser

Optional, but useful for Django Admin:

```powershell
py manage.py createsuperuser
```

---

## 7. Start Django

```powershell
py manage.py runserver
```

Backend:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

Open another terminal.

Enter the frontend directory:

```powershell
cd ngo-frontend
```

Install dependencies:

```powershell
npm install
```

Create:

```text
ngo-frontend/.env
```

Example:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# Running Tests

## Backend

Run all Django tests:

```powershell
py manage.py test --keepdb
```

Run a specific app:

```powershell
py manage.py test events --keepdb
```

Example:

```powershell
py manage.py test certificates --keepdb
```

Check Django configuration:

```powershell
py manage.py check
```

Check for missing migrations:

```powershell
py manage.py makemigrations --check --dry-run
```

---

## Frontend

Enter:

```powershell
cd ngo-frontend
```

Run lint:

```powershell
npm run lint
```

Build the production frontend:

```powershell
npm run build
```

---

# Main API Groups

The Django backend exposes APIs under:

```text
/api/auth/
/api/events/
/api/volunteers/
/api/organizations/
/api/donations/
/api/certificates/
/api/notifications/
```

Authentication uses Django REST Framework Token Authentication.

Authenticated requests send:

```text
Authorization: Token <token>
```

---

# Main Workflow

A typical event workflow is:

```text
NGO registers
      |
      v
NGO verification
      |
      v
NGO creates event
      |
      v
Event opened for registration
      |
      v
Volunteers register
      |
      v
NGO approves volunteers
      |
      v
Coordinator assigned
      |
      v
Teams created
      |
      v
Attendance marked
      |
      v
Event completed
      |
      v
Volunteer hours updated
      |
      v
Certificates generated
```

---

# Security

The platform includes:

- Role-based authorization
- Token authentication
- Verified-NGO restrictions
- Event ownership validation
- Team access restrictions
- Certificate ownership validation
- Public certificate verification
- Registration and event validation
- Secure production HTTPS settings
- CORS configuration
- Environment-based secret configuration

Sensitive values such as:

```text
DJANGO_SECRET_KEY
DATABASE_URL
```

must never be committed to Git.

---

# Deployment

## Backend

The Django backend is designed for Railway using:

```text
gunicorn config.wsgi:application
```

Production configuration uses environment variables for:

- Django secret key
- Debug mode
- Allowed hosts
- PostgreSQL database
- CORS
- Frontend URL

---

## Database

Production PostgreSQL is hosted using Neon.

---

## Frontend

The React frontend can be deployed using Vercel.

The Vercel environment should contain:

```text
VITE_API_URL=<deployed Django backend URL>
```

The project includes SPA routing configuration so React routes continue to work when refreshed directly.

---

# Notes

- Real `.env` files must not be committed.
- Run the full backend test suite after merging feature branches.
- Run frontend lint and build checks before deployment.
- Design-pattern branches should be merged only after their implementations have been reviewed and tested.
