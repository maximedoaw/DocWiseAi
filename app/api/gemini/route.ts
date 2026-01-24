import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

        if (!apiKey || !convexUrl) {
            console.error("❌ ERROR: Missing API Key or Convex URL.");
            return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
        }

        // 1. Validate Input
        const body = await request.json();
        const { prompt, currentContent, selection, modelStorageId, projectDetails } = body;

        // If simple prompt is missing but we have model+details, we construct a prompt
        let finalPrompt = prompt || "";
        
        if (modelStorageId && projectDetails) {
             finalPrompt = `
             TASK: Generate a complete internship report based on the ATTACHED TEMPLATE FILE structure and the following PROJECT DETAILS.
             
             PROJECT DETAILS:
             - Role/Title: ${projectDetails.title}
             - Company: ${projectDetails.companyName}
             - Description: ${projectDetails.companyDescription}
             - Domain/Activity: ${projectDetails.domains?.join(", ")}
             - Duration: ${projectDetails.duration}
             - Missions: ${projectDetails.missions?.join(", ")}
             - Academic Year: ${projectDetails.academicYear}
             
             INSTRUCTIONS:
             1. **Analyze the structure** of the attached PDF/Doc file (styles, headers, density).
             2. **Replicate this structure** exactly (sections, subsections) but with the content adapted to the NEW Project Details.
             3. **Tone**: Professional, academic, yet engaging.
             4. **Output**: Return the full report formatted in HTML as described in the system instructions. Use <page> tags for pagination if the model has multiple pages.
             `;
        }

        if (!finalPrompt) {
            return NextResponse.json({ error: "Missing 'prompt' or generation details" }, { status: 400 });
        }

        console.log("🚀 [Gemini API] Request:", { hasModel: !!modelStorageId, contextLen: currentContent?.length });

        // 2. Initialize Clients
        const ai = new GoogleGenAI({ apiKey });
        const convex = new ConvexHttpClient(convexUrl);

        // 3. Prepare Parts
        const parts: any[] = [
            { text: finalPrompt }
        ];

        // 4. Handle Model File (Multimodal)
        if (modelStorageId) {
            console.log("📥 [Gemini API] Fetching model file...", modelStorageId);
            const fileUrl = await convex.query(api.files.getUrl, { storageId: modelStorageId });
            
            if (fileUrl) {
                const fileReq = await fetch(fileUrl);
                const arrayBuffer = await fileReq.arrayBuffer();
                const base64Data = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = fileReq.headers.get("content-type") || "application/pdf";

                console.log("📎 [Gemini API] Attaching file:", mimeType);
                
                // Insert file at the beginning for context
                parts.unshift({
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                });
            } else {
                console.warn("⚠️ [Gemini API] Could not get URL for storageId:", modelStorageId);
            }
        }

        // 5. Construct System Instructions (Strict Mode)
        const systemInstruction = `
        ### ROLE: PRECISE DOCUMENT EDITOR & STYLIST.
        ### ROLE: PRECISE DOCUMENT EDITOR & STYLIST.
        
        ### CRITICAL RULE: NO CONVERSATIONAL FILLER
        - DO NOT say "Sure", "I can help", "Here is the content", "Okay", "Here is the rewritten text", etc.
        - DO NOT explain what you did.
        - DO NOT use markdown code blocks (\`\`\`markdown).
        - START YOUR RESPONSE DIRECTLY WITH THE CONTENT.
        
        ### STYLING INSTRUCTIONS (CRITICAL):
        You must return **HTML** to apply specific styles requested by the user.
        - **Text Color**: Use <span style="color: #RRGGBB;">text</span>
        - **Background/Highlight**: Use <span style="background-color: #RRGGBB;">text</span>
        - **Font Size**: Use <span style="font-size: 20px;">text</span> (Keep relative sizes sane).
        - **Bold/Italic/Underline**: Use <b>, <i>, <u> tags.
        - **Alignment**: Use <div style="text-align: center;">...</div>
        - **Structure**: Use standard HTML tags (p, h1, h2, ul, li, table, tr, td).
        
        ### OUTPUT FORMAT:
        - Return **VALID HTML** snippet correctly formatted.
        - Do not wrap in \`\`\`html code blocks. Just return raw HTML.
        - If the user asks for a simple text change without style, simple HTML (<p>) is fine.
        
        TASK:
        - Modify the document based on the prompt. 
        - **NEW CAPABILITY: Multi-Page Creation**:
          - If the user asks to create one or more NEW pages (e.g., "Crée une page de garde", "Génère un plan en 3 pages"), you MUST wrap the content of each new page in a \`<page title="Le Titre de la Page">...</page>\` tag.
          - Inside each \`<page>\` tag, use **rich HTML formatting**. 
          - **MANDATORY**: Use headings (h1 for page title, h2, h3), lists (ul, li), bold (strong), and paragraphs (p).
          - Make the content look professional and well-structured.
          - You can return multiple \`<page>\` blocks in a single response.
        - If "USER SELECTION" contains sections marked with "--- Section: [Title] ---":
          1. Rewrite ONLY the content of those specific sections.
          2. **CRITICAL**: For EACH section you rewrite, wrap it in a div with a data-section attribute matching the EXACT title (e.g., <div data-section="Introduction">...</div>).
          3. **CRITICAL**: DO NOT return the rest of the document.
          4. **CRITICAL**: Include the section header (e.g., <h2>Introduction</h2>) INSIDE the wrapper div.
        - If "USER SELECTION" is a simple text selection:
          1. RETURN ONLY the rewritten version of the selection as HTML.
        - If "USER SELECTION" is empty and no new pages are requested:
          1. Apply changes to the whole document.
          2. Return the FULL updated document content as HTML.
        
        ### TAGGING SYSTEM:
        - The user may use @TagName or @"Tag Name" to reference specific sections.
        - Treat these as primary context for your modifications.
        
        CONTEXT:
        ${currentContent ? currentContent.substring(0, 30000) : "No context enabled."}
        
        USER SELECTION:
        ${selection || "No specific selection."}
        `;

        // Merge System Instruction into the text prompt
        const textPartIndex = parts.findIndex(p => p.text);
        if (textPartIndex !== -1) {
             parts[textPartIndex].text = systemInstruction + "\n\n### USER REQUEST:\n" + parts[textPartIndex].text;
        }

        // 4. Call Gemini (Model: gemini-2.5-flash which supports multimodal)
        console.log("⏳ [Gemini API] Calling generateContent with parts:", parts.length);
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                temperature: 0.3, 
                candidateCount: 1,
            },
            contents: [
                {
                    role: "user",
                    parts: parts
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

        // Clean up text: Robustly extract HTML from potentially wrapped response
        text = text?.trim() || "";
        
        // Try to find content inside ```html ... ``` blocks
        const htmlMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/);
        if (htmlMatch) {
            text = htmlMatch[1].trim();
        } else {
            // If no backticks, try to strip common conversational prefixes
            // but keep it safe. Usually Gemini follows system instructions well.
            // If total text looks like it has HTML tags, it's probably fine.
            text = text.replace(/^[^<]*(<[\s\S]*>)[^>]*$/, "$1").trim();
        }

        if (!text) {
            console.error("❌ [Gemini API] Could not extract valid content from response:", text);
            throw new Error("Gemini produced invalid or empty content.");
        }

        console.log("📤 [Gemini API] Final Cleaned Content Sample:", text.substring(0, 100));

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

 