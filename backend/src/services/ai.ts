import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

/** Backend-only Gemini integration. Falls back to clearly-labelled DEMO MODE without an API key. */
const client = env.geminiKey ? new GoogleGenAI({ apiKey: env.geminiKey }) : null;
export const aiAvailable = () => client !== null;

export interface AiResult<T> { demo: boolean; data: T; note?: string }

const SKILL_DICT = [
  "javascript", "typescript", "react", "next.js", "node.js", "express", "mongodb", "sql", "python",
  "java", "c++", "docker", "aws", "git", "html", "css", "tailwind", "django", "flask", "machine learning",
  "data analysis", "figma", "communication", "leadership", "rest api", "graphql", "kubernetes", "testing",
];

export const extractSkills = (text: string): string[] => {
  const t = text.toLowerCase();
  return SKILL_DICT.filter((s) => t.includes(s));
};

export const matchScore = (studentSkills: string[], jobSkills: string[]): number => {
  if (!jobSkills.length) return 50;
  const s = new Set(studentSkills.map((x) => x.toLowerCase()));
  const hit = jobSkills.filter((j) => s.has(j.toLowerCase())).length;
  return Math.round((hit / jobSkills.length) * 100);
};

function parseJson(text: string): any {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in model response");
  return JSON.parse(m[0]);
}

export async function runJson<T>(
  system: string,
  user: string,
  demo: () => T
): Promise<AiResult<T>> {

  if (!client) {
    return {
      demo: true,
      data: demo(),
      note: "DEMO MODE: GEMINI_API_KEY is not configured."
    };
  }

  try {
    const request = {
      model: env.geminiModel,
      contents: user,
      config: {
        systemInstruction:
          system + "\nRespond with ONE valid JSON object only. No prose or markdown.",
        responseMimeType: "application/json" as const,
        maxOutputTokens: 4096,
      },
    };

    let res;
    let lastError: unknown;

    // Retry temporary Gemini server failures up to 3 attempts.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await client.models.generateContent(request);
        break;
      } catch (error) {
        lastError = error;

        const msg = String(error);

        const temporary =
          /503|UNAVAILABLE|high demand|overloaded/i.test(msg);

        if (!temporary || attempt === 2) {
          throw error;
        }

        const delay = 2000 * (attempt + 1);

        console.warn(
          `Gemini temporarily unavailable. Retrying in ${delay}ms...`
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!res) {
      throw lastError || new Error("Gemini returned no response.");
    }

    const text = res.text ?? "";

    if (!text.trim()) {
      throw new Error("Gemini returned an empty response.");
    }

    return {
      demo: false,
      data: parseJson(text) as T,
    };

  } catch (error) {
    const msg =
      error instanceof Error ? error.message : String(error);

    console.error("Gemini call failed:", msg);

    return {
      demo: true,
      data: demo(),
      note: "DEMO MODE: Gemini is temporarily unavailable or the request failed. Check backend logs and API quota."
    };
  }
}


export const analyzeResume = (text: string) =>
  runJson(
    "You are a resume reviewer. Return {score:number 0-100, skills:string[], strengths:string[], improvements:string[], summary:string}. Be honest and specific.",
    `Resume text:\n${text.slice(0, 8000)}`,
    () => {
      const skills = extractSkills(text);
      const words = text.split(/\s+/).filter(Boolean).length;
      const score = Math.min(95, 30 + skills.length * 5 + Math.min(25, Math.floor(words / 40)));
      return {
        score, skills,
        strengths: skills.length ? [`Mentions ${skills.slice(0, 4).join(", ")}`] : [],
        improvements: [
          ...(words < 200 ? ["Resume looks short; add projects and measurable outcomes"] : []),
          ...(skills.length < 5 ? ["List more relevant technical skills"] : []),
          "Quantify achievements (e.g. 'reduced load time by 30%')",
        ],
        summary: `Detected ${skills.length} known skills across ${words} words.`,
      };
    }
  );

export const skillGap = (studentSkills: string[], target: { title: string; skills: string[] }) =>
  runJson(
    "You are a career coach. Return {missing:string[], matched:string[], plan:{skill:string,resource:string}[], summary:string}. Do not invent URLs.",
    `Target role: ${target.title}\nRequired skills: ${target.skills.join(", ")}\nStudent skills: ${studentSkills.join(", ")}`,
    () => {
      const s = new Set(studentSkills.map((x) => x.toLowerCase()));
      const matched = target.skills.filter((k) => s.has(k.toLowerCase()));
      const missing = target.skills.filter((k) => !s.has(k.toLowerCase()));
      return {
        matched, missing,
        plan: missing.map((k) => ({ skill: k, resource: `Search for an official ${k} tutorial and build one small project` })),
        summary: `${matched.length}/${target.skills.length} required skills matched.`,
      };
    }
  );

export const interviewCoach = (role: string, question?: string, answer?: string) =>
  runJson(
    "You are an interview coach. If no answer is provided return {question:string}. If an answer is provided return {feedback:string, score:number 0-10, improvements:string[], nextQuestion:string}.",
    `Role: ${role}\nQuestion: ${question || "(none, generate first question)"}\nCandidate answer: ${answer || "(none)"}`,
    () =>
      answer
        ? {
            feedback: answer.split(/\s+/).length < 40 ? "Answer is brief. Add a concrete example using the STAR format." : "Good length. Make sure you state the result you achieved.",
            score: Math.min(10, Math.max(3, Math.round(answer.split(/\s+/).length / 15))),
            improvements: ["Use the STAR structure", "Quantify the outcome"],
            nextQuestion: "Tell me about a time you resolved a conflict in a team.",
          }
        : { question: `Tell me about a project that prepared you for a ${role} role.` }
  );

/** Advisory only. Never changes application status. */
export const screenCandidate = (job: { title: string; skills: string[]; description: string }, student: { skills: string[]; resumeText: string; cgpa: number }) =>
  runJson(
    "You assist a recruiter. Return {fitScore:number 0-100, strengths:string[], concerns:string[], suggestedQuestions:string[], note:string}. You are advisory only; never recommend automatic rejection.",
    `Job: ${job.title}\nRequired: ${job.skills.join(", ")}\n${job.description.slice(0, 1500)}\n\nCandidate skills: ${student.skills.join(", ")}\nCGPA: ${student.cgpa}\nResume: ${student.resumeText.slice(0, 4000)}`,
    () => {
      const score = matchScore(student.skills, job.skills);
      const s = new Set(student.skills.map((x) => x.toLowerCase()));
      return {
        fitScore: score,
        strengths: job.skills.filter((k) => s.has(k.toLowerCase())).map((k) => `Has ${k}`),
        concerns: job.skills.filter((k) => !s.has(k.toLowerCase())).map((k) => `No evidence of ${k}`),
        suggestedQuestions: ["Walk me through your most relevant project.", "How would you learn a skill you lack?"],
        note: "Advisory score from skill overlap. A human must make the decision.",
      };
    }
  );
