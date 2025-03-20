"use client"

// This is a client-side utility that manages the AI API requests
// We're implementing it this way to keep the user's API key secure by having their browser make the requests directly

import { getExamplesForAppType, ActivityExample } from './activity-examples';

// Define a message interface for conversation history
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIRefineActivitiesOptions {
  activities: string[]
  applicationType: string
  titleLimit: number
  organizationLimit: number
  descriptionLimit: number
  maxActivities: number
  previousMessages?: Message[]
  feedback?: string
}

interface AIRefinedActivity {
  title: string;
  organization?: string;
  description: string;
  evaluation: string;
  keyPoints: string[];
}

export async function refineActivities(options: AIRefineActivitiesOptions): Promise<AIRefinedActivity[]> {
  const { 
    activities, 
    applicationType, 
    titleLimit, 
    organizationLimit, 
    descriptionLimit, 
    maxActivities,
    previousMessages,
    feedback 
  } = options

  // Get the API key and URL from local storage
  const apiKey = localStorage.getItem('ai_api_key')
  const apiUrl = localStorage.getItem('ai_api_url') || 'https://api.openai.com/v1/chat/completions'

  if (!apiKey) {
    throw new Error('API key not found. Please add your API key in the settings.')
  }

  // Get relevant examples for this application type
  const examples = getExamplesForAppType(applicationType);
  
  // Create examples section for the prompt
  let examplesText = '';
  if (examples.length > 0) {
    // Use up to 3 examples to keep the prompt concise
    const limitedExamples = examples.slice(0, 3);
    
    examplesText = `\nHere are some examples of how to effectively refine activities:\n\n`;
    
    limitedExamples.forEach((example, index) => {
      examplesText += `Example ${index + 1}:\n`;
      examplesText += `Original: "${example.original}"\n`;
      examplesText += `Title: "${example.title}"\n`;
      if (organizationLimit > 0 && example.organization) {
        examplesText += `Organization: "${example.organization}"\n`;
      }
      examplesText += `Description: "${example.description}"\n\n`;
    });
  }

  // Create a system prompt that includes specific instructions for refining activities
  const systemPrompt = `You are an expert college application advisor specializing in helping students write compelling activity descriptions for their college applications.

Your task is to evaluate and refine the activity description provided by the student, making it more impactful, concise, and aligned with what college admissions officers look for.

First, evaluate the activity description critically, noting strengths and areas for improvement.
Second, identify key points and achievements that should be emphasized.
Finally, transform it into a compelling title and description.

${feedback ? `The student has provided feedback on your previous refinement. Please address their feedback in your new refinement.` : ''}

Important guidelines:
- Format: ${applicationType} application with the following limits:
  - Title/Position: ${titleLimit} characters maximum
  ${organizationLimit > 0 ? `- Organization Name: ${organizationLimit} characters maximum` : ''}
  - Description: ${descriptionLimit} characters maximum
- Focus on specific contributions, leadership, and impact
- Use strong action verbs
- Include quantifiable results when available
- Remove unnecessary words and focus on impact
- Maintain the student's voice and authenticity
- Utilize available character space across all sections strategically to maximize activity description impact
- Ensure each component stays UNDER its character limit
- Preserve the core meaning and facts of the activity

${examplesText}
Respond in the following JSON format only:
{
  "evaluation": "Your critical evaluation of the activity description, noting strengths and areas for improvement",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", ...],
  "title": "Your refined title here",
  ${organizationLimit > 0 ? `"organization": "Your organization name here",` : ''}
  "description": "Your refined description here"
}
Do not include any additional commentary.`

  try {
    // Determine if we're using OpenAI API or another API
    const isOpenAI = apiUrl.includes('openai.com')
    const isAiskT = apiUrl.includes('aiskt.com')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Set the appropriate authorization header based on the API
    if (isOpenAI) {
      headers['Authorization'] = `Bearer ${apiKey}`
    } else if (isAiskT) {
      // For pro.aiskt.com API
      headers['Authorization'] = `Bearer ${apiKey}`
      // If the API key doesn't start with 'sk-', don't modify it
    } else {
      // For other APIs, use standard Bearer token
      headers['Authorization'] = `Bearer ${apiKey}`
    }
    
    // Prepare messages for the API request
    const messages: Message[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    // Add conversation history if available
    if (previousMessages && previousMessages.length > 0 && feedback) {
      // Add previous messages to provide context
      messages.push(...previousMessages);
      
      // Add feedback as the latest user message
      messages.push({
        role: 'user',
        content: `Here's my feedback on your refinement: ${feedback}`
      });
    } else {
      // If no previous conversation or no feedback, just add the original activity
      messages.push({
        role: 'user',
        content: 'Here is my activity to refine:\n\n' + activities[0]
      });
    }
    
    const requestBody = {
      model: 'gpt-4-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: (titleLimit + organizationLimit + descriptionLimit) * 3, // Increased token limit for evaluation
    }
    
    // Enhanced logging with timestamps and better formatting
    console.log(`\n====== AI REQUEST [${new Date().toISOString()}] ======`);
    console.log('📡 API URL:', apiUrl);
    console.log('🔑 Using API key:', apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4));
    console.log('📝 System Prompt:');
    console.log(systemPrompt);
    console.log('💬 Messages:');
    messages.forEach((msg, index) => {
      console.log(`  [${index}] ${msg.role}:`);
      console.log(msg.content);
    });
    console.log('⚙️ Configuration:', {
      model: requestBody.model,
      temperature: requestBody.temperature,
      max_tokens: requestBody.max_tokens
    });
    
    // Record start time for response time calculation
    const startTime = Date.now();
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    // Calculate response time
    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'API request failed'
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error?.message || errorData.message || errorData.error || errorText
      } catch (e) {
        // If not JSON, use the raw text
        errorMessage = errorText
      }
      
      console.error(`\n❌ API ERROR [${new Date().toISOString()}]:`, errorText)
      console.error(`⏱️ Response Time: ${responseTime}ms`);
      throw new Error(`API Error: ${errorMessage}`)
    }

    const data = await response.json()
    console.log(`\n====== AI RESPONSE [${new Date().toISOString()}] ======`);
    console.log('✅ Response Status:', response.status);
    console.log('⏱️ Response Time:', `${responseTime}ms`);
    console.log('📊 Usage:', data.usage);
    console.log('💬 Content:');
    console.log(data.choices[0].message.content);

    // Parse the response
    const refinedText = data.choices[0].message.content.trim()
    
    try {
      // Try to parse the JSON response
      const refinedActivity = JSON.parse(refinedText) as AIRefinedActivity;
      
      // Validate that the required fields are present
      if (!refinedActivity.title || !refinedActivity.description || !refinedActivity.evaluation || !refinedActivity.keyPoints) {
        throw new Error('AI response missing required fields (title, description, evaluation, or keyPoints)');
      }
      
      // Return as an array with a single activity for consistency with existing code
      return [refinedActivity];
    } catch (e) {
      console.error('\n====== JSON PARSE ERROR ======');
      console.error('Failed to parse AI response as JSON:', e);
      console.error('Raw response:');
      console.error(refinedText);
      
      // Fallback: try to extract data with regex as a last resort
      try {
        console.log('\n====== ATTEMPTING REGEX FALLBACK ======');
        
        const title = refinedText.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || 'Title extraction failed';
        const description = refinedText.match(/"description"\s*:\s*"([^"]+)"/)?.[1] || 'Description extraction failed';
        const organization = organizationLimit > 0 ? 
          (refinedText.match(/"organization"\s*:\s*"([^"]+)"/)?.[1] || '') : undefined;
        const evaluation = refinedText.match(/"evaluation"\s*:\s*"([^"]+)"/)?.[1] || 'Evaluation extraction failed';
        
        // Extract key points more safely
        const keyPointsMatch = refinedText.match(/"keyPoints"\s*:\s*\[([\s\S]*?)\]/);
        const keyPointsString = keyPointsMatch ? keyPointsMatch[1] : '';
        const keyPoints = keyPointsString 
          ? keyPointsString.split(',')
              .map((point: string) => point.trim().replace(/^"|"$/g, ''))
              .filter((point: string) => point.length > 0)
          : ['Key points extraction failed'];
        
        console.log('Fallback extraction results:');
        console.log({
          title,
          organization,
          description,
          evaluation,
          keyPoints
        });
        
        return [{
          title,
          ...(organization ? { organization } : {}),
          description,
          evaluation,
          keyPoints: keyPoints.length > 0 ? keyPoints : ['Key points extraction failed']
        }];
      } catch (regexError) {
        console.error('\n====== REGEX FALLBACK FAILED ======');
        console.error('Regex fallback also failed:', regexError);
        // Last resort fallback
        return [{
          title: 'Could not parse response',
          description: 'The AI response could not be properly parsed. Please try again.',
          evaluation: 'Processing error occurred',
          keyPoints: ['Error processing response']
        }];
      }
    }
  } catch (error) {
    console.error('AI refinement error:', error)
    throw error
  }
}
