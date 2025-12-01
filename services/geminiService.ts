import { GoogleGenAI } from "@google/genai";
import { Employee, AttendanceRecord } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePayrollInsight = async (
  query: string, 
  employees: Employee[], 
  attendance: AttendanceRecord[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "API Key not configured. Please check your environment variables.";

  // Prepare context
  const contextData = JSON.stringify({
    employees: employees.map(e => ({ name: e.name, role: e.role, baseSalary: e.baseSalary })),
    recentAttendanceCount: attendance.length,
    today: new Date().toISOString().split('T')[0]
  });

  const prompt = `
    You are an intelligent assistant for a small shop owner. 
    Here is the current shop data in JSON format: ${contextData}.
    
    The user asks: "${query}"
    
    Provide a helpful, concise answer. If analyzing data, look for trends (e.g., frequent lateness).
    If asked about salary calculations, explain the logic simply.
    Keep the tone professional yet friendly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I couldn't generate an answer right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};