"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, ChevronRight, Lightbulb } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  topics: string[]
  progress: number
  completed: boolean
  icon: string
  user_id: string
  created_at: string
}

interface LearningModuleProps {
  course: Course
}

export function LearningModule({ course }: LearningModuleProps) {
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const currentTopic = course.topics[currentTopicIndex]

  const generateContent = async (topic: string) => {
    setLoading(true)
    setError("")
    setContent("") // Clear previous content

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          courseTitle: course.title,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Failed to generate content: ${response.statusText}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      if (data.content) {
        setContent(data.content)
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate content. Please try again.")
      console.error("Error generating content:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentTopic) {
      generateContent(currentTopic)
    }
  }, [currentTopic, course.title])

  const nextTopic = () => {
    // Mark current topic as completed
    const topicProgress = JSON.parse(localStorage.getItem("topic-progress") || "{}")
    if (!topicProgress[course.id]) {
      topicProgress[course.id] = {}
    }
    topicProgress[course.id][currentTopicIndex] = true
    localStorage.setItem("topic-progress", JSON.stringify(topicProgress))

    // Log learning activity
    const activity = {
      userId: course.user_id,
      type: "topic_completed",
      title: `Completed: ${currentTopic}`,
      courseId: course.id,
      topicIndex: currentTopicIndex,
      date: new Date().toISOString()
    }
    const learningActivity = JSON.parse(localStorage.getItem("learning-activity") || "[]")
    learningActivity.push(activity)
    localStorage.setItem("learning-activity", JSON.stringify(learningActivity))

    if (currentTopicIndex < course.topics.length - 1) {
      setCurrentTopicIndex(currentTopicIndex + 1)
    }
  }

  const previousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(currentTopicIndex - 1)
    }
  }

  const progressPercentage = ((currentTopicIndex + 1) / course.topics.length) * 100

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Topic {currentTopicIndex + 1} of {course.topics.length}
              </CardTitle>
              <CardDescription>{currentTopic}</CardDescription>
            </div>
            <Badge variant="outline">{Math.round(progressPercentage)}% Complete</Badge>
          </div>
          <Progress value={progressPercentage} className="mt-4" />
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Course Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {course.topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => setCurrentTopicIndex(index)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  index === currentTopicIndex
                    ? "bg-primary text-primary-foreground"
                    : index < currentTopicIndex
                      ? "bg-muted text-muted-foreground"
                      : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{topic}</span>
                  {index < currentTopicIndex && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                  {index === currentTopicIndex && <ChevronRight className="h-4 w-4" />}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              {currentTopic}
            </CardTitle>
            <CardDescription>
              Learn about {currentTopic.toLowerCase()} in {course.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => generateContent(currentTopic)}>Try Again</Button>
              </div>
            ) : (

              <div className="prose prose-sm max-w-none">
                {content.split('\n').map((line, index) => {
                  const trimmed = line.trim();
                  if (!trimmed) return <br key={index} />;

                  // Handle code blocks
                  if (trimmed.startsWith('```')) {
                    const language = trimmed.replace('```', '').trim();
                    const codeBlockIndex = index;
                    const codeLines = [];
                    let endIndex = index + 1;
                    
                    // Find the closing ```
                    const contentLines = content.split('\n');
                    for (let i = index + 1; i < contentLines.length; i++) {
                      if (contentLines[i].trim() === '```') {
                        endIndex = i;
                        break;
                      }
                      codeLines.push(contentLines[i]);
                    }
                    
                    // Only render if this is the opening ```
                    if (!contentLines[index - 1] || !contentLines[index - 1].includes('```')) {
                      return (
                        <div key={index} className="my-4">
                          <div className="bg-gray-900 rounded-lg overflow-hidden">
                            <div className="bg-gray-800 px-4 py-2 text-sm text-gray-300 font-mono">
                              {language || 'code'}
                            </div>
                            <pre className="p-4 overflow-x-auto">
                              <code className="text-green-400 font-mono text-sm leading-relaxed">
                                {codeLines.join('\n')}
                              </code>
                            </pre>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }

                  // Skip closing ``` tags
                  if (trimmed === '```') {
                    return null;
                  }

                  // Handle headers
                  if (trimmed.startsWith('# ')) {
                    return (
                      <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 mt-8">
                        {trimmed.replace('# ', '')}
                      </h1>
                    );
                  }
                  
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold text-gray-800 mb-4 mt-6">
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }
                  
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3 key={index} className="text-xl font-semibold text-gray-800 mb-3 mt-4">
                        {trimmed.replace('### ', '')}
                      </h3>
                    );
                  }

                  // Handle inline code
                  const processInlineCode = (text: string) => {
                    const parts = text.split(/(`[^`]+`)/g);
                    return parts.map((part, partIndex) => {
                      if (part.startsWith('`') && part.endsWith('`')) {
                        return (
                          <code key={partIndex} className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-purple-600">
                            {part.slice(1, -1)}
                          </code>
                        );
                      }
                      return part;
                    });
                  };

                  // Handle bold text
                  const processBoldText = (text: string) => {
                    const parts = text.split(/(\*\*[^*]+\*\*)/g);
                    return parts.map((part, partIndex) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={partIndex} className="font-semibold">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return processInlineCode(part);
                    });
                  };

                  // Regular paragraphs and lists
                  if (trimmed.startsWith('- ')) {
                    return (
                      <li key={index} className="text-gray-700 leading-relaxed mb-2 ml-4">
                        {processBoldText(trimmed.replace('- ', ''))}
                      </li>
                    );
                  }

                  // Regular paragraphs
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed mb-3">
                      {processBoldText(trimmed)}
                    </p>
                  );
                }).filter(Boolean)}
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={previousTopic} disabled={currentTopicIndex === 0}>
                Previous Topic
              </Button>
              <div className="flex gap-2">
                {currentTopicIndex === course.topics.length - 1 ? (
                  <Button onClick={() => {
                    // Mark current topic as completed
                    const topicProgress = JSON.parse(localStorage.getItem("topic-progress") || "{}")
                    if (!topicProgress[course.id]) {
                      topicProgress[course.id] = {}
                    }
                    topicProgress[course.id][currentTopicIndex] = true
                    localStorage.setItem("topic-progress", JSON.stringify(topicProgress))

                    // Log learning activity
                    const activity = {
                      userId: course.user_id,
                      type: "topic_completed",
                      title: `Completed: ${currentTopic}`,
                      courseId: course.id,
                      topicIndex: currentTopicIndex,
                      date: new Date().toISOString()
                    }
                    const learningActivity = JSON.parse(localStorage.getItem("learning-activity") || "[]")
                    learningActivity.push(activity)
                    localStorage.setItem("learning-activity", JSON.stringify(learningActivity))

                    // Navigate to quiz by updating the parent component state
                    // Create a custom event that the parent Dashboard component can listen to
                    const navigateEvent = new CustomEvent('navigateToQuiz', { 
                      detail: { courseId: course.id } 
                    });
                    window.dispatchEvent(navigateEvent);
                  }}>
                    Take Quiz
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={nextTopic}>
                    Next Topic
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}