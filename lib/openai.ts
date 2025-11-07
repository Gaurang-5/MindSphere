import OpenAI from "openai";


export function getClient() {
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("OPENAI_API_KEY missing");
const baseURL = process.env.OPENAI_BASE_URL || undefined; // optional override
return new OpenAI({ apiKey, baseURL });
}


export const MODEL = process.env.NODE_ENV === "production" ? "gpt-4.1" : "gpt-4o-mini"; // swap to latest available