import { GoogleGenAI, Type } from '@google/genai';
import { Category, Priority, Status } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    // Try both process.env (Node/AI Studio) and import.meta.env (Vite standard)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null);
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY or VITE_GEMINI_API_KEY environment variable is missing.');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface ClassificationResult {
  title: string;
  category: Category;
  priority: Priority;
}

export async function classifyTask(description: string, division?: string): Promise<ClassificationResult> {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the following task description and provide a classification.
    
    ${division ? `The user indicated this task might belong to the '${division}' division. Verify and use this category if appropriate.` : ''}

    Categories to choose from: 'Produksi', 'RMC', 'Finance', 'Inventory', 'Project', 'Procurement', 'Marketing/Sales', 'Other'.
    Priorities to choose from: 'Low', 'Medium', 'High'.
    
    Task: "${description}"
    `,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A concise title or summary extracted from the description."
          },
          category: {
            type: Type.STRING,
            description: "The best matching category from the list."
          },
          priority: {
            type: Type.STRING,
            description: "The suggested priority (Low, Medium, or High) based on urgency implied."
          }
        },
        required: ["title", "category", "priority"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from Gemini API');
  }

  const result = JSON.parse(text) as ClassificationResult;
  
  // Basic validation fallback
  const validCategories: Category[] = ['Produksi', 'RMC', 'Finance', 'Inventory', 'Project', 'Procurement', 'Marketing/Sales', 'Other'];
  if (!validCategories.includes(result.category)) {
    result.category = 'Other';
  }
  const validPriorities: Priority[] = ['Low', 'Medium', 'High'];
  if (!validPriorities.includes(result.priority)) {
    result.priority = 'Medium';
  }

  return result;
}
