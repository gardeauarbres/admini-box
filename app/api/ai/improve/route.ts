import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

/**
 * Endpoint pour améliorer le style et la rédaction avec Groq (via Vercel AI SDK)
 * 
 * POST /api/ai/improve
 * Body: { text: string, style?: 'professional' | 'simple' | 'clear' | 'concise' }
 */

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Groq non configurée' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, style = 'professional' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid field: text' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Texte trop long. Maximum 5000 caractères.' },
        { status: 400 }
      );
    }

    const styleInstructions: Record<string, string> = {
      professional: 'Rends ce texte plus professionnel et formel, tout en conservant le sens original.',
      simple: 'Simplifie ce texte pour le rendre plus accessible et facile à comprendre.',
      clear: 'Améliore la clarté et la compréhension de ce texte.',
      concise: 'Raccourcis ce texte en conservant toutes les informations importantes.',
    };

    const { text: improvedText } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'Tu es un expert en rédaction française. Améliore le style et la qualité du texte fourni selon les instructions, en conservant le sens original. Retourne uniquement le texte amélioré.',
      prompt: `${styleInstructions[style] || styleInstructions.professional}\n\nTexte:\n${text}`,
      temperature: 0.5,
    });

    if (!improvedText) {
      throw new Error('Réponse vide de l\'IA');
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      improvedText: improvedText.trim(),
      style,
    });
  } catch (error: any) {
    console.error('Improvement error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement IA', message: error.message },
      { status: 500 }
    );
  }
}
