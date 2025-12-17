# Leafy - AI Gardening Assistant 🌿

Leafy is a professional-grade, AI-powered gardening companion designed to help plant enthusiasts identify species, maintain healthy care schedules, and get expert botanical advice instantly.

## ✨ Key Features

- **📸 Instant AI Identification**: Snap a photo of any plant to identify its species, health status, and scientific details using Gemini 2.5 Flash.
- **📅 Smart Care Scheduler**: Automatically generated watering and fertilizing schedules tailored to each specific plant.
- **🎊 Celebratory Feedback**: Visual confetti animations to celebrate your successful plant care tasks.
- **💬 Leafy Chat**: A real-time AI botanist powered by Google Search grounding to answer complex gardening questions, pest troubleshooting, and seasonal advice.
- **📖 Botanical Journal**: Keep a beautiful history of every plant you've encountered and cared for.
- **⚡ Vercel Ready**: Optimized for seamless deployment on Vercel with a robust Vite-based build process.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **AI Engine**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key (get one at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd leafy-ai-gardening-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root (for local development):
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment on Vercel

This project is pre-configured for Vercel.

1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project into **Vercel**.
3. In the **Environment Variables** section of your Vercel project settings, add:
   - **Key**: `API_KEY`
   - **Value**: `your_actual_gemini_api_key`
4. Click **Deploy**.

## 📝 License

This project is for educational and personal use as an AI-powered gardening tool. Feel free to fork and enhance your green thumb!