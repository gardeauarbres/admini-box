import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint pour corriger l'orthographe et la grammaire avec OpenAI
 * 
 * POST /api/ai/correct
 * Body: { text: string }
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
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      );
    }

    // Appel à OpenAI
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
            content: 'Tu es un expert en correction orthographique et grammaticale française. Corrige le texte fourni en conservant le sens et le style. Retourne UNIQUEMENT le texte corrigé, sans explications ni commentaires.',
          },
          {
            role: 'user',
            content: `Corrige ce texte français (orthographe et grammaire) :\n\n${text}`,
          },
        ],
        temperature: 0.3,
        max_tokens: Math.min(text.length * 2, 2000), // Limiter les tokens
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
      
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      // Messages d'erreur plus clairs
      let errorMessage = 'OpenAI API error';
      if (response.status === 401) {
        errorMessage = 'Clé API OpenAI invalide ou expirée. Vérifiez votre clé dans .env.local';
      } else if (response.status === 429) {
        errorMessage = 'Limite de requêtes OpenAI atteinte. Réessayez plus tard.';
      } else if (response.status === 500) {
        errorMessage = 'Erreur serveur OpenAI. Réessayez plus tard.';
      } else if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const correctedText = data.choices[0]?.message?.content?.trim() || text;

    return NextResponse.json({
      success: true,
      originalText: text,
      correctedText,
      changes: text !== correctedText,
    });
  } catch (error: any) {
    console.error('Correction error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// GET pour vérifier la configuration
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  
  return NextResponse.json({
    status: hasApiKey ? 'configured' : 'not_configured',
    endpoint: '/api/ai/correct',
    method: 'POST',
    description: 'Correct spelling and grammar using OpenAI',
    maxLength: 5000,
    requiredFields: ['text'],
  });
}

