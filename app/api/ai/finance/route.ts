import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

const SYSTEM_PROMPT = `Rôle
Tu es un Conseiller Financier personnel intelligent pour l'application AdminiBox.
Ton but est d'analyser les données financières de l'utilisateur (revenus, dépenses, transactions) et de fournir des conseils pertinents, bienveillants et actionnables.

Contexte
- L'utilisateur gère ses finances personnelles ou de petite entreprise.
- Tu reçois un résumé JSON des finances : total revenus, total dépenses, solde, et liste des dernières transactions.

Règles
- Analyse le ratio dépenses/revenus.
- Repère les dépenses atypiques ou élevées.
- Félicite si le solde est positif et l'épargne possible.
- Alerte gentiment si le solde est négatif ou critique.
- Propose 1 ou 2 actions concrètes (ex: "Réduire les abonnements", "Mettre de côté 10%").
- Ton : Professionnel, encourageant, clair. Pas de jargon complexe.
- Format de réponse : Texte brut, formaté avec des puces si nécessaire, court (max 3-4 phrases clés).
`;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Clé API Groq non configurée' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { income, expenses, balance, transactions } = body;

        const prompt = `Voici mes données financières du mois :
- Revenus : ${income} €
- Dépenses : ${expenses} €
- Solde : ${balance} €
- Dernières transactions notables : ${JSON.stringify(transactions)}

Que penses-tu de ma situation ? Quels conseils peux-tu me donner ?`;

        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            system: SYSTEM_PROMPT,
            prompt: prompt,
            temperature: 0.5,
        });

        return NextResponse.json({ analysis: text });

    } catch (error: any) {
        console.error('Financial Analysis Error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'analyse financière' },
            { status: 500 }
        );
    }
}
