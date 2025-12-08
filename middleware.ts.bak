import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Désactivation temporaire du middleware strict
    // La protection est gérée par ProtectedRoute côté client
    // Cela évite les problèmes avec les cookies Appwrite qui peuvent varier
    
    // Pour l'instant, on laisse tout passer
    // Le composant ProtectedRoute dans chaque page protégée gère la redirection
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (svg, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
    ],
};

