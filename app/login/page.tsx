'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export default function LoginPage() {
    const [error, setError] = useState('');
    const router = useRouter();
    const { checkUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    });

    const handleLogin = async (data: LoginFormData) => {
        setError('');
        try {
            await account.createEmailPasswordSession(data.email, data.password);
            await checkUser();
            router.push('/');
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Erreur de connexion');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-panel">
            <div style={{ padding: '2rem' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Connexion</h1>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: 'var(--danger)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                background: 'var(--input-bg)',
                                border: errors.email ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                                color: 'var(--foreground)',
                                outline: 'none'
                            }}
                        />
                        {errors.email && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Mot de passe</label>
                        <input
                            type="password"
                            {...register('password')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                background: 'var(--input-bg)',
                                border: errors.password ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                                color: 'var(--foreground)',
                                outline: 'none'
                            }}
                        />
                        {errors.password && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                    Pas encore de compte ? <Link href="/register" style={{ color: 'var(--primary)' }}>S'inscrire</Link>
                </div>
            </div>
        </div>
    );
}
