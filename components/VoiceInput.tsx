'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';

interface VoiceInputProps {
    onCommand: (command: string) => void;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function VoiceInput({ onCommand }: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
        }
    }, []);

    const toggleListening = useCallback(() => {
        if (!isSupported) {
            showToast('Reconnaissance vocale non supportée sur ce navigateur', 'error');
            return;
        }

        if (isListening) {
            // Stop logic is handled by the recognition object usually, 
            // but for simplicity in this stateless toggle we just rely on the 'end' event
            // to reset state, or we could store the recognition instance in a ref.
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'fr-FR';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            showToast('🎙️ Je vous écoute...', 'info');
        };

        recognition.onresult = (event: any) => {
            const command = event.results[0][0].transcript;
            showToast(`Commande reçue : "${command}"`, 'success');
            onCommand(command);
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                showToast('Accès micro refusé', 'error');
            } else {
                showToast('Erreur de reconnaissance vocale', 'error');
            }
        };

        recognition.start();

    }, [isListening, isSupported, onCommand, showToast]);

    if (!isSupported) return null;

    return (
        <button
            onClick={toggleListening}
            className={`btn-voice ${isListening ? 'listening' : ''}`}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isListening ? 'var(--danger)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1000,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            title="Commande Vocale"
        >
            <span style={{ fontSize: '1.5rem' }}>{isListening ? '🛑' : '🎙️'}</span>

            {isListening && (
                <div style={{
                    position: 'absolute',
                    top: -10,
                    left: -10,
                    right: -10,
                    bottom: -10,
                    border: '2px solid var(--danger)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s infinite'
                }} />
            )}

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
            `}</style>
        </button>
    );
}
