# 🧠 Student Tools Suite

**Student Tools Suite** is a lightweight, offline-first collection of powerful study tools built entirely with HTML, JavaScript, and TailwindCSS via CDN.  
It’s designed to help students (and anyone else) stay organized, productive, and focused — without needing an account or a wallet.

---

## 📚 Why I Built This

I created this project to:

- 👨‍💻 Improve my **vanilla JavaScript** skills by building practical, modular tools
- 🎨 Learn and apply **TailwindCSS** to create a clean, consistent UI system
- 🧩 Build something useful that actually enhances the way I (and others) study

This project serves as both a personal learning exercise and a toolkit for real productivity.

---

## 📦 Features

- 📝 To-Do List with Pomodoro Timer  
- 🃏 Flashcards  
- 🗂️ Project Planner (Kanban-style)  
- 📓 Markdown Note-taking  
- ❓ Quiz Maker (CSV import)  
- ⏱️ Time Tracker (Toggl-style)  
- 📚 Resource Organizer  
- 🧾 Infinite Whiteboard  

Each tool runs **fully in the browser**, stores data **locally**, and requires **no signup or server**.

---

## 💡 Tech Stack

- **TailwindCSS** (via CDN)
- **Vanilla JavaScript (ES6 Modules)**
- **Font Awesome 6** icons
- **Google Fonts:**
  - EB Garamond (titles)
  - Lexend Deca (body)

---

## 🗂️ Project Structure

```
student-tools-suite/
├── index.html            # Main homepage
├── js/                   # Global JS logic
│   ├── main.js
│   ├── theme.js
│   ├── utils.js
│   ├── alerts.js
│   └── components/
├── tools/                # All tools here
│   └── [tool-name]/
│       ├── index.html
│       └── [tool].js
├── public/
│   └── assets/
│       ├── icons/
│       └── images/
├── fonts/ (optional)     # For self-hosted fonts
└── README.md
```

---

## 🖼️ Design System

- **Primary Color:** `#004447`
- **Background:** `#fffaf0`
- **Accent Color:** `#FF5F5F`
- **Font Title:** [EB Garamond](https://fonts.google.com/specimen/EB+Garamond)  
- **Font Body:** [Lexend Deca](https://fonts.google.com/specimen/Lexend+Deca)  
- **Icons:** [Font Awesome 6](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css)

---

## 🚀 Getting Started

1. Clone or download the repo
2. Open `index.html` in your browser
3. Navigate to any tool
4. That’s it. No installs, no setup, no backend.

---

## 🛠️ Customizing

- Update global settings in `js/theme.js`
- Add utility functions to `js/utils.js`
- Add new tools inside the `tools/` folder (with `index.html` + `[tool].js`)
- Modify the homepage in `index.html`

---

## ✅ License

MIT — free to use, remix, and distribute.

---

## 💬 Credits

Will be made with lot's of caffine by Jan, the Bryce Byte, Blomme.