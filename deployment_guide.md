# MERN Stack AI Chatbot Deployment Guide

This guide outlines how to deploy your AI Chatbot application. Because we are using MongoDB Atlas and Gemini API, we can host the frontend and backend separately using free, modern hosting platforms.

---

## 🛠️ Step 1: Prepare Environment Variables
When deploying, never commit `.env` files to git (which we blocked in `.gitignore`). Instead, you must enter these variables in your hosting provider's settings panel.

### Backend Environment Variables (`backend`)
* `MONGODB_URI`: `your-mongodb-atlas-connection-string`
* `GEMINI_API_KEY`: `your-gemini-api-key`
* `PORT`: `1111` (or let the platform assign one automatically)

### Frontend Environment Variables (`frontend`)
* In production, the React app must send requests to your live backend domain instead of `http://localhost:1111`.
* We can use a Vite environment variable. In `frontend/src/App.jsx`, the API URL is dynamically retrieved:
  ```javascript
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1111/api/chats';
  ```
* Define `VITE_API_URL` on your Vercel project settings pointing to your deployed backend URL (e.g. `https://your-backend.onrender.com/api/chats`).

---

## 🚀 Step 2: Deploy the Backend on Render

We recommend using **Render** (render.com):

1. **Create an account** on Render and connect your GitHub repository.
2. Click **New +** and select **Web Service**.
3. Select your `AI_Chatbot_Gemini_` repository.
4. Set the build configurations:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Open the **Environment Variables** tab and add:
   * **Key**: `MONGODB_URI` / **Value**: `your-mongodb-atlas-connection-string`
   * **Key**: `GEMINI_API_KEY` / **Value**: `your-gemini-api-key`
6. Click **Deploy Web Service**.
7. Once deployed, copy your service's URL (e.g., `https://ai-chatbot-backend-xyz.onrender.com`).

---

## 🌐 Step 3: Deploy the Frontend on Vercel

We recommend using **Vercel** (vercel.com) for Vite React:

1. **Create an account** on Vercel and connect your GitHub repository.
2. Click **Add New** -> **Project**.
3. Import your `AI_Chatbot_Gemini_` repository.
4. Configure Project settings:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   * **Key**: `VITE_API_URL`
   * **Value**: `https://your-backend-url.onrender.com/api/chats` (Use the Render service URL you copied in Step 2, appending `/api/chats` to the end).
6. Click **Deploy**.
7. Once Vercel finishes deploying, copy your live frontend URL (e.g., `https://ai-chatbot-frontend.vercel.app`).

---

## 🔒 Step 4: Configure CORS on Backend
To allow your Vercel frontend to query the Render backend, add the `FRONTEND_URL` environment variable on Render:

1. Go to your backend Web Service page on Render.
2. Go to **Environment** settings.
3. Add a new variable:
   * **Key**: `FRONTEND_URL`
   * **Value**: `https://your-frontend.vercel.app` (The URL of your deployed Vercel frontend app).
4. Save Changes. Render will redeploy automatically with CORS access configured!
