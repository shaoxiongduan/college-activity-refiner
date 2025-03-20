"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { refineActivities } from "@/lib/ai-service"
import { InitialForm } from "./InitialForm"
import { ResultsForm } from "./ResultsForm"

// Add the AIRefinedActivity interface
interface AIRefinedActivity {
  title: string;
  organization?: string;
  description: string;
  evaluation: string;
  keyPoints: string[];
}

// Interface to represent a message in the conversation
interface ConversationMessage {
  type: 'user' | 'assistant';
  content: string;
  refinedActivity?: AIRefinedActivity;
  timestamp: Date;
}

const formSchema = z.object({
  applicationType: z.string({
    required_error: "Please select an application type",
  }),
  activityText: z.string().min(1, {
    message: "Please enter your activity",
  }),
})

const feedbackSchema = z.object({
  feedback: z.string().min(1, {
    message: "Please enter your feedback",
  }),
})

const applicationTypes = [
  {
    id: "common-app",
    name: "Common Application",
    titleLimit: 50,
    organizationLimit: 100,
    descriptionLimit: 150,
    maxActivities: 10,
    description: "10 activities with title (50 char), organization (100 char), and description (150 char)"
  },
  {
    id: "uc-app",
    name: "University of California",
    titleLimit: 60,
    organizationLimit: 0, // UC doesn't have a separate organization field
    descriptionLimit: 350,
    maxActivities: 5,
    description: "Up to 5 activities with title (60 char) and description (350 char)"
  },
  {
    id: "coalition",
    name: "Coalition Application",
    titleLimit: 64,
    organizationLimit: 100,
    descriptionLimit: 255,
    maxActivities: 8,
    description: "8 activities with title (64 char), organization (100 char), and description (255 char)"
  },
  {
    id: "applytexas",
    name: "ApplyTexas",
    titleLimit: 40,
    organizationLimit: 60,
    descriptionLimit: 240,
    maxActivities: 6,
    description: "Top 6 activities with title (40 char), organization (60 char), and description (240 char)"
  },
]

export function ActivityRefinerForm() {
  const [aiRefined, setAiRefined] = useState<AIRefinedActivity | null>(null)
  const [selectedAppType, setSelectedAppType] = useState<string | undefined>()
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [originalActivity, setOriginalActivity] = useState<string>("")
  const [isInitialView, setIsInitialView] = useState<boolean>(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityText: "",
    },
  })

  const resultsForm = useForm({
    defaultValues: {
      activityTitle: "",
      organizationName: "",
      refinedActivityDescription: "",
      activityText: ""
    }
  })

  const feedbackForm = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
    },
  })

  const resetToInitialView = () => {
    setIsInitialView(true)
    setAiRefined(null)
    setConversation([])
    setOriginalActivity("")
    form.reset()
    feedbackForm.reset()
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const appType = applicationTypes.find(type => type.id === values.applicationType)

    if (!appType) return

    // Process a single activity
    const activity = values.activityText.trim()
    if (!activity) return

    // Store the original activity
    setOriginalActivity(activity)
    
    // Set activityText in the resultsForm
    resultsForm.setValue("activityText", activity)

    // Reset conversation history when starting fresh
    setConversation([{
      type: 'user',
      content: activity,
      timestamp: new Date()
    }])

    // Get all the limits
    const titleLimit = appType.titleLimit
    const orgLimit = appType.organizationLimit
    const descLimit = appType.descriptionLimit

    setAiRefined(null) // Clear previous AI results
    setIsInitialView(false) // Switch to the results view

    // Always try to use AI if an API key is available
    if (hasApiKey) {
      try {
        setIsAiProcessing(true)
        setAiError(null)

        const aiRefinedResults = await refineActivities({
          activities: [activity],
          applicationType: appType.name,
          titleLimit: titleLimit,
          organizationLimit: orgLimit,
          descriptionLimit: descLimit,
          maxActivities: 1
        })

        if (aiRefinedResults && aiRefinedResults.length > 0) {
          const result = aiRefinedResults[0]
          setAiRefined(result)
          
          // Update form values with AI results
          resultsForm.setValue("activityTitle", result.title)
          if (result.organization) {
            resultsForm.setValue("organizationName", result.organization)
          }
          resultsForm.setValue("refinedActivityDescription", result.description)
          
          // Add AI response to conversation
          setConversation(prev => [
            ...prev,
            {
              type: 'assistant',
              content: `Title: ${result.title}\n${result.organization ? `Organization: ${result.organization}\n` : ''}Description: ${result.description}`,
              refinedActivity: result,
              timestamp: new Date()
            }
          ])
        } else {
          throw new Error("AI did not return any results")
        }
      } catch (error) {
        console.error("AI refinement error:", error)
        setAiError(error instanceof Error ? error.message : "Failed to process with AI. Please check your API settings (URL and key).")
      } finally {
        setIsAiProcessing(false)
      }
    } else {
      // If no API key, show message to add one
      setAiError("API key is required. Please add your API key in the settings to use AI features.")
    }
  }

  async function handleFeedbackSubmit(values: z.infer<typeof feedbackSchema>) {
    const appType = applicationTypes.find(type => type.id === form.getValues().applicationType)
    
    if (!appType || !originalActivity || !hasApiKey) return
    
    const feedback = values.feedback.trim()
    if (!feedback) return
    
    // Add user feedback to conversation
    setConversation(prev => [
      ...prev,
      {
        type: 'user',
        content: feedback,
        timestamp: new Date()
      }
    ])
    
    // Clear the feedback form
    feedbackForm.reset()
    
    // Process with AI
    try {
      setIsAiProcessing(true)
      setAiError(null)
      
      // Extract previous conversation for context
      const previousMessages = conversation.map(msg => ({
        role: msg.type,
        content: msg.content
      }))
      
      const aiRefinedResults = await refineActivities({
        activities: [originalActivity],
        applicationType: appType.name,
        titleLimit: appType.titleLimit,
        organizationLimit: appType.organizationLimit,
        descriptionLimit: appType.descriptionLimit,
        maxActivities: 1,
        previousMessages: previousMessages,
        feedback: feedback
      })
      
      if (aiRefinedResults && aiRefinedResults.length > 0) {
        const result = aiRefinedResults[0]
        setAiRefined(result)
        
        // Update form values with AI results
        resultsForm.setValue("activityTitle", result.title)
        if (result.organization) {
          resultsForm.setValue("organizationName", result.organization)
        }
        resultsForm.setValue("refinedActivityDescription", result.description)
        
        // Add AI response to conversation
        setConversation(prev => [
          ...prev,
          {
            type: 'assistant',
            content: `Title: ${result.title}\n${result.organization ? `Organization: ${result.organization}\n` : ''}Description: ${result.description}`,
            refinedActivity: result,
            timestamp: new Date()
          }
        ])
      } else {
        throw new Error("AI did not return any results")
      }
    } catch (error) {
      console.error("AI regeneration error:", error)
      setAiError(error instanceof Error ? error.message : "Failed to process feedback with AI.")
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleAppTypeChange = (value: string) => {
    setSelectedAppType(value)
    form.setValue("applicationType", value)
  }

  const currentAppType = applicationTypes.find(type => type.id === selectedAppType)
  const hasApiKey = typeof window !== 'undefined' && localStorage.getItem('ai_api_key')

  return (
    <div className="w-full mx-auto h-full overflow-hidden">
      {isInitialView ? (
        <InitialForm
          form={form}
          applicationTypes={applicationTypes}
          currentAppType={currentAppType}
          hasApiKey={!!hasApiKey}
          isAiProcessing={isAiProcessing}
          handleAppTypeChange={handleAppTypeChange}
          onSubmit={onSubmit}
        />
      ) : (
        <ResultsForm
          form={resultsForm}
          currentAppType={currentAppType}
          aiResponse={aiRefined}
          handleBackToForm={resetToInitialView}
          error={aiError}
          isAiProcessing={isAiProcessing}
          onFeedbackSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  )
}
