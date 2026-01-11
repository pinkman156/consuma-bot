# 🤖 Consuma Bot - AI Code Reviewer

An intelligent, event-driven Code Review Agent that listens to GitHub Pull Requests, automatically reviews code for security & performance issues, and self-evaluates the quality of its own reviews.

## 🚀 Features
* **Event-Driven Architecture:** Automatically triggers reviews via GitHub Webhooks.
* **Dual-LLM Engine:**
    * **Review Agent:** Scans code for hardcoded secrets, OWASP vulnerabilities, and logic errors using OpenAI (GPT-4o).
    * **QA Auditor:** A secondary agent that scores every review (1-10) on Relevance, Accuracy, and Clarity.
* **Agent Control Dashboard:** A Next.js UI to configure agent personas (e.g., "Security Expert" vs. "Performance Optimizer") and visualize review metrics.
* **Customizable Prompts:** Dynamic system prompts to change the bot's behavior without redeploying.

## 🛠️ Tech Stack
* **Framework:** Next.js 14 (App Router)
* **AI:** OpenAI API (GPT-4o)
* **Language:** TypeScript
* **Webhook Tunnel:** Smee.io (for local development)

---

## ⚙️ Setup Instructions

### 1. Clone & Install
```bash
git clone [https://github.com/YOUR_USERNAME/consuma-bot.git](https://github.com/YOUR_USERNAME/consuma-bot.git)
cd consuma-bot
npm install
```

## 🏃‍♂️ How to Run & Test (Local Setup)

Since this project uses GitHub Webhooks, you must run both the Next.js application and a webhook tunneling service (Smee.io) simultaneously.

### 1. Configure Environment Variables
Create a `.env.local` file in the project root to store your secrets.

```bash
touch .env.local
```

## ⚙️ Configuration & Setup

### 1. Environment Variables
Create a `.env` file in your root directory and add the following keys:

```bash
# Your OpenAI API Key (Required for GPT-4o functionality)
OPENAI_API_KEY=sk-...

# Your GitHub Personal Access Token
# Create at: Settings -> Developer Settings -> Personal Access Tokens (Tokens classic)
# Required Scopes: 'repo' (Full control of private repositories)
GITHUB_TOKEN=ghp_...

# A random string you will verify in GitHub Webhook settings (e.g., 'mysecret123')
GITHUB_WEBHOOK_SECRET=mysecret123
```

```bash
Setup Webhook Tunnel (Smee.io)
Since the bot runs on localhost, you must use a proxy to forward GitHub events to your local machine.

Go to smee.io and click "Start a new channel".

Copy your unique Webhook Proxy URL (e.g., https://smee.io/AbCd...).

Open the file smee.js in your project root.

Replace the URL in the source field with your new channel URL:

JavaScript

// smee.js
const smee = new SmeeClient({
  source: 'YOUR_SMEE_URL_HERE', // <--- Paste your unique Smee URL here
  target: 'http://localhost:3000/api/webhook',
  logger: console
})
```
Configure GitHub Webhook
```bash

Create a new empty repository on GitHub (or use an existing test repo).

Navigate to Settings -> Webhooks -> Add webhook.

Fill in the form as follows:

Payload URL: Paste your Smee.io URL.

Content type: Select application/json (Crucial!).

Secret: Enter the string you defined in .env.local (e.g., mysecret123).

Which events? Select "Let me select individual events" and check Pull requests.

Click Add webhook.
```

🏃‍♂️ How to Run

```bash
You must run two terminal processes simultaneously to handle the event pipeline.

Terminal 1: Start the Application
This runs the Next.js Frontend (Dashboard) and the Backend API.

Bash

npm run dev
Frontend Dashboard: Open http://localhost:3000 to configure agents.

Backend API: Listens at http://localhost:3000/api/webhook.

Terminal 2: Start the Webhook Tunnel
This connects your local server to the GitHub Cloud via Smee.io.

Bash

node smee.js
Note: You should see "Connected" in the output indicating the tunnel is active.

🧪 How to Test Locally
Open the Dashboard: Navigate to http://localhost:3000. You can configure the agent prompts here.

Trigger the Bot:

In your test GitHub repo, create a new branch.

Add a file (e.g., test.py) with intentional errors (e.g., password = "secret").

Create a Pull Request.

Verify Success:

Terminal 1 will log: Processing PR...

GitHub PR will receive a comment from the bot within ~15 seconds.

Dashboard (Test & Preview tab) will show the "Helpfulness Score" of the review.
```
