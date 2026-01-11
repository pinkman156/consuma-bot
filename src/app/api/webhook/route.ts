import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "octokit";
import { generateReview, evaluateReview } from "@/lib/llm";

// Initializing Octokit - passing the token allows us to post comments back to GitHub
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });


const AGENT_PROMPT = `You are a Principal Security Engineer.
Review the code for:
- Hardcoded secrets
- Injection vulnerabilities (SQLi, XSS)
- Insecure dependencies

Format as:
### 🚨 Security Review
**Severity:** [High/Medium/Low]
**Issue:** [Description]
**Fix:** [Code snippet]`;
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = req.headers.get("x-github-event");

    // Check if this is a Pull Request event (Opened or Updated)
    if (event === "pull_request" && ["opened", "synchronize"].includes(payload.action)) {
      const pr = payload.pull_request;
      const repo = payload.repository;
      
      console.log(`Processing PR #${pr.number}: ${pr.title}`);

      // 1. Fetch the Diff using GitHub API
      // We request the 'diff' format specifically
      const { data: diff } = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: repo.owner.login,
        repo: repo.name,
        pull_number: pr.number,
        mediaType: { format: "diff" }
      });

      // 2. Generate the Review using our LLM Lib
      const review = await generateReview(String(diff), AGENT_PROMPT);

      // 3. Post the Comment to GitHub
      await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
        owner: repo.owner.login,
        repo: repo.name,
        issue_number: pr.number,
        body: `### 🤖 Consuma Bot Review\n\n${review}`
      });

      // 4. Run Evaluation (Stored in logs for now, displayed in Dashboard later)
      const evaluation = await evaluateReview(String(diff), review);
      console.log("Evaluation Results:", evaluation);

      return NextResponse.json({ success: true, evaluation });
    }

    return NextResponse.json({ message: "Event ignored" });
  } catch (error: any) {
    console.error("Error in webhook:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}