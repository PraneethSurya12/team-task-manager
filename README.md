# Team Task Manager

## Project Overview

Team Task Manager is a collaborative task management system where teams can create, assign, and track tasks inside a workspace.

Admins can assign tasks to members while members can update task status, comment on tasks, and upload attachments.

---

## Features

- User Authentication using Supabase
- Workspace based collaboration
- Admin and Member roles
- Task assignment
- Task status management
- Task comments
- File attachments
- Dashboard statistics
- Task search
- Pagination

---

## Tech Stack

Frontend
- React
- Vite
- TailwindCSS

Backend
- Supabase
- PostgreSQL

Authentication
- Supabase Auth

Deployment
- Vercel

---

## Project Structure
Directory structure:
└── react-app/
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public/
    │   └── vite.svg
    ├── README.md
    ├── src/
    │   ├── App.css
    │   ├── App.jsx.jsx
    │   ├── assets/
    │   │   └── react.svg
    │   ├── components/
    │   │   ├── Auth.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── MemberList.jsx
    │   │   ├── Pagination.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── TaskForm.jsx
    │   │   └── TaskList.jsx
    │   ├── index.css
    │   ├── main.jsx
    │   └── supabaseClient.js
    ├── tailwind.config.js
    └── vite.config.js

---

## Setup Instructions

Clone the repository

git clone https://github.com/praneethakula/team-task-manager.git

Install dependencies

npm install

Run the project

npm run dev

---

## Usage

Admin can:

- Invite members
- Create tasks
- Assign tasks
- Edit or delete tasks

Members can:

- View assigned tasks
- Update task status
- Add comments
- Upload attachments

---

## Author

Praneeth Akula