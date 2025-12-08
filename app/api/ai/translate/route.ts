import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour traduire du texte avec OpenAI
 * 
 * POST /api/ai/translate
 * Body: { text: string, targetLanguage: string }
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
    const { text, targetLanguage = 'anglais' } = body;

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
            content: 'Tu es un expert traducteur. Traduis le texte fourni de manière précise et naturelle, en conservant le ton et le style.',
          },
          {
            role: 'user',
            content: `Traduis ce texte français en ${targetLanguage} :\n\n${text}`,
          },
        ],
        temperature: 0.3,
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
    const translatedText = data.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({
      success: true,
      originalText: text,
      translatedText,
      targetLanguage,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

