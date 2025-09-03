import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { courseTitle, topics } = await req.json()

    // Use the correct API key
    if (!process.env.GROQ_API_KEY) {
      process.env.GROQ_API_KEY = "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"
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured. AI generation will not work.")
      const fallbackQuiz = {
        questions: [
          {
            question: "GROQ_API_KEY is not configured. Using fallback quiz.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: "Please ensure your API key is set.",
          },
        ],
      }
      return Response.json(fallbackQuiz)
    }

    let text: string
    try {
      const result = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: `Create a comprehensive quiz for the course "${courseTitle}" covering these topics: ${topics.join(", ")}.

Generate exactly 5 multiple-choice questions that test understanding of the key concepts from these topics.

You must respond with ONLY a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "Clear, specific question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Clear explanation of why this answer is correct"
    }
  ]
}

Requirements for each question:
- Make questions specific and directly related to the course topics: ${topics.join(", ")}
- Each question should test practical understanding, not just memorization
- Options should be plausible but only one clearly correct
- Explanations should be educational and help reinforce learning
- Questions should progress from basic to more advanced concepts
- Avoid overly technical jargon - keep it accessible but accurate

Generate exactly 5 questions and return ONLY the JSON object with no additional text or formatting.`,
        temperature: 0.7,
        maxTokens: 1024,
        topP: 0.9,
      })
      text = result.text
    } catch (groqError: any) {
      console.error("Error calling Groq API for quiz generation:", groqError)
      const fallbackQuiz = {
        questions: [
          {
            question: `Groq API call failed for quiz generation: ${groqError.message || "Unknown error"}. Using fallback quiz.`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: 0,
            explanation: `Error: ${groqError.message || "Unknown error"}. Please check your API key and Groq status.`,
          },
        ],
      }
      return Response.json(fallbackQuiz)
    }

    // Clean the response text to extract valid JSON
    let cleanText = text.trim()
    
    // Remove code block markers if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Try to find JSON object in the response
    const jsonStart = cleanText.indexOf('{')
    const jsonEnd = cleanText.lastIndexOf('}')
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1)
    }

    const quizData = JSON.parse(cleanText)

    return Response.json(quizData)
  } catch (error) {
    console.error("Unexpected error in quiz generation route:", error)
    const fallbackQuiz = {
      questions: [
        {
          question: "An unexpected error occurred during quiz generation. Using fallback quiz.",
          options: [
            "To learn basic concepts",
            "To master advanced techniques",
            "To understand practical applications",
            "All of the above",
          ],
          correctAnswer: 3,
          explanation: "This course covers basic concepts, advanced techniques, and practical applications.",
        },
      ],
    }

    return Response.json(fallbackQuiz)
  }
}
