import OpenAI from 'openai';

// Initialize OpenAI with the key from your .env.local file
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// 1. GENERATION: The Agent reviews the code
export async function generateReview(diff: string, prompt: string) {
  // We truncate the diff to 5000 chars to save costs and avoid token limits for this MVP
  const truncatedDiff = diff.substring(0, 5000); 
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use "gpt-3.5-turbo" if you don't have access to 4o
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: `Review this Git Diff for critical issues:\n\n${truncatedDiff}` }
      ]
    });
    return response.choices[0].message.content || "No review generated.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Error generating review. Please check API Key.";
  }
}

// 2. EVALUATION: The Supervisor rates the review
// lib/llm.ts (Update this function)

export async function evaluateReview(diff: string, review: string) {
    // Matches PDF Requirements 
    const prompt = `
      You are a Senior Technical QA. Evaluate this code review comment for quality.
  
      Original Code:
      ${diff.substring(0, 1000)}
  
      Review Comment:
      ${review}
  
      Rate the review on these dimensions (scale 1-10):
      1. Relevance: Does it address actual issues in the code?
      2. Accuracy: Is the technical assessment correct?
      3. Actionability: Does it provide clear next steps?
      4. Clarity: Is it easy to understand?
  
      Return JSON format only:
      {
        "relevance": number,
        "accuracy": number,
        "actionability": number,
        "clarity": number,
        "average_score": number, (Calculate the average of the 4 scores)
        "reason": "Brief justification for the score"
      }
    `;
  
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });
  
    const data = JSON.parse(response.choices[0].message.content || "{}");
    
    // Map to the format your Dashboard expects (score + reason)
    return {
      score: data.average_score || 0,
      reason: data.reason || "No reasoning provided",
      details: data // You can log this or display it if you have time
    };
  }