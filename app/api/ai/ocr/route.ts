import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';

export const maxDuration = 30;

const SYSTEM_PROMPT = `Tu es un expert en extraction de données comptables.
Analyse l'image du ticket de caisse ou de la facture fournie et extrais les informations suivantes au format JSON uniquement :
- merchant: Le nom du commerçant/magasin.
- date: La date de la transaction (au format YYYY-MM-DD). Si l'année est manquante, suppose l'année courante.
- amount: Le montant total TTC (nombre décimal).
- category: La catégorie la plus appropriée (Alimentation, Transport, Logement, Loisirs, Santé, Shopping, Services, Autre).

Si une information est illisible ou introuvable, mets null.
Ne renvoie QUE le JSON, pas de markdown, pas de texte explicatif.`;

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: 'Aucune image fournie' },
                { status: 400 }
            );
        }

        // L'image arrive généralement en base64 data URL
        // Ex: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
        // Llama via Vercel AI SDK attend soit une URL, soit un base64 buffer/string selon l'implémentation.
        // Avec @ai-sdk/groq, on peut passer un message user avec content array.

        const { text } = await generateText({
            const { text } = await generateText({
                // Groq Llama 3.2 90B (11B decommissioned)
                model: groq('llama-3.2-90b-vision-preview'),
                system: SYSTEM_PROMPT,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: 'Analyse ce ticket de caisse.' },
                            { type: 'image', image: image }, // L'image doit être une data URL ou une URL
                        ],
                    },
                ],
            });

            // Nettoyage agressif du résultat pour garantir un JSON valide
            let cleanedText = text.trim();
            if(cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let result;
    try {
        result = JSON.parse(cleanedText);
    } catch (e) {
        console.error('Erreur parsing JSON Vision:', cleanedText);
        throw new Error('Réponse IA invalide (pas de JSON)');
    }

    return NextResponse.json(result);

} catch (error: any) {
    console.error('Erreur OCR Vision:', error);
    return NextResponse.json(
        { error: error.message || 'Erreur lors de l\'analyse du document' },
        { status: 500 }
    );
}
}
