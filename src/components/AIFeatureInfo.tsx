"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export function AIFeatureInfo() {
  return (
    <Alert className="bg-primary/5 border-primary/20">
      <InfoIcon className="h-4 w-4 text-primary" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">AI Activity Enhancement</p>
          <p>
            The AI enhancement feature uses OpenAI's API to improve your activity descriptions.
            Enable it to make your activities more impactful for college applications.
          </p>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="privacy">
              <AccordionTrigger className="text-sm">Privacy Information</AccordionTrigger>
              <AccordionContent className="text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your API key is stored only in your browser's local storage</li>
                  <li>Your activity data is sent directly from your browser to OpenAI</li>
                  <li>Our app never stores your activities or API key on our servers</li>
                  <li>You can remove your API key at any time from the settings</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how-it-works">
              <AccordionTrigger className="text-sm">How It Works</AccordionTrigger>
              <AccordionContent className="text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>The AI analyzes each activity for impact, clarity, and effectiveness</li>
                  <li>It rewrites descriptions to be concise and impactful</li>
                  <li>It ensures each activity stays within character limits</li>
                  <li>It highlights leadership roles and quantifiable achievements</li>
                  <li>It maintains your authentic voice while improving expression</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="tips">
              <AccordionTrigger className="text-sm">Tips for Best Results</AccordionTrigger>
              <AccordionContent className="text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Include specific details about your role and contributions</li>
                  <li>Mention any leadership positions or responsibilities</li>
                  <li>Include numbers when possible (hours committed, people impacted, etc.)</li>
                  <li>Always review the AI suggestions and ensure they're accurate</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </AlertDescription>
    </Alert>
  )
}
