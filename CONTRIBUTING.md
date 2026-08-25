# Contributing to KisanLink (AgriLink AI)

Thank you for your interest in contributing to **KisanLink (AgriLink AI)**! We welcome contributions from developers, agronomists, data scientists, and UI/UX designers aiming to revolutionize agricultural supply chains.

---

## 📋 Code of Conduct

Please maintain a professional, respectful, and collaborative environment. Be kind and constructive in all interactions.

---

## 🛠️ Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Agri-link-ai.git
   cd Agri-link-ai
   ```
3. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## 🧪 Local Development Guidelines

### Backend (FastAPI + Python)
- Ensure Python 3.10+ is installed.
- Install dependencies: `pip install -r backend/requirements.txt`
- Run unit tests before submitting PR:
  ```bash
  python backend/tests/test_engine.py
  ```

### Frontend (React + TypeScript + Vite)
- Ensure Node.js 18+ is installed.
- Install dependencies: `cd frontend && npm install`
- Check type safety & formatting: `npm run lint`

---

## 📬 Submitting a Pull Request

1. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat(matching): optimize 7-factor buyer scoring algorithm"
   ```
2. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request on GitHub against the `main` branch. Provide a concise explanation of what changes were made and how they were tested.
