# FinMate AI — Fixed React + Vite project

A responsive personal-finance dashboard with four rule-based agents:
1. Budget Agent
2. Cash Flow Agent
3. Savings Agent
4. Financial Advisor / Coordinator
5. Integrated rule-based chatbot connected to the dashboard’s current income, budget, and expense entries

The coordinator runs the first three agents and combines their results into recommendations. The integrated chatbot answers common finance questions using predefined JavaScript rules and the current dashboard data. This demo does not call an external AI API and does not require a database.

## Requirements
- Node.js (LTS recommended)
- npm

## Run locally
1. Extract this ZIP.
2. Open the extracted `finmate-ai-fixed` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

   ```bash
   npm install
   npm run dev
   ```

5. Open **http://localhost:3000/**.

The development server is configured to use port 3000 strictly. If it says the port is already in use, stop the other server using port 3000, or change `3000` in both `package.json` and `vite.config.js` to another unused port.

## If the page is blank
- Make sure you opened the URL printed by `npm run dev`.
- Check that `index.html` loads `/src/main.jsx`.
- Open Chrome DevTools → Console and inspect any red errors.
- In the VS Code terminal, check that `npm install` completed successfully.

## Project structure
```text
finmate-ai-fixed/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── agents.js
    └── styles.css
```
