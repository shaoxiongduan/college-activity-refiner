"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ActivityExample, getAllExamples, addExample, removeExample, resetExamples } from "@/lib/activity-examples"
import { Check, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

const applicationTypes = [
  "Common Application",
  "University of California",
  "Coalition Application",
  "ApplyTexas",
];

export default function ExamplesPage() {
  const [examples, setExamples] = useState<ActivityExample[]>([]);
  const [originalActivity, setOriginalActivity] = useState("");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [applicationType, setApplicationType] = useState(applicationTypes[0]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Character limits based on application type
  const getTitleLimit = () => {
    if (applicationType === "Common Application") return 50;
    if (applicationType === "University of California") return 60;
    if (applicationType === "Coalition Application") return 64;
    if (applicationType === "ApplyTexas") return 40;
    return 50;
  };

  const getOrgLimit = () => {
    if (applicationType === "Common Application") return 100;
    if (applicationType === "University of California") return 0;
    if (applicationType === "Coalition Application") return 100;
    if (applicationType === "ApplyTexas") return 60;
    return 100;
  };

  const getDescriptionLimit = () => {
    if (applicationType === "Common Application") return 150;
    if (applicationType === "University of California") return 350;
    if (applicationType === "Coalition Application") return 255;
    if (applicationType === "ApplyTexas") return 240;
    return 150;
  };

  useEffect(() => {
    // Load examples when the component mounts
    setExamples(getAllExamples());
  }, []);

  const handleAddExample = () => {
    if (!originalActivity || !title || !description) {
      setMessage({ 
        type: "error", 
        text: "Please provide the original activity, title, and description" 
      });
      return;
    }

    // Check character limits
    const titleLimit = getTitleLimit();
    const orgLimit = getOrgLimit();
    const descLimit = getDescriptionLimit();

    if (title.length > titleLimit) {
      setMessage({
        type: "error",
        text: `Title exceeds the ${titleLimit} character limit for ${applicationType}`
      });
      return;
    }

    if (orgLimit > 0 && organization.length > orgLimit) {
      setMessage({
        type: "error",
        text: `Organization exceeds the ${orgLimit} character limit for ${applicationType}`
      });
      return;
    }

    if (description.length > descLimit) {
      setMessage({
        type: "error",
        text: `Description exceeds the ${descLimit} character limit for ${applicationType}`
      });
      return;
    }

    const newExample: ActivityExample = {
      original: originalActivity,
      title,
      ...(getOrgLimit() > 0 ? { organization } : {}),
      description,
      applicationType,
    };

    // Add to the examples array
    addExample(newExample);
    
    // Update the local state
    setExamples(getAllExamples());
    
    // Clear the form
    setOriginalActivity("");
    setTitle("");
    setOrganization("");
    setDescription("");
    
    // Show success message
    setMessage({ 
      type: "success", 
      text: "Example added successfully! These examples will be used to help the AI refine activities." 
    });

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleDeleteExample = (index: number) => {
    removeExample(index);
    setExamples(getAllExamples());
    
    // Show success message
    setMessage({ 
      type: "success", 
      text: "Example deleted successfully!" 
    });

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleResetExamples = () => {
    resetExamples();
    setExamples(getAllExamples());
    
    // Show success message
    setMessage({ 
      type: "success", 
      text: "Examples have been reset to defaults!" 
    });

    // Clear message after 3 seconds
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };
  
  // Function to format character count display
  const formatCharCount = (text: string, limit: number) => {
    return `${text.length}/${limit}${text.length > limit ? " [OVER LIMIT]" : ""}`
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">AI Learning Examples</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetExamples}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Link href="/">
            <Button>Back to Refiner</Button>
          </Link>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Example</CardTitle>
          <CardDescription>
            Add examples to help the AI understand how to refine activities. These examples will be used to enhance the AI's prompts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message.text && (
            <Alert variant={message.type === "error" ? "destructive" : "default"}>
              {message.type === "success" && <Check className="h-4 w-4" />}
              <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="app-type">Application Type</Label>
            <Select 
              value={applicationType} 
              onValueChange={setApplicationType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select application type" />
              </SelectTrigger>
              <SelectContent>
                {applicationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground">
              Title: {getTitleLimit()} characters | 
              {getOrgLimit() > 0 ? ` Organization: ${getOrgLimit()} characters |` : ''} 
              Description: {getDescriptionLimit()} characters
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="original">Original Activity</Label>
            <Textarea
              id="original"
              placeholder="Enter the original activity description"
              value={originalActivity}
              onChange={(e) => setOriginalActivity(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground">
              This is the raw input that the user would provide, before any refinement.
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title/Position</Label>
            <Input
              id="title"
              placeholder="Enter the refined title or position"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              Characters: {formatCharCount(title, getTitleLimit())}
            </div>
          </div>
          
          {getOrgLimit() > 0 && (
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Enter the organization name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Characters: {formatCharCount(organization, getOrgLimit())}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter the refined activity description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground">
              Characters: {formatCharCount(description, getDescriptionLimit())}
            </div>
          </div>
          
          <Button onClick={handleAddExample}>Add Example</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Examples</CardTitle>
          <CardDescription>
            These examples are used to enhance the AI's understanding of how to refine activities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {examples.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No examples added yet.
            </div>
          ) : (
            <div className="space-y-6">
              {examples.map((example, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="font-medium">Example {index + 1}</div>
                    <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                      {example.applicationType}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Original Input:</div>
                    <div className="border-l-2 pl-3 py-1">{example.original}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Title/Position:</div>
                      <div className="border-l-2 border-primary pl-3 py-1">{example.title}</div>
                    </div>
                    
                    {example.organization && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Organization:</div>
                        <div className="border-l-2 border-primary pl-3 py-1">{example.organization}</div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Description:</div>
                    <div className="border-l-2 border-primary pl-3 py-1">{example.description}</div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteExample(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 