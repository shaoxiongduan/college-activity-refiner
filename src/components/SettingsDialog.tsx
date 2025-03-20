"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsDialog() {
  const [apiKey, setApiKey] = useState("")
  const [apiUrl, setApiUrl] = useState("https://api.openai.com/v1/chat/completions")
  const [apiProvider, setApiProvider] = useState("openai")
  const [isSaved, setIsSaved] = useState(false)

  // Load API key and URL from localStorage when component mounts
  useEffect(() => {
    const savedKey = localStorage.getItem("ai_api_key")
    const savedUrl = localStorage.getItem("ai_api_url")
    
    if (savedKey) {
      setApiKey(savedKey)
      setIsSaved(true)
    }
    
    if (savedUrl) {
      setApiUrl(savedUrl)
      
      // Determine the provider based on the URL
      if (savedUrl.includes('openai.com')) {
        setApiProvider('openai')
      } else if (savedUrl.includes('aiskt.com')) {
        setApiProvider('aiskt')
      } else {
        setApiProvider('custom')
      }
    }
  }, [])

  const handleProviderChange = (value: string) => {
    setApiProvider(value)
    
    // Update the API URL based on the selected provider
    if (value === 'openai') {
      setApiUrl('https://api.openai.com/v1/chat/completions')
    } else if (value === 'aiskt') {
      setApiUrl('https://pro.aiskt.com/v1/chat/completions')
    }
    // For custom, keep the current URL
  }

  const handleSaveSettings = () => {
    localStorage.setItem("ai_api_key", apiKey)
    localStorage.setItem("ai_api_url", apiUrl)
    setIsSaved(true)
  }

  const handleClearSettings = () => {
    localStorage.removeItem("ai_api_key")
    localStorage.removeItem("ai_api_url")
    setApiKey("")
    setApiUrl("https://api.openai.com/v1/chat/completions")
    setApiProvider("openai")
    setIsSaved(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Settings</DialogTitle>
          <DialogDescription>
            Configure your AI settings to use the AI refinement feature.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-provider" className="col-span-4">
              API Provider
            </Label>
            <Select value={apiProvider} onValueChange={handleProviderChange}>
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Select API provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="aiskt">pro.aiskt.com</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-url" className="col-span-4">
              API URL
            </Label>
            <Input
              id="api-url"
              type="text"
              placeholder="https://api.openai.com/v1/chat/completions"
              className="col-span-4"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              disabled={apiProvider !== 'custom'}
            />
            <div className="col-span-4 text-sm text-muted-foreground">
              {apiProvider === 'custom' ? 
                "Enter the API URL for your custom AI service." : 
                `Using the ${apiProvider === 'openai' ? 'OpenAI' : 'pro.aiskt.com'} API endpoint.`}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="col-span-4">
              API Key
            </Label>
            <Input
              id="api-key"
              type="password"
              placeholder={apiProvider === 'openai' ? "sk-..." : "Enter your API key..."}
              className="col-span-4"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <div className="col-span-4 text-sm text-muted-foreground">
              {apiProvider === 'openai' ? 
                "Enter your OpenAI API key (starts with 'sk-')." : 
                apiProvider === 'aiskt' ? 
                "Enter your pro.aiskt.com API key." : 
                "Enter the API key for your custom service."}
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full justify-between">
            {isSaved && (
              <Button variant="outline" onClick={handleClearSettings}>
                Reset
              </Button>
            )}
            <div className="flex-grow"></div>
            <Button type="submit" onClick={handleSaveSettings}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
