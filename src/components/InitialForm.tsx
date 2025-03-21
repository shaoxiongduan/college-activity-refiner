"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Database, AlertCircle } from "lucide-react"
import { SettingsDialog } from "./SettingsDialog"
import { ThemeToggle } from "./ThemeToggle"
import { UseFormReturn } from "react-hook-form"
import * as z from "zod"

// Define the schema to match what's used in ActivityRefinerForm
const formSchema = z.object({
  applicationType: z.string(),
  activityText: z.string(),
});

// Create a type from the schema
type FormValues = z.infer<typeof formSchema>;

interface InitialFormProps {
  form: UseFormReturn<{
    applicationType: string;
    activityText: string;
  }>;
  applicationTypes: {
    id: string;
    name: string;
    titleLimit: number;
    organizationLimit: number;
    descriptionLimit: number;
    maxActivities: number;
    description: string;
  }[];
  currentAppType: {
    id: string;
    name: string;
    titleLimit: number;
    organizationLimit: number;
    descriptionLimit: number;
    maxActivities: number;
    description: string;
  } | undefined;
  hasApiKey: boolean;
  isAiProcessing: boolean;
  handleAppTypeChange: (value: string) => void;
  onSubmit: (values: FormValues) => void;
}

export function InitialForm({
  form,
  applicationTypes,
  currentAppType,
  hasApiKey,
  isAiProcessing,
  handleAppTypeChange,
  onSubmit
}: InitialFormProps) {
  return (
    <div className="max-w-4xl mx-auto py-4 px-4">
      <Card className="shadow-lg mb-8">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div>
            <CardTitle className="text-2xl">College Application Activity Refiner</CardTitle>
            <CardDescription>
              Transform your rough draft into a polished activity description
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/examples">
              <Button variant="outline" size="icon" title="Manage AI Examples">
                <Database className="h-4 w-4" />
                <span className="sr-only">Manage AI Examples</span>
              </Button>
            </Link>
            <SettingsDialog />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="applicationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Application Type</FormLabel>
                    <Select onValueChange={handleAppTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select application type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {applicationTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentAppType && (
                      <FormDescription>
                        {currentAppType.description}
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Your Activity (Rough Draft)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your activity description here..."
                        className="min-h-[300px] text-base resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a single activity description. The AI will evaluate your input, identify key points, generate a title and create a refined description.
                    </FormDescription>
                  </FormItem>
                )}
              />

              {!hasApiKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>API Key Required for AI Enhancement</AlertTitle>
                  <AlertDescription>
                    Please add your API key in the settings to use AI features. You can use keys from OpenAI or pro.aiskt.com.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isAiProcessing}
              >
                {isAiProcessing ? "Processing with AI..." : "Refine Activity with AI"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 