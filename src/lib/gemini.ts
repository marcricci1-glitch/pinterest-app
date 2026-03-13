import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generatePinText(prompt: string, article?: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fullPrompt = `
    Based on the following article/description and prompt, generate a Pinterest optimized:
    1. Title (catchy, keyword-rich, under 100 chars)
    2. Description (engaging, includes keywords, under 500 chars)
    3. 5-10 relevant Hashtags

    Article/Data: ${article || "No article provided"}
    Context/Prompt: ${prompt}

    Return the response as a JSON object with keys: title, description, hashtags (array).
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = response.text();

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return null;
  }
}

export async function generatePinImage(prompt: string, style: string) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const MODEL = "imagen-3.0-generate-001";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predict?key=${API_KEY}`;

  const payload = {
    instances: [
      {
        prompt: `Pinterest Pin, ${style} style, ${prompt}, 9:16 aspect ratio, high resolution, aesthetically pleasing`
      }
    ],
    parameters: {
      sampleCount: 1,
      aspectRatio: "9:16"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data.predictions && data.predictions[0]) {
      return data.predictions[0].bytesBase64Encoded;
    }

    if (data.candidates && data.candidates[0].content.parts[0].inlineData) {
        return data.candidates[0].content.parts[0].inlineData.data;
    }

    console.error("Imagen API Error:", data);
    return null;
  } catch (error) {
    console.error("Failed to generate image via Imagen API:", error);
    return null;
  }
}
