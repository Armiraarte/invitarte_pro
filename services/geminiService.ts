
import { GoogleGenAI } from "@google/genai";
import { InvitationPromptData } from "../types";

// Fix: Changed the parameter type from InvitationData to InvitationPromptData to correctly handle event details like date and venue
export const generateCreativeMessage = async (data: InvitationPromptData): Promise<string> => {
  // Fix: Initializing GoogleGenAI using the exact structure required by the guidelines with a named apiKey parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Actúa como un redactor profesional de invitaciones de lujo. Genera un mensaje de invitación cautivador y emocionante basado en la siguiente información:
  - Título del Evento: ${data.eventTitle}
  - Anfitrión: ${data.hostName}
  - Fecha: ${data.date}
  - Lugar: ${data.venue}
  - Notas adicionales: ${data.additionalInfo}
  - Enfoque visual sugerido: elegante, claro y emotivo para una invitacion digital moderna.

  REGLAS:
  1. El mensaje debe ser corto (máximo 400 caracteres).
  2. Debe invitar cordialmente al destinatario.
  3. No menciones el nombre del estilo en el texto.
  4. Devuelve ÚNICAMENTE el texto de la invitación, sin introducciones ni comentarios adicionales.`;

  try {
    // Fix: Using gemini-3-flash-preview for basic text tasks as recommended by coding guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // Fix: Access the .text property directly (it is a property, not a method) to extract the generated content
    return response.text || "¡Estás cordialmente invitado a nuestro gran evento!";
  } catch (error) {
    console.error("Error generating AI content:", error);
    return "Nos encantaría contar con tu presencia en este día tan especial.";
  }
};
