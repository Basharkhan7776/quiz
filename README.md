# Quiz OS

A real-time, interactive quiz platform with a dynamic "Control Room" for hosts and engaging UI for players. Built with React (Vite), Firebase, and Tailwind CSS.

## Features

### 🎮 Player Experience

- **Real-time Gameplay**: Questions appear instantly when the host pushes them.
- **Live Leaderboard**: See standings update in real-time (after the reveal!).
- **Playful Animations**: Smooth transitions and effects using Framer Motion.
- **Mobile Responsive**: Optimized for playing on phones.

### 🕹️ Admin Control Room

- **Live Monitoring**: Track how many players have answered.
- **Game Control**:
  - `Push Question`: Send the next question to all players.
  - `Start Timer`: Trigger the countdown for everyone.
  - `Reveal Answer`: Show the correct answer and update the user leaderboards.
- **Question Management**: Create and edit quizzes with custom time limits and images.

## Quick Start

1. **Clone the repo**.
2. **Setup Environment**: See [DEPLOY.md](./DEPLOY.md) for keys.
3. **Run**: `npm run dev`

## Deployment

For detailed instructions on setting up Firebase and deploying to Vercel, please read [DEPLOY.md](./DEPLOY.md).
