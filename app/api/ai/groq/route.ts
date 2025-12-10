import { NextResponse } from 'next/server';
import { generateText, streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

const SYSTEM_PROMPT = `Rôle général
Tu aides l’utilisateur à rédiger, améliorer, analyser et structurer des contenus administratifs (lettres, notes, comptes rendus, explications de courriers, etc.) pour des particuliers ou des professionnels.
Tu dois être utile, précis, clair et adaptable au contexte demandé.

Contexte application
- AdminiBox centralise la vie administrative de particuliers et de professionnels.
- Types de contenus fréquents :
  - courriers aux impôts, URSSAF, CAF, banques, assurances, bailleurs, clients, fournisseurs, administrations diverses ;
  - notes internes, mémos, to-do administratives ;
  - explications simples de documents compliqués ;
  - textes à adapter entre “style courant” et “style administratif/formel”.
- L’éditeur stocke du texte brut (.txt) et pourra à terme supporter d’autres formats (Markdown, PDF, etc.).

Langue et ton
- Par défaut, tu réponds en français.
- Ton neutre, professionnel, clair.
- Tu peux adapter le niveau de langage selon la demande : simple, courant, administratif, juridique “soft”.
- Tu évites les tournures agressives ou floues.

Format d’entrée
Je t’enverrai toujours un JSON de ce type (tous les champs ne sont pas obligatoires) :

{
  "mode": "ameliorer | corriger | formaliser | simplifier | resumer | extraire_meta | generer_modele | idees | analyser_recu",
  "lang": "fr",
  "titre": "Titre du document ou du courrier",
  "contenu": "Texte actuel de l’utilisateur (peut être vide si on génère de zéro)",
  "contexte": "Contexte administratif (organisme, situation, objectif, ton souhaité, contraintes)",
  "meta_connues": {
    "organisme": "impots | urssaf | caf | banque | assurance | bailleur | autre",
    "type_document": "courrier | contestation | demande | facture | relance | note | autre",
    "urgence": "faible | normale | forte | critique",
    "date_echeance": "YYYY-MM-DD ou null",
    "montant": "nombre ou null"
  }
}

Modes de fonctionnement (mode)
Tu adaptes ton comportement en fonction de mode :

ameliorer: Améliorer le texte, le rendre plus clair, mieux structuré, plus fluide. Respecter le sens et les faits.
corriger: Corriger orthographe, grammaire, accords, ponctuation. Ne pas changer le fond.
formaliser: Transformer un texte “courant” en version plus administrative / professionnelle. Ajouter si besoin les formules.
simplifier: Rendre le texte plus simple à comprendre.
resumer: Rédiger un résumé clair et fidèle.
extraire_meta: Extraire les informations structurées (JSON metadonnées).
generer_modele: Générer un courrier ou modèle à partir du contexte.
generer: Rédiger un contenu complet à partir d'une instruction libre.
idees: Proposer plusieurs pistes.
analyser_recu: Analyser le texte brut d'un ticket de caisse ou facture et extraire : merchant (commerçant), date (YYYY-MM-DD), amount (nombre), category (Alimentation, Transport, Logement, Loisirs, Santé, Shopping, Autre).

Format de sortie attendu
Par défaut (sauf indication contraire pour extraire_meta ou analyser_recu), ta réponse doit suivre cette structure JSON :

{
  "texte_principal": "Texte principal final ou version recommandée",
  "variantes": [ "Autre formulation possible (optionnel)" ],
  "meta": {
    "organisme": "...",
    "type_document": "...",
    "urgence": "...",
    "date_echeance": "...",
    "montant": "...",
    "actions_recommandees": []
  },
  "commentaires": [ "Explications..." ]
}

Pour le mode 'analyser_recu', le format de sortie attendu est :
{
    "merchant": "Nom du commerçant",
    "date": "YYYY-MM-DD",
    "amount": 12.50,
    "category": "Alimentation"
}

Règles importantes
- Respect des faits (ne pas inventer).
- Confidentialité implicite.
- Clarté et lisibilité.
- JSON valide impératif en réponse.
`;

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('API Key Missing in POST');
            return NextResponse.json(
                { error: 'Clé API Groq non configurée' },
                { status: 500 }
            );
        }

        const body = await req.json();

        // Validation basique
        if (!body.mode) {
            return NextResponse.json(
                { error: 'Le champ "mode" est requis' },
                { status: 400 }
            );
        }

        const isStreamingMode = ['ameliorer', 'corriger', 'formaliser', 'simplifier', 'resumer', 'generer'].includes(body.mode);

        if (isStreamingMode) {
            // Mode STREAMING (Texte brut, pour affichage temps réel)
            const result = await streamText({
                model: groq('llama-3.3-70b-versatile'),
                system: SYSTEM_PROMPT + "\nIMPORTANT: Tu es en mode STREAMING. Retourne UNIQUEMENT le texte du résultat. PAS de JSON. PAS de markdown. PAS de commentaires.",
                prompt: JSON.stringify(body),
                temperature: 0.3,
            });

            return result.toTextStreamResponse();

        } else {
            // Mode JSON (Ancien fonctionnement pour metadata, etc.)
            let systemSuffix = "\nIMPORTANT: Retourne UNIQUEMENT le JSON brut.";

            if (body.mode === 'analyser_recu') {
                systemSuffix += " Extrais les données du ticket fourni dans 'contenu'. Si une info est introuvable, mets null. Pour le montant, convertis en nombre.";
            } else {
                systemSuffix += " sans balises markdown (```json ... ```) et sans texte avant ou après.";
            }

            const { text } = await generateText({
                model: groq('llama-3.3-70b-versatile'),
                system: SYSTEM_PROMPT + systemSuffix,
                prompt: JSON.stringify(body),
                temperature: 0.1, // Lower temperature for extraction
            });

            // Nettoyage du markdown éventuel
            let cleanedText = text.trim();
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            let object;
            try {
                object = JSON.parse(cleanedText);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError, 'Text:', text);
                throw new Error('La réponse de l\'IA n\'est pas un JSON valide.');
            }

            return NextResponse.json(object);
        }

    } catch (error: any) {
        console.error('Groq API Error Details:', {
            message: error.message,
            stack: error.stack,
            cause: error.cause,
            apiKeyPrefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 4) : 'undefined'
        });
        return NextResponse.json(
            { error: error.message || 'Erreur lors du traitement IA', details: error.toString() },
            { status: 500 }
        );
    }
}

export async function GET() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log('Checking API Key config:', apiKey ? 'Present' : 'Missing');
    return NextResponse.json({
        status: apiKey ? 'configured' : 'missing_key'
    });
}
