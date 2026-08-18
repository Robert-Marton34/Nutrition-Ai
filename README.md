# NutritionAI

An AI-powered full-stack nutrition tracking application. Scan food with your camera to get instant nutritional breakdowns, generate custom recipes with AI, and track your daily intake against personalized goals — all backed by Google Gemini and OpenAI.

Built as a BSc thesis project at Eötvös Loránd University (ELTE), Budapest.

## Features

- **AI Food Scanner** – Upload a photo of a meal and get an AI-generated nutritional breakdown (calories, macros, etc.)
- **AI Recipe Generator** – Generate custom recipes based on dietary preferences and available ingredients
- **AI Nutrition Advice** – Personalized recommendations based on your logged intake
- **Manual Recipe Logging** – Add and track your own recipes
- **Daily Nutrition Dashboard** – Visualize calories and macros over time with interactive charts
- **BMR & Calorie Calculation** – Personalized daily calorie targets based on your profile
- **JWT Authentication** – Secure user registration and login

## Tech Stack

**Backend**
- Django & Django REST Framework
- SQLite (default, dev) — easily swappable for PostgreSQL
- Simple JWT for authentication
- Google Gemini API (recipe generation, nutrition advice, food scanning)
- OpenAI API (image generation)

**Frontend**
- React (Vite)
- Tailwind CSS
- Axios
- Recharts

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- A [Google AI (Gemini) API key](https://makersuite.google.com/app/apikey)
- An [OpenAI API key](https://platform.openai.com) with billing enabled

## Getting Started

### 1. Backend Setup

```bash
cd backend
python3 -m venv env

# Activate the virtual environment
source env/bin/activate        # macOS / Linux
env\Scripts\activate.bat       # Windows

pip install -r requirements.txt
```

Create a `.env` file inside the `backend` directory:

```env
DJANGO_SECRET_KEY=your-django-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=*

GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

<details>
<summary>How to get a Gemini API key</summary>

1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API Key**
4. Copy the key into your `.env` file as `GEMINI_API_KEY`

</details>

<details>
<summary>How to get an OpenAI API key</summary>

1. Visit [platform.openai.com](https://platform.openai.com) and sign up or log in
2. Navigate to **API Keys**
3. Click **Create new secret key**
4. Go to **Billing** and add at least $5 in credits (the key won't work without a positive balance)
5. Copy the key into your `.env` file as `OPENAI_API_KEY`

</details>

Run the database migrations:

```bash
python3 manage.py migrate
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL="http://127.0.0.1:8000"
```

This tells the Vite dev server where to find the Django backend.

### 3. Running the App

**Backend:**

```bash
cd backend
source env/bin/activate        # macOS / Linux
python3 manage.py runserver
```

**Frontend** (in a separate terminal):

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
NutritionAI/
├── backend/
│   ├── api/
│   │   ├── ai/            # Gemini / OpenAI service integrations
│   │   ├── migrations/
│   │   ├── tests/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   └── backend/
│       └── settings.py
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        │   ├── auth/
        │   └── recipe/
        └── utils/
```

## License

This project was built for academic purposes as part of a BSc thesis at ELTE. Feel free to explore the code, but please don't submit it as your own coursework.
