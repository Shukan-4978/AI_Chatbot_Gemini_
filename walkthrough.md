# MERN AI Chatbot Walkthrough & Features

I have added Docker configuration (`Dockerfile`s, `docker-compose.yml`), a passcode auth system, profile setup, and deployment guides.

---

## 🚀 Key Features

### 1. Docker Containerization
- **Backend Container**: Standard Node:20-alpine container running Express.
- **Frontend Container**: Multi-stage Nginx-alpine container that builds the React client and serves it statically on port `80`.
- **Orchestration**: Exposes the application using `docker-compose` on `http://localhost` (Frontend) and `http://localhost:1111` (Backend).

### 2. Passcode Auth Onboarding
- Unique 4-digit generated passwords returned upon user registration (requires Name, Gender, Date of Birth, Email, Contact No, and City).
- User scopes are maintained via the `X-User-Id` request header.

---

## 🐳 Running with Docker

Make sure you have Docker Desktop installed. Start the containers using:
```bash
docker-compose up --build
```
*Access the app at `http://localhost`.*

---

## 🐙 Step-by-Step GitHub Setup

To push your project to a new repository on GitHub:

1. **Initialize Git**:
   ```bash
   git init
   ```
2. **Add Files**:
   ```bash
   git add .
   ```
3. **Commit**:
   ```bash
   git commit -m "feat: MERN AI Chatbot with auth and Docker setup"
   ```
4. **Create a remote repository** on GitHub. Then link it:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   ```
5. **Rename branch & Push**:
   ```bash
   git branch -M main
   ```
   ```bash
   git push -u origin main
   ```

---

## 🌐 Deploying to Production (Render & Vercel)

Read the detailed guide in [deployment_guide.md](file:///C:/Users/lenovo/.gemini/antigravity/brain/09c814d5-3645-4e89-9604-2cda5118570b/deployment_guide.md) to set up separate hosting for the backend (on Render) and the frontend (on Vercel).
