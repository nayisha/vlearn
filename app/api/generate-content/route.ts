import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { topic, courseTitle } = await req.json()

    // Use the correct API key
    if (!process.env.GROQ_API_KEY) {
      process.env.GROQ_API_KEY = "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"
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured. AI generation will not work.")
      return Response.json(
        {
          error: "GROQ_API_KEY is not configured. Please ensure it's set in environment variables or hardcoded correctly.",
        },
        { status: 500 },
      )
    }

    try {
      const result = await generateText({
        model: groq("llama-3.1-8b-instant"),
        prompt: `Create comprehensive educational content about "${topic}" for the course "${courseTitle}".

Structure the content like a textbook chapter with proper formatting:

# ${topic}

Generate content with the following structure:

## Introduction
Write an engaging introduction paragraph explaining what ${topic} is and its importance in ${courseTitle}.

## Core Concepts
Explain the fundamental concepts with clear definitions and explanations.

## Syntax and Examples
${courseTitle.toLowerCase().includes('programming') || courseTitle.toLowerCase().includes('code') || courseTitle.toLowerCase().includes('development') || courseTitle.toLowerCase().includes('javascript') || courseTitle.toLowerCase().includes('python') || courseTitle.toLowerCase().includes('java') || courseTitle.toLowerCase().includes('c++') || courseTitle.toLowerCase().includes('html') || courseTitle.toLowerCase().includes('css') || courseTitle.toLowerCase().includes('react') || courseTitle.toLowerCase().includes('web') ? 
`Provide detailed syntax examples and code snippets with proper formatting:

### Basic Syntax
\`\`\`javascript
// Example: Basic ${topic} syntax
const example = "${topic}";
console.log(example);
\`\`\`

### Advanced Usage
\`\`\`javascript
// Example: Advanced ${topic} implementation
function advanced${topic.replace(/\s+/g, '')}() {
    // Implementation details
    return "Advanced usage demonstration";
}
\`\`\`

Explain each code example line by line and demonstrate multiple use cases.` : 
'Provide practical examples and demonstrations of the concepts in action.'}

## Practical Applications
Discuss real-world usage and practical applications with specific examples.

## Best Practices
Cover important best practices, common pitfalls, and professional tips.

## Key Takeaways
Summarize the most important points and actionable insights.

## Next Steps
Explain how this topic connects to other topics in ${courseTitle} and what to learn next.

FORMATTING REQUIREMENTS:
- Use proper markdown headers according to the size of the texts(------------------------)
- For code examples, use triple backticks with language specification
- Keep code blocks properly formatted with syntax highlighting
- Use single backticks for inline code mentions
- Each section should be well-structured and informative
- Include practical, working code examples that users can copy and use
- Maintain proper spacing and readability`,
        temperature: 0.7,
        maxTokens: 800,
      })
      
      return Response.json({ content: result.text })
    } catch (groqError: any) {
      console.error("Error calling Groq API for content generation:", groqError)
      
      // Provide enhanced fallback content
      const isProgramming = courseTitle.toLowerCase().includes('programming') || 
                           courseTitle.toLowerCase().includes('code') || 
                           courseTitle.toLowerCase().includes('development') ||
                           courseTitle.toLowerCase().includes('javascript') ||
                           courseTitle.toLowerCase().includes('python') ||
                           courseTitle.toLowerCase().includes('java') ||
                           courseTitle.toLowerCase().includes('html') ||
                           courseTitle.toLowerCase().includes('css') ||
                           courseTitle.toLowerCase().includes('react') ||
                           courseTitle.toLowerCase().includes('web')

      const fallbackContent = `# ${topic}

## Introduction
Welcome to learning about ${topic}! This is a crucial concept in ${courseTitle} that will significantly enhance your understanding and skills in this field.

## Core Concepts
${topic} represents fundamental principles that form the backbone of ${courseTitle}. These concepts are essential building blocks that will support your learning journey and practical applications.

${isProgramming ? `## Syntax and Examples
Here are some basic examples related to ${topic}:

\`\`\`
// Example code structure for ${topic}
// This is a basic template to get you started
function example() {
    // Implementation details would go here
    return "Understanding ${topic}";
}
\`\`\`

Key syntax points:
- Use proper indentation for readability
- Follow naming conventions
- Include comments for clarity` : '## Practical Examples\nLet\'s explore how these concepts work in practice with real-world scenarios and applications.'}

## Practical Applications
Understanding ${topic} opens up numerous possibilities for real-world problem-solving and implementation. These skills are directly applicable to professional scenarios you'll encounter.

## Advanced Concepts
As you progress, ${topic} becomes the foundation for more sophisticated techniques and methodologies. Master these basics to unlock advanced capabilities.

## Key Takeaways
- ${topic} is fundamental to success in ${courseTitle}
- Practice these concepts regularly to build proficiency
- Apply these principles to real-world projects
- Connect this knowledge to other course topics

## Connection to Course
${topic} integrates seamlessly with other topics in ${courseTitle}, creating a comprehensive learning experience that builds upon itself progressively.`

      return Response.json({ content: fallbackContent })
    }
  } catch (error) {
    console.error("Unexpected error in content generation route:", error)
    return Response.json({ error: "An unexpected error occurred during content generation." }, { status: 500 })
  }
}
