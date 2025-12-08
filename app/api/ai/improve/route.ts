import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour améliorer le style et la rédaction avec OpenAI
 * 
 * POST /api/ai/improve
 * Body: { text: string, style?: 'professional' | 'simple' | 'clear' | 'concise' }
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
    const { text, style = 'professional' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid field: text' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    const styleInstructions: Record<string, string> = {
      professional: 'Rends ce texte plus professionnel et formel, tout en conservant le sens original.',
      simple: 'Simplifie ce texte pour le rendre plus accessible et facile à comprendre.',
      clear: 'Améliore la clarté et la compréhension de ce texte.',
      concise: 'Raccourcis ce texte en conservant toutes les informations importantes.',
    };

    const instruction = styleInstructions[style] || styleInstructions.professional;

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
            content: 'Tu es un expert en rédaction française. Améliore le style et la qualité du texte fourni selon les instructions, en conservant le sens original.',
          },
          {
            role: 'user',
            content: `${instruction}\n\nTexte :\n${text}`,
          },
        ],
        temperature: 0.5,
        max_tokens: Math.min(text.length * 2, 2000),
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
    const improvedText = data.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({
      success: true,
      originalText: text,
      improvedText,
      style,
    });
  } catch (error: any) {
    console.error('Improvement error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

