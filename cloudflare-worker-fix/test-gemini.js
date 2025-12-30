// Test Gemini API Translation
const GEMINI_API_KEY = 'AIzaSyDISsCkK4Pnpx114cXEwl8YQIrEf9apSSM';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const testText = "A young boy discovers he has extraordinary powers and must fight against an evil force threatening his world.";

async function testTranslation() {
    console.log('Testing Gemini API...\n');
    console.log('Input:', testText);
    console.log('\nSending request to Gemini API...\n');

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a professional film content creator for a premium movie streaming platform. Your task is to transcreate the following movie description into high-quality, cinematic Sinhala.

IMPORTANT GUIDELINES:
- Tone: Professional, dramatic, and engaging (suitable for a movie site like Netflix or Prime Video).
- Style: Use "Written Sinhala" (Likhitha) grammar for the main narration, but make it flow with cinematic excitement.
- Avoid: overly casual slang (like "අපේ සුපර්මෑන්") and overly stiff/archaic words.
- Focus: Highlight the conflict, emotion, and stakes of the plot directly.
- Structure: Write it as a compelling synopsis that makes the viewer want to watch the movie immediately.

English Description:
${testText}

Provide ONLY the professional Sinhala synopsis:`
                    }]
                }],
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_NONE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_NONE"
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8000
                }
            })
        });

        console.log('Response Status:', response.status);
        console.log('Response OK:', response.ok);

        const data = await response.json();
        console.log('\nFull API Response:');
        console.log(JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates[0]) {
            console.log('\nFinish Reason:', data.candidates[0].finishReason);

            if (data.candidates[0].content && data.candidates[0].content.parts) {
                const translatedText = data.candidates[0].content.parts[0].text;
                console.log('\n✅ Translation succeeded!');
                console.log('Translated Text:', translatedText);
            } else {
                console.log('\n❌ No content in response');
            }
        } else {
            console.log('\n❌ No candidates in response');
        }

        if (data.error) {
            console.log('\n❌ API Error:', data.error);
        }

    } catch (error) {
        console.log('\n❌ Exception:', error.message);
    }
}

testTranslation();
