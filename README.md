# 🧠 MindMaze AI

MindMaze AI is an advanced, AI-driven psychological text adventure. Powered by Google Gemini 2.5 Flash, it creates a unique, surreal narrative based on your choices, tracking your **Sanity**, **Hope**, and **Fear**.

## ✨ Features

- **AI-Generated Narrative**: No two playthroughs are the same. The maze adapts in real-time.
- **Dynamic Stat System**: Your choices impact your internal state, which in turn influences the AI's storytelling style.
- **Atmospheric UI**: A dark, neon-themed interface with typewriter effects and smooth animations.
- **Auto-Save**: Resume your psychological journey anytime using local storage.
- **GitHub Actions Support**: Built-in CI/CD for automatic deployment to GitHub Pages.

## 🚀 Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mindmaze-ai.git
   cd mindmaze-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your API Key**:
   Create a `.env` file in the root and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the app**:
   ```bash
   npm run dev
   ```

## 🌐 Hosting on GitHub

1. Create a new repository on GitHub.
2. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mindmaze-ai.git
   git branch -M main
   git push -u origin main
   ```
3. Go to **Settings > Pages** in your GitHub repo.
4. Under **Build and deployment**, set the **Source** to **GitHub Actions**.
5. The included workflow will automatically build and deploy your site!

## 🛠 Built With

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Google Gemini API** - AI Core
- **Vite** - Build Tool
