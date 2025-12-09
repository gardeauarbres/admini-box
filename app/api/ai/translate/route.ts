import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

/**
 * Endpoint pour traduire du texte avec Groq (via Vercel AI SDK)
 * 
 * POST /api/ai/translate
 * Body: { text: string, targetLanguage: string }
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
    const { text, targetLanguage = 'anglais' } = body;

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

    const { text: translatedText } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'Tu es un expert traducteur. Traduis le texte fourni de manière précise et naturelle, en conservant le ton et le style. Retourne uniquement la traduction.',
      prompt: `Traduis ce texte français en ${targetLanguage} :\n\n${text}`,
      temperature: 0.3,
    });

    if (!translatedText) {
      throw new Error('Réponse vide de l\'IA');
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      translatedText: translatedText.trim(),
      targetLanguage,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement IA', message: error.message },
      { status: 500 }
    );
  }
}
