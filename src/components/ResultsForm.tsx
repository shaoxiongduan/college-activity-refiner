"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useRef } from "react"
import { ChevronDown, ChevronUp, AlertTriangle, Loader2, Send, Check, Copy, Scissors, Focus } from "lucide-react"
import Link from "next/link"
import CharacterCount from "./CharacterCount"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { refineActivities } from "@/lib/ai-service"
import { ThemeToggle } from "./ThemeToggle"

const feedbackSchema = z.object({
  feedback: z.string().min(1, {
    message: "Please enter your feedback",
  }),
})

interface ResultsFormProps {
  form: UseFormReturn<{
    activityTitle: string;
    organizationName: string;
    refinedActivityDescription: string;
    activityText: string;
  }>;
  currentAppType: {
    id: string;
    name: string;
    titleLimit: number;
    organizationLimit: number;
    descriptionLimit: number;
    maxActivities: number;
    description: string;
  } | undefined;
  aiResponse: {
    title?: string;
    organization?: string;
    description?: string;
    evaluation?: string;
    keyPoints?: string[];
  } | null;
  handleBackToForm: () => void;
  error: string | null;
  isAiProcessing: boolean;
  onFeedbackSubmit?: (values: { feedback: string }) => void;
}

export function ResultsForm({
  form,
  currentAppType,
  aiResponse,
  handleBackToForm,
  error,
  isAiProcessing,
  onFeedbackSubmit
}: ResultsFormProps) {
  const [evaluationOpen, setEvaluationOpen] = useState(true);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedOrg, setCopiedOrg] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [processingTextAction, setProcessingTextAction] = useState(false);
  const [textActionType, setTextActionType] = useState<'emphasize' | 'concise' | null>(null);
  
  // New state variables to track selected text
  const [selectedOriginalText, setSelectedOriginalText] = useState("");
  const [selectedRefinedText, setSelectedRefinedText] = useState("");
  
  // Add refs for the containers
  const originalDraftRef = useRef<HTMLDivElement>(null);
  const refinedDescriptionRef = useRef<HTMLDivElement>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement>(null);

  const feedbackForm = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: "",
    },
  });

  // Copy text to clipboard function
  const copyToClipboard = (text: string, field: 'title' | 'org' | 'desc') => {
    navigator.clipboard.writeText(text).then(() => {
      // Set the appropriate copied state
      if (field === 'title') setCopiedTitle(true);
      if (field === 'org') setCopiedOrg(true);
      if (field === 'desc') setCopiedDesc(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        if (field === 'title') setCopiedTitle(false);
        if (field === 'org') setCopiedOrg(false);
        if (field === 'desc') setCopiedDesc(false);
      }, 2000);
    });
  };

  const handleFeedbackSubmit = (values: z.infer<typeof feedbackSchema>) => {
    if (onFeedbackSubmit) {
      onFeedbackSubmit(values);
      feedbackForm.reset();
    }
  };

  // Handle emphasizing selected text in the refined description
  const handleEmphasize = async (selectedText: string) => {
    if (!currentAppType || processingTextAction) return;
    
    try {
      setProcessingTextAction(true);
      setTextActionType('emphasize');
      
      const feedback = `Please emphasize this part from my original draft in the refined description: "${selectedText}". Make it stand out more in the refined description while maintaining the character limits.`;
      
      console.log("\n====== EMPHASIZE TEXT REQUEST ======");
      console.log("Selected text to emphasize:");
      console.log(selectedText);
      console.log("Feedback sent to AI:");
      console.log(feedback);
      
      const originalText = form.getValues().activityText;
      
      // Create minimal API options for this specific task
      const aiRefinedResults = await refineActivities({
        activities: [originalText],
        applicationType: currentAppType.name,
        titleLimit: currentAppType.titleLimit,
        organizationLimit: currentAppType.organizationLimit,
        descriptionLimit: currentAppType.descriptionLimit,
        maxActivities: 1,
        feedback: feedback
      });
      
      if (aiRefinedResults && aiRefinedResults.length > 0) {
        const result = aiRefinedResults[0];
        
        // Update form values with new AI results
        form.setValue("activityTitle", result.title);
        if (result.organization) {
          form.setValue("organizationName", result.organization);
        }
        form.setValue("refinedActivityDescription", result.description);
        
        console.log("✅ Text emphasized successfully");
      }
    } catch (error) {
      console.error("Failed to emphasize text:", error);
    } finally {
      setProcessingTextAction(false);
      setTextActionType(null);
    }
  };
  
  // Handle making selected text more concise
  const handleMakeConcise = async (selectedText: string) => {
    if (!currentAppType || processingTextAction) return;
    
    try {
      setProcessingTextAction(true);
      setTextActionType('concise');
      
      const refinedDescription = form.getValues().refinedActivityDescription;
      
      if (!refinedDescription.includes(selectedText)) {
        console.error("Selected text not found in refined description");
        return;
      }
      
      const feedback = `Please make this part of the description more concise: "${selectedText}". Rewrite it to be shorter while keeping the important information.`;
      
      console.log("\n====== MAKE TEXT CONCISE REQUEST ======");
      console.log("Selected text to make concise:");
      console.log(selectedText);
      console.log("Feedback sent to AI:");
      console.log(feedback);
      
      const originalText = form.getValues().activityText;
      
      // Create minimal API options for this specific task
      const aiRefinedResults = await refineActivities({
        activities: [originalText],
        applicationType: currentAppType.name,
        titleLimit: currentAppType.titleLimit,
        organizationLimit: currentAppType.organizationLimit,
        descriptionLimit: currentAppType.descriptionLimit,
        maxActivities: 1,
        feedback: feedback
      });
      
      if (aiRefinedResults && aiRefinedResults.length > 0) {
        const result = aiRefinedResults[0];
        
        // Update form values with new AI results
        form.setValue("activityTitle", result.title);
        if (result.organization) {
          form.setValue("organizationName", result.organization);
        }
        form.setValue("refinedActivityDescription", result.description);
        
        console.log("✅ Text made more concise successfully");
      }
    } catch (error) {
      console.error("Failed to make text concise:", error);
    } finally {
      setProcessingTextAction(false);
      setTextActionType(null);
    }
  };

  // Handle text selection in the original draft
  const handleOriginalTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      setSelectedOriginalText("");
      return;
    }

    // Check if the selection is within our container
    if (!originalDraftRef.current) {
      return;
    }

    // Get the selected text
    const selText = selection.toString().trim();
    
    // Check if the selection is within our container
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    // Check if the selection container is within our target container
    const isStartNodeInContainer = originalDraftRef.current.contains(startContainer);
    const isEndNodeInContainer = originalDraftRef.current.contains(endContainer);
    
    // The selection is in our container if either start or end is in container
    if (isStartNodeInContainer || isEndNodeInContainer) {
      console.log("Text selected in original draft:", selText);
      setSelectedOriginalText(selText);
    }
  };

  // Handle text selection in the description textarea
  const handleDescriptionSelect = () => {
    if (descTextareaRef.current) {
      const textarea = descTextareaRef.current;
      const selectionStart = textarea.selectionStart;
      const selectionEnd = textarea.selectionEnd;
      
      if (selectionStart !== selectionEnd) {
        const selectedText = textarea.value.substring(selectionStart, selectionEnd);
        if (selectedText.trim().length > 0) {
          setSelectedRefinedText(selectedText);
          console.log("Text selected in refined description:", selectedText);
          return;
        }
      }
    }
    
    setSelectedRefinedText("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Refinement Results</h2>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={handleBackToForm} variant="outline">
            Back to Input
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left column - Original draft & Feedback */}
        <div className="w-1/3 border-r flex flex-col overflow-hidden">
          {/* Fixed header */}
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-900">
            <h3 className="font-semibold">Original Draft</h3>
          </div>
          
          {/* Scrollable area for original draft */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <div 
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded" 
                ref={originalDraftRef}
                onMouseUp={handleOriginalTextSelection}
              >
                <p className="whitespace-pre-wrap">{form.getValues().activityText}</p>
              </div>
            </div>
          </div>
          
          {/* Fixed feedback form at bottom - always visible */}
          {onFeedbackSubmit && (
            <div className="border-t p-4 bg-card">
              <h3 className="text-base font-semibold mb-3">Provide Feedback</h3>
              
              {/* Text action buttons */}
              {!isAiProcessing && !processingTextAction && (
                <>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select text in the original draft to emphasize it, or select text in the refined description to make it more concise.
                  </p>
                  <div className="flex space-x-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!selectedOriginalText}
                      onClick={() => handleEmphasize(selectedOriginalText)}
                      className="flex-1"
                    >
                      <Focus className="h-4 w-4 mr-1" />
                      Emphasize Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!selectedRefinedText}
                      onClick={() => handleMakeConcise(selectedRefinedText)}
                      className="flex-1"
                    >
                      <Scissors className="h-4 w-4 mr-1" />
                      Make Concise
                    </Button>
                  </div>
                </>
              )}
              
              <Form {...feedbackForm}>
                <form onSubmit={feedbackForm.handleSubmit(handleFeedbackSubmit)} className="space-y-4">
                  <FormField
                    control={feedbackForm.control}
                    name="feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Tell the AI how to improve the activity refinement..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isAiProcessing || processingTextAction || !feedbackForm.getValues().feedback?.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isAiProcessing || processingTextAction ? "Processing..." : "Send Feedback"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>

        {/* Right column - AI evaluation and refined content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Fixed header */}
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-900">
            <h3 className="font-semibold">AI Analysis & Enhanced Activity</h3>
          </div>
          
          {isAiProcessing || processingTextAction ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-lg">
                  {processingTextAction 
                    ? textActionType === 'emphasize' 
                      ? "Emphasizing selected text..." 
                      : "Making text more concise..."
                    : "Processing with AI..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-6">
                {/* AI Evaluation section */}
                {aiResponse?.evaluation && (
                  <div className="mb-4">
                    <Collapsible
                      open={evaluationOpen}
                      onOpenChange={setEvaluationOpen}
                      className="border rounded-md"
                    >
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-t-md">
                        <h4 className="font-medium">AI Evaluation</h4>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            {evaluationOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="p-3 bg-blue-50/50 dark:bg-blue-900/10">
                        <p className="whitespace-pre-wrap mb-4">{aiResponse.evaluation}</p>
                        
                        {aiResponse.keyPoints && aiResponse.keyPoints.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Key Points Identified:</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {aiResponse.keyPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                )}

                <h4 className="font-semibold text-lg mb-2">Refined Activity</h4>
                
                {/* Activity Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">
                      Activity Title
                      {currentAppType && (
                        <CharacterCount
                          value={form.getValues().activityTitle}
                          limit={currentAppType.titleLimit}
                        />
                      )}
                    </h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => copyToClipboard(form.getValues().activityTitle, 'title')}
                          >
                            {copiedTitle ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedTitle ? "Copied!" : "Copy title"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="p-3 bg-background rounded border">
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="activityTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} className="text-base border-0 p-0 focus-visible:ring-0" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </Form>
                  </div>
                </div>

                {/* Organization Name (if applicable) */}
                {currentAppType?.organizationLimit !== 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">
                        Organization Name
                        {currentAppType && (
                          <CharacterCount
                            value={form.getValues().organizationName}
                            limit={currentAppType.organizationLimit}
                          />
                        )}
                      </h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => copyToClipboard(form.getValues().organizationName, 'org')}
                            >
                              {copiedOrg ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{copiedOrg ? "Copied!" : "Copy organization"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="p-3 bg-background rounded border">
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name="organizationName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} className="text-base border-0 p-0 focus-visible:ring-0" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </Form>
                    </div>
                  </div>
                )}

                {/* Refined Activity Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">
                      Refined Description
                      {currentAppType && (
                        <CharacterCount
                          value={form.getValues().refinedActivityDescription}
                          limit={currentAppType.descriptionLimit}
                        />
                      )}
                    </h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => copyToClipboard(form.getValues().refinedActivityDescription, 'desc')}
                          >
                            {copiedDesc ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{copiedDesc ? "Copied!" : "Copy description"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded" ref={refinedDescriptionRef}>
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="refinedActivityDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                ref={(e) => {
                                  field.ref(e);
                                  if (e) {
                                    (descTextareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = e;
                                  }
                                }}
                                className="min-h-[300px] text-base bg-transparent border-0 p-0 focus-visible:ring-0" 
                                onSelect={handleDescriptionSelect}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 