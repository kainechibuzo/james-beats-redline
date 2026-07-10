# james-beats-redline

A modern interactive music streaming app.

Short description
- A modern interactive music streaming app that lets users discover, create, and share music experiences in real time.

## Features
- Stream curated and user-uploaded tracks
- Interactive playlists and live reactions
- Supabase-backed auth and realtime features

## Getting started

Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

Clone the repository
- git clone https://github.com/kainechibuzo/james-beats-redline.git
- cd james-beats-redline

Install dependencies
- npm install

Run (development)
- npm run dev

Build
- npm run build

Run (production)
- npm run preview

## Configuration

This project uses environment variables for secrets and API keys. A template file has been added as `.env.example`.

- Copy `.env.example` to `.env` and fill in the values before running the app:
  - `SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_URL`
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_URL`

Note: `.env` should NOT be committed to source control. If you have an existing `.env` file with secrets, remove it or add it to `.gitignore`.

## Usage
- Open http://localhost:5173 (or the port shown by your dev server) to view the app locally.

## Development
- Run tests: `npm test` (if tests exist)
- Lint/format: `npm run lint` / `npm run format` (if configured)

## Contributing
- Fork the repository, create a feature branch, and open a pull request with a clear description of your changes.

## License
This project is licensed under the MIT License — see the LICENSE file for details.

## Contact
- Author: Kaine Chibuzo
- Email: kainechibuzo@gmail.com

---

**Notes:**
- I renamed `.env` to `.env.example` in this commit to avoid committing secrets. If you want me to remove the original `.env` file from the repository, confirm and I will delete it in a follow-up commit.
