<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/81716dcb-68b4-4b55-91a3-6234c58f2fbc

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the PHP API from the project root:
   `php -S 127.0.0.1:8000`
4. Run the app:
   `npm run dev`

## Event Portal Database

- Local PHP database credentials live in `db/config.local.php`.
- The frontend calls the PHP API using `VITE_EVENT_PORTAL_API_BASE_URL` from `.env.local`.
- If you want to protect the PHP API, set the same value in:
  `db/config.local.php` as `API_KEY`
  `.env.local` as `VITE_EVENT_PORTAL_API_KEY`
