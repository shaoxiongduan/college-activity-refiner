/**
 * This file contains example activities and their refined versions.
 * These examples can be used to help the AI understand how to refine activities
 * for different application types.
 * 
 * You can add your own examples to this file to help improve the AI's performance.
 */

interface ActivityExample {
  original: string;
  title: string;
  organization?: string;
  description: string;
  applicationType: string;
}

// Initial examples
const defaultExamples: ActivityExample[] = [
  {
    original: "Member of the debate team for 3 years where I participated in regional competitions and helped organize practice sessions for newer members",
    title: "Debate Team Member",
    organization: "Lincoln High School Debate Team",
    description: "3-year member; competed in 5 regional tournaments; organized bi-weekly practice sessions for 12 new members; helped team achieve first regional championship in school history",
    applicationType: "Common Application",
  },
  {
    original: "I volunteered at the local animal shelter walking dogs and cleaning cages. I also helped with adoption events on weekends.",
    title: "Animal Shelter Volunteer",
    organization: "Cityville Animal Shelter",
    description: "Dedicated 150+ hours walking 20+ dogs weekly; maintained sanitary living conditions; facilitated 15 weekend adoption events resulting in 30+ successful animal placements",
    applicationType: "Common Application",
  },
  {
    original: "President of the Environmental Club at school where we did recycling drives and awareness campaigns about climate change",
    title: "Environmental Club President",
    organization: "Westside High Environmental Club",
    description: "Launched school-wide recycling program collecting 500+ lbs materials annually; organized climate awareness campaign reaching 1,200+ students; secured $2,000 grant",
    applicationType: "Common Application",
  },
  {
    original: "I worked as a summer camp counselor for two years where I supervised a group of 10 children ages 8-12 and planned daily activities and field trips.",
    title: "Co-founder & Mentor",
    organization: "Worldwide-Entre-Bators (WEB)-A HSEntrepreneurship Community (with 1000+ mbrs in China and the U.S.)",
    description: "Cultivate teenagers' ENTR abilities by sharing knowledge & resourcesincubated 14 student-led startups, Use social media to promote ideaexchanges",
    applicationType: "Common Application",
  },
];

// This is the actual array that will hold the examples
let activityExamples: ActivityExample[] = [...defaultExamples];

// Load examples from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const savedExamples = localStorage.getItem('activity_examples');
    if (savedExamples) {
      activityExamples = JSON.parse(savedExamples);
    }
  } catch (error) {
    console.error('Failed to load examples from localStorage:', error);
  }
}

/**
 * Save the current examples to localStorage
 */
function saveExamplesToStorage() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('activity_examples', JSON.stringify(activityExamples));
    } catch (error) {
      console.error('Failed to save examples to localStorage:', error);
    }
  }
}

/**
 * Get examples for a specific application type
 * @param applicationType The type of application to get examples for
 * @returns Array of matching examples
 */
export function getExamplesForAppType(applicationType: string): ActivityExample[] {
  return activityExamples.filter(example => 
    example.applicationType.toLowerCase() === applicationType.toLowerCase()
  );
}

/**
 * Get all examples
 * @returns All activity examples
 */
export function getAllExamples(): ActivityExample[] {
  return activityExamples;
}

/**
 * Add a new example
 * @param example The example to add
 */
export function addExample(example: ActivityExample): void {
  activityExamples.push(example);
  saveExamplesToStorage();
}

/**
 * Remove an example at the specified index
 * @param index The index of the example to remove
 */
export function removeExample(index: number): void {
  if (index >= 0 && index < activityExamples.length) {
    activityExamples.splice(index, 1);
    saveExamplesToStorage();
  }
}

/**
 * Reset examples to the default set
 */
export function resetExamples(): void {
  activityExamples = [...defaultExamples];
  saveExamplesToStorage();
}

export type { ActivityExample }; 