import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import SpotlightCard from './SpotlightCard';
import { useToast } from '@/context/ToastContext';

interface SmartScannerProps {
    onScanComplete: (data: { amount?: number, date?: string, merchant?: string, category?: string, file?: File }) => void;
}

export default function SmartScanner({ onScanComplete }: SmartScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const { showToast } = useToast();

    const convertAndResize = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    const scaleSize = MAX_WIDTH / img.width;
                    const newWidth = (img.width > MAX_WIDTH) ? MAX_WIDTH : img.width;
                    const newHeight = (img.width > MAX_WIDTH) ? (img.height * scaleSize) : img.height;

                    canvas.width = newWidth;
                    canvas.height = newHeight;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, newWidth, newHeight);

                    // Compress to JPEG 0.7
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = error => reject(error);
        });
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setScanning(true);
        setLoadingMessage('Optimisation de l\'image...');
        const file = acceptedFiles[0];

        try {
            // 1. Convert only (resize client side to avoid Vercel payload limit)
            const base64Image = await convertAndResize(file);

            // 2. Envoyer à l'API Vision (Llama 3.2 11B)
            setLoadingMessage('Analyse par l\'IA (Vision)...');

            const response = await fetch('/api/ai/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errorData.error || `Erreur Server: ${response.status}`);
            }

            const data = await response.json();
            console.log('Vision Result:', data);

            onScanComplete({
                amount: data.amount,
                date: data.date,
                merchant: data.merchant,
                category: data.category,
                file: file
            });

        } catch (error: any) {
            console.error('OCR Failed:', error);
            showToast(`Erreur: ${error.message || "Échec inconnu"}`, "error");
        } finally {
            setScanning(false);
            setLoadingMessage('');
        }
    }, [onScanComplete, showToast]);

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
