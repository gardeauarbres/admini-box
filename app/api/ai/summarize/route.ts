import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

/**
 * Endpoint pour générer un résumé avec Groq (via Vercel AI SDK)
 * 
 * POST /api/ai/summarize
 * Body: { text: string, length?: 'short' | 'medium' | 'detailed' }
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
    const { text, length = 'medium' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid field: text' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { error: 'Texte trop court. Minimum 100 caractères pour le résumé.' },
        { status: 400 }
      );
    }

    const lengthInstructions: Record<string, string> = {
      short: 'Génère un résumé très court (2-3 phrases maximum)',
      medium: 'Génère un résumé moyen (un paragraphe)',
      detailed: 'Génère un résumé détaillé (plusieurs paragraphes)',
    };

    const instruction = lengthInstructions[length] || lengthInstructions.medium;

    const { text: summary } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'Tu es un expert en résumé de textes français. Génère des résumés clairs et précis.',
      prompt: `${instruction} de ce texte :\n\n${text}`,
      temperature: 0.3,
    });

    if (!summary) {
      throw new Error('Réponse vide de l\'IA');
    }

    return NextResponse.json({
      success: true,
      originalLength: text.length,
      summary: summary.trim(),
      length,
      reduction: Math.round((1 - summary.length / text.length) * 100),
    });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement IA', message: error.message },
      { status: 500 }
    );
  }
}
