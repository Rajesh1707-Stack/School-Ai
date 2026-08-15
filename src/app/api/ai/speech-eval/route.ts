import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const transcript = body?.transcript || '';
    const promptText = body?.promptText || '';
    const expectedKeywords = body?.expectedKeywords || [];

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const aiPrompt = `
You are an expert English Speech & CEFR Pronunciation/Grammar Assessor for school students.
Evaluate the student's spoken response against the lesson task.

Task Prompt: "${promptText}"
Student Spoken Transcript: "${transcript}"

Analyze the student's actual words provided in the transcript. Provide accurate scores and real-time custom feedback based on what they said.

Respond ONLY with valid JSON matching this exact structure, with no markdown formatting:
{
  "overallScore": 84,
  "pronunciationScore": 86,
  "fluencyScore": 82,
  "grammarScore": 80,
  "vocabularyScore": 88,
  "correctedSentence": "The grammatically correct version of what the student spoke",
  "vocabUpgrades": ["relevantWord1", "relevantWord2"],
  "strengths": "Specific positive feedback referencing their spoken words",
  "improvements": "1 specific tip to improve their sentence structure"
}
`;

    // Updated endpoint to use gemini-3.7-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: aiPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error Details:', data.error);
      throw new Error(data.error.message || 'Gemini API Error');
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('No content returned from Gemini AI');
    }

    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const evaluation = JSON.parse(cleanedText);

    return NextResponse.json({ evaluation });

  } catch (err: any) {
    console.error('Speech Eval Route Crash:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}