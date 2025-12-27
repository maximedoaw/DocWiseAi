import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set.");
            return NextResponse.json({ error: "API Configuration Error" }, { status: 500 });
        }

        const body = await request.json();
        const { prompt, currentContent } = body;
        
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const systemPrompt = `
        YOU ARE A PRECISE DOCUMENT EDITOR.
        
        INPUTS:
        1. "CURRENT CONTENT" (The existing document in Markdown).
        2. "USER PROMPT" (Instructions for changes).
        
        YOUR TASK:
        - Return the **FULL** updated document content in Markdown.
        - The user's editor will REPLACE the entire document with your output.
        - Therefore, your output must contain EVERYTHING: both the changed parts and the unchanged parts.
        
        CRITICAL RULES FOR PRESERVATION:
        1. **IDENTICAL COPY**: For any section or paragraph not related to the user's prompt, YOU MUST COPY IT WORD-FOR-WORD from the "CURRENT CONTENT".
        2. **NO DRIFT**: Do not "improve" or "rephrase" parts of the text that the user did not ask you to touch.
        3. **NO TRUNCATION**: Never shorten the document or use placeholders like "[...rest of text...]". Return the full text.
        
        EDITING LOGIC:
        - Locate the specific section(s) requested by the user (e.g., tagged with "@Intro" or described by context).
        - Apply the changes ONLY to those specific areas.
        - If a change affects the logic of other parts, you may update them, but be conservative.
        - Stitch the modified sections back into the original text seamlessly.
        
        OUTPUT FORMAT:
        - Raw Markdown only. No code blocks.
        
        CURRENT CONTENT:
        ${currentContent ? currentContent.substring(0, 30000) : "No context provided."}
        `;

        const finalPrompt = `User Request: ${prompt}`;

        // Using gemini-2.5-flash as requested and simplified contents
        const response = await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents: finalPrompt
        });
        
        const text = response.text;
        
        if (!text) {
             throw new Error("No content generated");
        }
        
        return NextResponse.json({ content: text });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ 
            error: "Failed to generate content", 
            details: error.message 
        }, { status: 500 });
    }
}

 