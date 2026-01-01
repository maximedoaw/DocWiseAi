import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ ERROR: GEMINI_API_KEY is missing in environment variables.");
            return NextResponse.json({ error: "Server Configuration Error: Missing API Key" }, { status: 500 });
        }

        // 1. Validate Input
        const body = await request.json();
        const { prompt, currentContent, selection } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Missing 'prompt' in request body" }, { status: 400 });
        }

        console.log("🚀 [Gemini API] Received request:", { promptLength: prompt.length, contextLength: currentContent?.length, selectionLength: selection?.length });

        // 2. Initialize Client
        const ai = new GoogleGenAI({ apiKey });

        // 3. Construct System Instructions (Strict Mode)
        const systemInstruction = `
        ### ROLE: PRECISE DOCUMENT EDITOR.
        
        ### CRITICAL RULE: NO CONVERSATIONAL FILLER
        - DO NOT say "Sure", "I can help", "Here is the content", "Okay", "Here is the rewritten text", etc.
        - DO NOT explain what you did.
        - DO NOT use markdown code blocks (\`\`\`markdown).
        - RETURN ONLY THE RAW MARKDOWN CONTENT.
        - START YOUR RESPONSE DIRECTLY WITH THE TEXT.
        
        TASK:
        - Modify the document based on the prompt. 
        - If "USER SELECTION" is provided:
          1. Use "CONTEXT" (currentContent) to understand where the selection fits.
          2. RETURN ONLY the rewritten version of the "USER SELECTION".
          3. DO NOT return the full document.
        - If "USER SELECTION" is empty:
          1. Apply changes to the whole document.
          2. Return the FULL updated document content.
        
        STYLING PREFERENCES:
        - Bold: **text**
        - Italic: _text_
        - Underline: <u>text</u>
        
        CONTEXT:
        ${currentContent ? currentContent.substring(0, 30000) : "No context enabled."}
        
        USER SELECTION:
        ${selection || "No specific selection."}
        `;

        // 4. Call Gemini (Model: gemini-1.5-flash)
        // Note: Using 'contents' array structure for compatibility with latest SDK
        console.log("⏳ [Gemini API] Calling generateContent...");
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                temperature: 0.3, // Lower temperature for more deterministic/precise editing
                candidateCount: 1,
            },
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: systemInstruction + "\n\n### USER REQUEST:\n" + prompt }
                    ]
                }
            ]
        });

        console.log("✅ [Gemini API] Response received.");

        // 5. Extract Text Safely
        // The SDK structure can vary. We check distinct possibilities.
        let text = "";
        
        if (typeof (response as any).text === 'function') {
            text = (response as any).text();
        } else if (typeof (response as any).text === 'string') {
            text = (response as any).text;
        } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
             text = response.candidates[0].content.parts[0].text;
        }

        // Clean up text
        text = text?.trim();

        if (!text) {
            console.error("❌ [Gemini API] Empty response content:", JSON.stringify(response, null, 2));
            throw new Error("Gemini produced empty content.");
        }

        return NextResponse.json({ content: text });

    } catch (error: any) {
        console.error("🔥 [Gemini API] FATAL ERROR:", error);
        
        // Return detailed error to client for debugging
        return NextResponse.json({ 
            error: "Generation Failed", 
            details: error.message || "Unknown error",
            stack: error.stack
        }, { status: 500 });
    }
}

 