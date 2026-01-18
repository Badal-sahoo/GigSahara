# GigSahara 🐪

GigSahara is a job matching platform designed to help smooth volatile incomes for gig workers. It features a robust job filtering engine, a saved jobs drawer, and a "database-less" architecture powered by JSON for rapid prototyping.

## 🚀 Features

* **Dynamic Job Filtering:** Filter by location, job type, salary range, and experience.
* **Saved Jobs Drawer:** "Add to Cart" style drawer to track interesting listings without leaving the page.
* **Instant Search:** Real-time search by title, company, or location.
* **Responsive Design:** Fully custom CSS grid and flexbox layout (no external UI libraries).
* **JSON Backend:** Custom file-based data engine removing the need for a heavy database server during development.

## 🛠 Tech Stack

* **Frontend:** React.js, Vite, CSS3
* **Backend:** Django (Python)
* **Data:** Custom JSON File Storage

---

## 📦 Installation & Setup

### 1. Backend Setup (Django)

Navigate to the project root and set up the Python environment.

```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Install Django and dependencies
pip install django django-cors-headers

# 4. Generate the dummy data
python generate_jobs.py

# 5. Run the server
python manage.py runserver

# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

GigSahara/
├── manage.py            # Django entry point
├── generate_jobs.py     # Script to generate dummy JSON data
├── db.sqlite3           # (Unused/Internal Django DB)
├── backend/             # Django settings
├── jobs/                # Main Django App
│   ├── views.py         # API Logic
│   ├── jobs.json        # Data Source
│   └── urls.py
└── frontend/            # React App
    ├── public/          # Static assets (images, logos)
    └── src/
        ├── App.jsx      # Main Logic
        ├── JobCard.jsx  # Card Component
        └── App.css      # Styles