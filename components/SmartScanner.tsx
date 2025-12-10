import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import SpotlightCard from './SpotlightCard';

interface SmartScannerProps {
    onScanComplete: (data: { amount?: number, date?: string, merchant?: string, category?: string }) => void;
}

export default function SmartScanner({ onScanComplete }: SmartScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setScanning(true);
        setLoadingMessage('Lecture de l\'image...');
        const file = acceptedFiles[0];

        try {
            // 1. Convertir en Base64
            const base64Image = await convertToBase64(file);

            // 2. Envoyer à l'API Vision (Llama 3.2 11B)
            setLoadingMessage('Analyse par l\'IA (Vision)...');

            const response = await fetch('/api/ai/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'analyse');
            }

            const data = await response.json();
            console.log('Vision Result:', data);

            onScanComplete({
                amount: data.amount,
                date: data.date,
                merchant: data.merchant,
                category: data.category
            });

        } catch (error) {
            console.error('OCR Failed:', error);
            // On pourrait ajouter un toast d'erreur ici via le contexte
        } finally {
            setScanning(false);
            setLoadingMessage('');
        }
    }, [onScanComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        disabled: scanning,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            // PDF non supporté directement par Vision pour l'instant sans conversion
        }
    });

    return (
        <SpotlightCard className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--primary)', background: 'rgba(var(--primary-rgb), 0.05)' }} spotlightColor="rgba(var(--primary-rgb), 0.15)">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🤖 Smart Scan Vision
                {scanning && <span className="animate-pulse" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>• {loadingMessage}</span>}
            </h3>

            <div {...getRootProps()} style={{
                border: '2px dashed ' + (isDragActive ? 'var(--primary)' : 'var(--card-border)'),
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: scanning ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                background: isDragActive ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                opacity: scanning ? 0.7 : 1
            }}>
                <input {...getInputProps()} />
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {scanning ? '👀' : '📸'}
                </div>
                {scanning ? (
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Analyse en cours...</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>Llama Vision décrypte votre ticket</div>
                    </div>
                ) : (
                    <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>Glissez un ticket ou une facture</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary)' }}>Détection automatique (Commerçant, Date, Prix)</p>
                    </div>
                )}
            </div>
        </SpotlightCard>
    );
}
