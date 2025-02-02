# AI To-Do List Assistant

An AI-powered to-do list assistant using OpenAI's GPT-4o and PostgreSQL.

## 🚀 Setup

1. **Clone & Install:**
   ```
   git clone https://github.com/ashutoshvjti/todo-ai-agent.git
   cd todo-ai-agent
   npm install
   ```

2. **Configure Environment:**
   ```
   cp .env.example .env
   # Add your DATABASE_URL and OPENAI_API_KEY in .env
   ```

3. **Start Database:**
   ```
   docker-compose up -d
   npm run generate
   npm run migrate
   ```

4. **Run the App:**
   ```
   node index.js
   ```

## 📦 Features
- Add, view, search, and delete to-dos.
- AI-driven CLI with dynamic interactions.

## 📜 License
MIT License
