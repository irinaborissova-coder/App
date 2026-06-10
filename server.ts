import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Google Gen AI to prevent crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured in Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check if Anthropic API is configured
function isAnthropicEnabled(): boolean {
  return typeof process.env.ANTHROPIC_API_KEY === "string" && process.env.ANTHROPIC_API_KEY.trim().length > 0;
}

// Anthropic Messages API client helper using standard native fetch
async function fetchAnthropic(options: {
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: options.maxTokens || 2048,
      system: options.system,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json() as any;
  return data.content?.[0]?.text || "";
}

// Utility to parse JSON robustly from any LLM's response block
function extractJSON(text: string): any {
  try {
    const startIdx = text.indexOf("[");
    const endIdx = text.lastIndexOf("]");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      return JSON.parse(text.slice(startIdx, endIdx + 1));
    }
    const objStartIdx = text.indexOf("{");
    const objEndIdx = text.lastIndexOf("}");
    if (objStartIdx !== -1 && objEndIdx !== -1 && objEndIdx > objStartIdx) {
      return JSON.parse(text.slice(objStartIdx, objEndIdx + 1));
    }
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON content from text response:", text);
    throw err;
  }
}

// ----------------------------------------------------
// API Route Handlers
// ----------------------------------------------------

// 1. Job search routing using Gemini or Claude
app.post("/api/career/job-search", async (req, res) => {
  try {
    const { query, resumeContext } = req.body;
    const searchTopic = query || "Marketing or Product Executive";

    const prompt = `Based on this resume context:
${JSON.stringify(resumeContext || {})}

Recommend 3 highly targeted job listings that match this search query: "${searchTopic}".
Return the job recommendations in a JSON array format matching the following schema. Ensure that match scores are numbers between 50 and 100 representing how well the candidate matches the description. Customize "matchExplanation" and list 2-3 specific "adjustmentsNeeded" for each job dynamically.

Job fields to return inside the JSON array:
- id: short unique string (e.g. "job-1", "job-2")
- title: job title
- company: company name
- location: location (e.g. "San Francisco, CA" or "Remote")
- type: "remote" | "hybrid" | "onsite"
- matchScore: integer percentage
- matchExplanation: tailored sentence explaining why this matches their specific skills
- adjustmentsNeeded: string array of specific keywords or bullets missing from their current resume
- description: clear, professional 2-sentence description of the role
- salaryRange: approximate market rate (e.g. "$180,000 - $220,000")
- postedTime: e.g. "2 days ago" or "Just posted"

IMPORTANT: Return only a raw JSON array. Start with [ and end with ]. Do not explain your reasoning or add any conversational text context around it.`;

    let textResponse = "";

    if (isAnthropicEnabled()) {
      console.log("[API] Routing Job Search to Anthropic Claude 3.5 Sonnet...");
      textResponse = await fetchAnthropic({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // lower temperature for cleaner structured JSON
      });
    } else {
      console.log("[API] Routing Job Search to Google Gemini 3.5 Flash...");
      const client = getAI();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                location: { type: Type.STRING },
                type: { type: Type.STRING },
                matchScore: { type: Type.INTEGER },
                matchExplanation: { type: Type.STRING },
                adjustmentsNeeded: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                description: { type: Type.STRING },
                salaryRange: { type: Type.STRING },
                postedTime: { type: Type.STRING }
              },
              required: ["id", "title", "company", "location", "type", "matchScore", "matchExplanation", "adjustmentsNeeded", "description"]
            }
          }
        }
      });
      textResponse = response.text || "[]";
    }

    const jobs = extractJSON(textResponse);
    res.json({ success: true, jobs });
  } catch (err: any) {
    console.error("Job Search API Error:", err);
    res.status(500).json({ error: err.message || "Failed to search jobs." });
  }
});

// 2. Resume Critique API
app.post("/api/career/critique", async (req, res) => {
  try {
    const { resume } = req.body;
    if (!resume) {
      return res.status(400).json({ error: "Resume metadata missing." });
    }

    const prompt = `Analyze this executive resume draft:
${JSON.stringify(resume)}

Provide a constructive resume critique report including:
1. An overall audit score (between 10 and 100)
2. Strengths: 3 major strong points in their narrative
3. Gaps: 3 items that are weak, lacking metrics, or have generic phrasing
4. Action Items: 3 clear step-by-step editing directives to level up this resume immediately

IMPORTANT: Return ONLY valid, raw JSON with fields:
- overallScore: integer
- strengths: string array (3 items)
- gaps: string array (3 items)
- actionItems: string array (3 items)

Start your output with { and end with }. Do not add any explanation or markdown formatting outside of the JSON object.`;

    let textResponse = "";

    if (isAnthropicEnabled()) {
      console.log("[API] Routing Resume Critique to Anthropic Claude 3.5 Sonnet...");
      textResponse = await fetchAnthropic({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      });
    } else {
      console.log("[API] Routing Resume Critique to Google Gemini 3.5 Flash...");
      const client = getAI();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              gaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              actionItems: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["overallScore", "strengths", "gaps", "actionItems"]
          }
        }
      });
      textResponse = response.text || "{}";
    }

    const report = extractJSON(textResponse);
    res.json({ success: true, report });
  } catch (err: any) {
    console.error("Critique API Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate critique." });
  }
});

// 3. Document Tailor & Cover Letter Creator API
app.post("/api/career/generate-document", async (req, res) => {
  try {
    const { documentType, resume, job } = req.body;
    if (!resume || !job) {
      return res.status(400).json({ error: "Missing resume or target job for template selection." });
    }

    let prompt = "";
    if (documentType === "cover-letter") {
      prompt = `Create a professional, modern, high-impact Cover Letter tailored for the following job at ${job.company}:
Job Details: ${JSON.stringify(job)}

Using the candidate profile:
${JSON.stringify(resume)}

The cover letter should use elegant storytelling, maintain a persuasive executive tone, link key historical achievements directly to the job requirements, and be ready to copy and paste. Length should be around 300-400 words. Address it to the hiring manager at ${job.company}. Ensure there are no generic placeholder brackets [like this] where possible, fill them with smart contextual guesses or default professional entries instead.`;
    } else {
      prompt = `Suggest tailored resume experience descriptions. Specifically, take the current experiences of:
${JSON.stringify(resume.experience)}

And modify/add 1-2 new high-impact accomplishments or refine existing bullets to tailor the resume specifically for the job position of "${job.title}" at "${job.company}". Make sure the bullets highlight skills like: ${job.adjustmentsNeeded?.join(", ") || "relevant domain expertise"}.
Return a list of adjusted bullet recommendations or the fully rewritten experience block text. Use professional action verbs and metrics.`;
    }

    let textResponse = "";

    if (isAnthropicEnabled()) {
      console.log("[API] Routing Document Generation to Anthropic Claude 3.5 Sonnet...");
      textResponse = await fetchAnthropic({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
    } else {
      console.log("[API] Routing Document Generation to Google Gemini 3.5 Flash...");
      const client = getAI();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      textResponse = response.text || "No content generated";
    }

    res.json({ success: true, content: textResponse });
  } catch (err: any) {
    console.error("Document Generator API Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate document." });
  }
});

// 4. Copilot Chat routing
app.post("/api/career/chat", async (req, res) => {
  try {
    const { messages, resumeContext } = req.body;

    const systemInstruction = `You are "Career Copilot", a premium AI career advisor and veteran executive talent agent.
The user is professional executive: ${resumeContext ? resumeContext.name : "Irina Borissova"}.
Their profile: ${JSON.stringify(resumeContext || {})}.
Always maintain an insightful, professional, strategic tone. Focus on giving real solutions, metric-based resume feedback, market salary navigation, and interview prep suggestions. Avoid rambling or empty generic encouragements. Refer to user's accomplishments from their CDI Media or performance marketer history when relevant.`;

    let textResponse = "";

    if (isAnthropicEnabled()) {
      console.log("[API] Routing Chat to Anthropic Claude 3.5 Sonnet...");
      const formattedMessages = messages.map((m: any) => ({
        role: m.role === "assistant" ? "assistant" as const : "user" as const,
        content: m.content,
      }));

      textResponse = await fetchAnthropic({
        system: systemInstruction,
        messages: formattedMessages,
        temperature: 0.7,
      });
    } else {
      console.log("[API] Routing Chat to Google Gemini 4.5 Flash...");
      const client = getAI();
      const chatHistory = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: m.content }]
      }));

      // Get last user message
      const lastUserMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text || "Hello Career Copilot";
      const history = chatHistory.slice(0, -1);

      const chatInstance = client.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction,
        },
        history: history.length > 0 ? history : undefined
      });

      const response = await chatInstance.sendMessage({
        message: lastUserMessage
      });
      textResponse = response.text || "No response text received.";
    }

    res.json({ success: true, content: textResponse });
  } catch (err: any) {
    console.error("Chat API Error:", err);
    res.status(500).json({ error: err.message || "Failed to communicate with AI." });
  }
});

// 5. Interactive Interview Preparer API
app.post("/api/career/interview", async (req, res) => {
  try {
    const { jobTitle, company, step, userLatestAnswer, previousConversation } = req.body;

    let prompt = "";
    if (step === "start") {
      prompt = `You are the lead executive recruiter interviewing a high-potential candidate for the role of "${jobTitle}" at "${company}".
Greet the candidate professionally and ask the first highly relevant, behavioral or technical interview question tailored to this role. Keep the question crisp and direct.`;
    } else {
      prompt = `You are the lead executive recruiter interviewing a candidate for the role of "${jobTitle}" at "${company}".
Here is the previous interview dialogue and questions asked so far:
${JSON.stringify(previousConversation || [])}

The candidate's latest response:
"${userLatestAnswer}"

Provide two things in your output:
1. Crisp, brief professional evaluation of their answer (approx 2 sentences, stating strengths or areas of improvement).
2. The next professional interview question (keep it sharp and realistic).

Structure your output format so it is highly readable and aesthetic.`;
    }

    let textResponse = "";

    if (isAnthropicEnabled()) {
      console.log("[API] Routing Interview simulation to Anthropic Claude 3.5 Sonnet...");
      textResponse = await fetchAnthropic({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
    } else {
      console.log("[API] Routing Interview simulation to Google Gemini 3.5 Flash...");
      const client = getAI();
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      textResponse = response.text || "Failed to generate interview step.";
    }

    res.json({ success: true, content: textResponse });
  } catch (err: any) {
    console.error("Interview API Error:", err);
    res.status(500).json({ error: err.message || "Failed to simulate interview step." });
  }
});

// Serve static build assets or mount Vite dev handler
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Career Copilot Server active on http://0.0.0.0:${PORT}`);
    if (isAnthropicEnabled()) {
      console.log("[Server Initialization] Anthropic integration verified & ACTIVE! Using Claude 3.5 Sonnet.");
    } else {
      console.log("[Server Initialization] Using fallback Google Gemini configuration.");
    }
  });
};

startServer().catch((err) => {
  console.error("Failed to start server", err);
});
