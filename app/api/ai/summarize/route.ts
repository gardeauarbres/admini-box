import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour générer un résumé avec OpenAI
 * 
 * POST /api/ai/summarize
 * Body: { text: string, length?: 'short' | 'medium' | 'detailed' }
 */

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
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
        { error: 'Text too short. Minimum 100 characters for summarization.' },
        { status: 400 }
      );
    }

    const lengthInstructions: Record<string, string> = {
      short: 'Génère un résumé très court (2-3 phrases maximum)',
      medium: 'Génère un résumé moyen (un paragraphe)',
      detailed: 'Génère un résumé détaillé (plusieurs paragraphes)',
    };

    const instruction = lengthInstructions[length] || lengthInstructions.medium;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en résumé de textes français. Génère des résumés clairs et précis.',
          },
          {
            role: 'user',
            content: `${instruction} de ce texte :\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: length === 'short' ? 100 : length === 'medium' ? 300 : 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      let errorMessage = 'OpenAI API error';
      if (response.status === 401) {
        errorMessage = 'Clé API OpenAI invalide ou expirée. Vérifiez votre clé dans .env.local';
      } else if (response.status === 429) {
        errorMessage = 'Limite de requêtes OpenAI atteinte. Réessayez plus tard.';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorData, status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({
      success: true,
      originalLength: text.length,
      summary,
      length,
      reduction: Math.round((1 - summary.length / text.length) * 100),
    });
  } catch (error: any) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

