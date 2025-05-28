# 🧠 ZCoder Backend

ZCoder is a collaborative coding platform that enables users to practice coding problems, join real-time rooms, chat, and execute code live using Judge0 API. This repository contains the **backend** of the ZCoder platform.

🔗 **Backend Live Link:** [https://zcoder-backend-9aq1.onrender.com](https://zcoder-backend-9aq1.onrender.com)

---

## 🚀 Features

- User Authentication (JWT-based)
- Problem management with filtering and test cases
- Code Execution using Judge0 API
- Bookmarking and code snippets
- Commenting on problems and solutions
- Realtime collaborative rooms with:
  - Live code syncing
  - Room-based chat
  - Participants tracking
- User Profiles with history, bookmarks, and more

---

## 💻 Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- Judge0 API
- JWT Authentication
- Bcrypt, CORS, Dotenv

---

## 📦 Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Raunak1303/zcoder-backend.git
cd zcoder-backend

2. **Install dependencies**
npm install

3. create .env file
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JUDGE0_API_URL=https://judge0.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key

4. run the server
npm start

Backend: https://zcoder-backend-9aq1.onrender.com

## 🤝 Contribute
Feel free to fork the repository and submit pull requests to improve the project.



