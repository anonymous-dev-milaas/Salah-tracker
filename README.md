# 🕌 Salah Tracker

A full-stack prayer tracking PWA — React + Django.

## Stack
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Django + Django REST Framework + SimpleJWT
- **Database**: SQLite (dev) → PostgreSQL (production)
- **Hosting**: Vercel (frontend) + Render (backend)

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # fill in your SECRET_KEY
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env         # set VITE_API_BASE_URL
npm run dev
```

## Environment Variables

### Backend (.env)
| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key (50+ random chars) |
| `DEBUG` | True for dev, False for production |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `DATABASE_URL` | SQLite for dev, PostgreSQL URL for production |
| `CORS_ALLOWED_ORIGINS` | Frontend URL(s) |

### Frontend (.env)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL |

## Deployment

### Backend → Render
1. Create Web Service on render.com
2. Connect your GitHub repo
3. Root directory: `backend`
4. Build command: `./build.sh`
5. Start command: `gunicorn config.wsgi:application`
6. Add all env variables from `.env.example`

### Frontend → Vercel
1. Import repo on vercel.com
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_BASE_URL` = your Render backend URL