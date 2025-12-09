import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

/**
 * Endpoint pour corriger l'orthographe et la grammaire avec Groq (via Vercel AI SDK)
 * 
 * POST /api/ai/correct
 * Body: { text: string }
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
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid field: text' },
        { status: 400 }
      );
    }

    // Limiter la taille (5000 caractères max)
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Texte trop long. Maximum 5000 caractères.' },
        { status: 400 }
      );
    }

    // Appel à Groq
    const { text: correctedText } = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      system: 'Tu es un expert en correction orthographique et grammaticale française. Corrige le texte fourni en conservant le sens et le style. Retourne UNIQUEMENT le texte corrigé, sans explications ni commentaires.',
      prompt: `Corrige ce texte français (orthographe et grammaire) :\n\n${text}`,
      temperature: 0.3,
    });

    if (!correctedText) {
      throw new Error('Réponse vide de l\'IA');
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      correctedText: correctedText.trim(),
      changes: text !== correctedText.trim(),
    });
  } catch (error: any) {
    console.error('Correction error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement IA', message: error.message },
      { status: 500 }
    );
  }
}

// GET pour vérifier la configuration
export async function GET() {
  const hasApiKey = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    status: hasApiKey ? 'configured' : 'not_configured',
    endpoint: '/api/ai/correct',
    method: 'POST',
    description: 'Correct spelling and grammar using Groq',
    maxLength: 5000,
    requiredFields: ['text'],
  });
}
