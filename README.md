# FixUrDevice — Complete Device Repair CRM & Customer Platform

FixUrDevice is a comprehensive, production-grade device repair management platform and customer-facing portal. It connects customers seeking smartphone, laptop, tablet, and electronics repair with a modern CRM workflow for service engineers, parts vendors, diagnostics, quotes, and invoice generation.

---

## 🏗️ Architecture

```
fixurdevice/
├── frontend/               # Next.js 16 (App Router, Turbopack, Tailwind CSS v4, Lucide)
│   ├── app/                # Public website & CRM dashboard routes
│   │   ├── (public)/       # Home, Book Repair, Services, FAQs, About, Contact
│   │   └── crm/            # Admin CRM (Leads, Repairs, Quotations, Invoices, Inventory, Technicians)
│   └── public/             # Static brand assets & logos
│
├── backend/                # Django 5 + Django REST Framework + WhiteNoise
│   ├── apps/
│   │   ├── accounts/       # Authentication, RBAC, technicians & staff
│   │   ├── leads/          # Customer repair inquiries & lead pipeline
│   │   ├── repairs/        # Repair jobs, status tracking, diagnostics
│   │   ├── customers/      # Customer records & service histories
│   │   ├── parts/          # Parts inventory & vendor tracking
│   │   ├── quotations/     # Estimates, approvals & line-item calculations
│   │   ├── payments/       # Invoicing, receipts, payment tracking
│   │   └── notifications/  # Email alerts (Gmail SMTP) & SMS integrations
│   └── config/             # Django settings (base, development, production)
```

---

## ⚡ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Headless UI, Recharts, Lucide Icons.
- **Backend**: Python 3.11+, Django 5.x, Django REST Framework, Celery/Redis, WhiteNoise.
- **Database**: PostgreSQL (Production) / SQLite3 (Local development).
- **Email Delivery**: SMTP via Gmail with Google App Passwords.
- **Deployment**:
  - **Frontend**: [Vercel](https://vercel.com)
  - **Backend**: [Render](https://render.com)

---

## 🚀 Getting Started Locally

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser for CRM access
python manage.py createsuperuser

# Start Django development server (http://127.0.0.1:8000)
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js dev server (http://localhost:3000)
npm run dev
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DEBUG` | Enable/disable debug mode | `False` (in production) |
| `DJANGO_SETTINGS_MODULE` | Active settings file | `config.settings.production` |
| `DJANGO_SECRET_KEY` | Secret cryptographic key | `your-secure-random-key` |
| `ALLOWED_HOSTS` | Allowed domain names | `*,localhost,.onrender.com,.fixurdevice.in` |
| `EMAIL_HOST_USER` | Gmail address for outgoing notifications | `fixurdevice.in@gmail.com` |
| `EMAIL_HOST_PASSWORD` | 16-character Google App Password | `xxxx xxxx xxxx xxxx` |
| `BUSINESS_EMAIL` | Inbox to receive customer lead alerts | `fixurdevice.in@gmail.com` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `https://your-site.vercel.app,http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | Provided by Render PostgreSQL |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Backend Django REST API URL | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | Canonical website domain | `https://www.fixurdevice.in` |

---

## 🌐 Deploying to Production

### Deploy Backend to Render

1. Sign in to [Render](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository: `fixurdevice/fixurdevice`.
3. Set configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - **Start Command**: `gunicorn config.wsgi:application`
4. Add your Environment Variables in Render:
   - `DJANGO_SETTINGS_MODULE`: `config.settings.production`
   - `DJANGO_SECRET_KEY`: *(Generate a secure random key)*
   - `ALLOWED_HOSTS`: `*` (or your Render URL and custom domain)
   - `EMAIL_HOST_USER`: `fixurdevice.in@gmail.com`
   - `EMAIL_HOST_PASSWORD`: `your-16-char-app-password`
   - `BUSINESS_EMAIL`: `fixurdevice.in@gmail.com`
   - `CORS_ALLOWED_ORIGINS`: `https://*.vercel.app,https://www.fixurdevice.in`
   - `DATABASE_URL`: *(Connect a Render PostgreSQL database)*

### Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import the `fixurdevice/fixurdevice` repository.
3. Configure project settings:
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: Next.js
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g. `https://your-backend.onrender.com`)
   - `NEXT_PUBLIC_SITE_URL`: `https://www.fixurdevice.in`
5. Click **Deploy**.

---

## 📄 License
All rights reserved © FixUrDevice.
