import React, { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { useDropzone } from 'react-dropzone';
import { analyzeReceipt } from '@/lib/ai-editor';

interface SmartScannerProps {
    onScanComplete: (data: { amount?: number, date?: string, merchant?: string, category?: string }) => void;
}

export default function SmartScanner({ onScanComplete }: SmartScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        setScanning(true);
        setProgress(0);
        const file = acceptedFiles[0];

        try {
            const worker = await createWorker('fra'); // Load French language model

            // Log progress
            // Note: In v5 createWorker is async, we can't easily attach logger in the same way as v2
            // For simplicity in this demo, we'll just simulate progress or use basic awaiting
            setProgress(30);

            const { data: { text } } = await worker.recognize(file);
            setProgress(100);

            console.log('OCR Result:', text);

            // AI Analysis
            const aiResult = await analyzeReceipt(text);
            console.log('AI Result:', aiResult);

            onScanComplete({
                amount: aiResult.amount,
                date: aiResult.date,
                merchant: aiResult.merchant,
                category: aiResult.category
            });

        } catch (error) {
            console.error('OCR Failed:', error);
        } finally {
            setScanning(false);
        }
    }, [onScanComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        disabled: scanning,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf']
        }
    });

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--primary)', background: 'rgba(var(--primary-rgb), 0.05)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🤖 Smart Scan IA
                {scanning && <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>• Analyse en cours...</span>}
            </h3>

            <div {...getRootProps()} style={{
                border: '2px dashed ' + (isDragActive ? 'var(--primary)' : 'var(--card-border)'),
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: scanning ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                background: isDragActive ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
            }}>
                <input {...getInputProps()} />
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    {scanning ? '⚙️' : '📸'}
                </div>
                {scanning ? (
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Lecture du ticket...</div>
                        <div style={{ height: '4px', background: 'var(--card-border)', borderRadius: '2px', overflow: 'hidden', width: '200px', margin: '0 auto' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={{ margin: 0, fontWeight: 500 }}>Glissez un ticket ou une facture</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--secondary)' }}>Détection automatique du montant et de la date</p>
                    </div>
                )}
            </div>
        </div>
    );
}
