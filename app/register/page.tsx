'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ID } from 'appwrite';
import { registerSchema, type RegisterFormData } from '@/lib/validations';

export default function RegisterPage() {
    const [error, setError] = useState('');
    const router = useRouter();
    const { checkUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema)
    });

    const handleRegister = async (data: RegisterFormData) => {
        setError('');
        try {
            await account.create(ID.unique(), data.email, data.password, data.name);
            // Auto login after register
            await account.createEmailPasswordSession(data.email, data.password);
            await checkUser();
            router.push('/');
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Erreur d\'inscription');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }} className="glass-panel">
            <div style={{ padding: '2rem' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Inscription</h1>

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

                <form onSubmit={handleSubmit(handleRegister)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nom complet</label>
                        <input
                            type="text"
                            {...register('name')}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius)',
                                background: 'var(--input-bg)',
                                border: errors.name ? '1px solid var(--danger)' : '1px solid var(--card-border)',
                                color: 'var(--foreground)',
                                outline: 'none'
                            }}
                        />
                        {errors.name && (
                            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                {errors.name.message}
                            </p>
                        )}
                    </div>

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
                        <p style={{ color: 'var(--secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isSubmitting}>
                        {isSubmitting ? 'Inscription...' : 'S\'inscrire'}
                    </button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                    Déjà un compte ? <Link href="/login" style={{ color: 'var(--primary)' }}>Se connecter</Link>
                </div>
            </div>
        </div>
    );
}
