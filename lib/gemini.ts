// ============================================================
// lib/gemini.ts
// Google Gemini API client
// ============================================================

import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiModel = "gemini-2.0-flash";

export { genai };
