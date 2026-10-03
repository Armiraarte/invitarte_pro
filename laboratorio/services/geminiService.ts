import { InvitationPromptData, PackageType } from '../types';

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const GEMINI_MODEL = 'gemini-3-flash-preview';

const extractText = (response: GeminiGenerateContentResponse) =>
  response.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

export const generateCreativeMessage = async (
  data: InvitationPromptData,
  packageType: PackageType
): Promise<string> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return 'Nos encantaría contar con tu presencia en este día tan especial.';
  }

  const prompt = `Actúa como un redactor profesional de invitaciones de lujo. Genera un mensaje de invitación cautivador y emocionante basado en la siguiente información:
  - Título del evento: ${data.eventTitle}
  - Anfitrión: ${data.hostName}
  - Fecha: ${data.date}
  - Lugar: ${data.venue}
  - Notas adicionales: ${data.additionalInfo}
  - Estilo seleccionado: ${packageType} (ELEGANT: formal y romántico, PARTY: energético y divertido, BABY: dulce y tierno, MODERN: profesional y minimalista).

  REGLAS:
  1. El mensaje debe ser corto (máximo 400 caracteres).
  2. Debe invitar cordialmente al destinatario.
  3. No menciones el nombre del estilo en el texto.
  4. Devuelve únicamente el texto de la invitación, sin introducciones ni comentarios adicionales.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const result = (await response.json()) as GeminiGenerateContentResponse;

    if (!response.ok) {
      throw new Error(result.error?.message || 'Gemini request failed');
    }

    return extractText(result) || 'Te esperamos en nuestro gran evento.';
  } catch (error) {
    console.error('Error generating AI content:', error);
    return 'Nos encantaría contar con tu presencia en este día tan especial.';
  }
};
