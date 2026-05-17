# Stride 

**Stride** is a modern, full-stack MERN project management platform designed for teams. It features interactive Kanban boards, role-based access control, and actionable analytics to keep workflows organized and efficient.

## Features

- **Interactive Kanban Board:** Drag-and-drop task management with real-time status transitions and optimistic UI updates.
- **Role-Based Access Control:** Granular permissions (Owner, Admin, Member) managed at the project level.
- **Team Management:** Secure email-based member invitations and role promotion/demotion.
- **Project Analytics:** Track team performance with completion rates, status breakdowns, and a 14-day activity trend chart.
- **Multi-View Workflow:** Seamlessly switch between List View, Board View, and Analytics.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)

## Getting Started

To run this project locally, you will need two terminals.

**1. Clone the repository**
\`\`\`bash
git clone https://github.com/0001-m/Stride.git
cd Stride
\`\`\`

**2. Setup Backend**
\`\`\`bash
cd server
npm install
# Rename .env.example to .env and add your MongoDB URI and JWT Secret
npm run dev
\`\`\`

**3. Setup Frontend**
\`\`\`bash
cd client
npm install
# Rename .env.example to .env and set VITE_API_URL=http://localhost:5000/api
npm run dev
\`\`\`

Open your browser and navigate to `https://stride-bfg1.onrender.com`.
