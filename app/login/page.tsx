'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
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
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
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
        <div style={{
            display: 'flex',
            minHeight: '80vh',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            zIndex: 1
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap-reverse', // Mobile: Form (top) -> Pres (bottom) due to reverse? No, wrap-reverse wraps upward.
                    // Let's use standard wrap and order.
                    flexDirection: 'row',
                    maxWidth: '1000px',
                    width: '100%',
                    overflow: 'hidden',
                    padding: 0,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <style jsx global>{`
                    @media (max-width: 768px) {
                        .login-presentation {
                            display: none !important;
                        }
                        .login-container {
                            padding: 1rem !important;
                        }
                    }
                `}</style>

                {/* Section Gauche : Présentation (Hidden on mobile) */}
                <div className="login-presentation" style={{
                    flex: '1 1 350px',
                    padding: '3rem',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(var(--secondary-rgb), 0.05) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderRight: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                            Retrouvez votre <br />
                            <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Sérénité Administrative</span>
                        </h2>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: '0 0 2rem 0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            fontSize: '1rem',
                            color: 'var(--foreground)'
                        }}>
                            {[
                                { icon: '🚀', text: 'Centralisez tous vos organismes' },
                                { icon: '⚡', text: 'Suivez vos échéances urgentes' },
                                { icon: '🔒', text: 'Sécurité et confidentialité garanties' },
                                { icon: '📱', text: 'Accessible partout, tout le temps' }
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (index * 0.1) }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                                    <span style={{ opacity: 0.9 }}>{item.text}</span>
                                </motion.li>
                            ))}
                        </ul>
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            fontSize: '0.9rem',
                            fontStyle: 'italic',
                            color: 'var(--secondary)'
                        }}>
                            "AdminiBox a transformé ma gestion des papiers. Je ne rate plus aucune échéance !"
                            <div style={{ marginTop: '0.5rem', fontWeight: 600, fontStyle: 'normal', color: 'var(--primary)' }}>
                                — Un utilisateur satisfait
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Section Droite : Formulaire */}
                <div className="login-container" style={{ flex: '1 1 350px', padding: '3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '300px' }}>
                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Connexion</h1>
                        <p style={{ color: 'var(--secondary)' }}>Accédez à votre espace sécurisé</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderLeft: '3px solid var(--danger)',
                                color: 'var(--danger)',
                                padding: '1rem',
                                borderRadius: '4px',
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                            ⚠️ {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit(handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ position: 'relative' }}>
                            <label
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: focusedField === 'email' || watch('email') ? '0' : '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: focusedField === 'email' || watch('email') ? '0.75rem' : '1rem',
                                    color: focusedField === 'email' ? 'var(--primary)' : 'var(--secondary)',
                                    pointerEvents: 'none',
                                    transition: 'all 0.2s ease',
                                    background: focusedField === 'email' || watch('email') ? 'var(--glass-bg)' : 'transparent',
                                    padding: '0 0.25rem',
                                    zIndex: 10
                                }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    paddingTop: '1.5rem',
                                    paddingBottom: '0.5rem',
                                    borderRadius: '8px',
                                    background: 'var(--input-bg)',
                                    border: `1px solid ${errors.email ? 'var(--danger)' : focusedField === 'email' ? 'var(--primary)' : 'var(--input-border)'}`,
                                    color: 'var(--foreground)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: focusedField === 'email' ? '0 0 0 2px rgba(var(--primary-rgb), 0.2)' : 'none'
                                }}
                            />
                            {errors.email && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.email.message}</span>}
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label
                                style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: focusedField === 'password' || watch('password') ? '0' : '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: focusedField === 'password' || watch('password') ? '0.75rem' : '1rem',
                                    color: focusedField === 'password' ? 'var(--primary)' : 'var(--secondary)',
                                    pointerEvents: 'none',
                                    transition: 'all 0.2s ease',
                                    background: focusedField === 'password' || watch('password') ? 'var(--glass-bg)' : 'transparent',
                                    padding: '0 0.25rem',
                                    zIndex: 10
                                }}
                            >
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                {...register('password')}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    paddingTop: '1.5rem',
                                    paddingBottom: '0.5rem',
                                    borderRadius: '8px',
                                    background: 'var(--input-bg)',
                                    border: `1px solid ${errors.password ? 'var(--danger)' : focusedField === 'password' ? 'var(--primary)' : 'var(--input-border)'}`,
                                    color: 'var(--foreground)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                                    boxShadow: focusedField === 'password' ? '0 0 0 2px rgba(var(--primary-rgb), 0.2)' : 'none'
                                }}
                            />
                            {errors.password && <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{errors.password.message}</span>}
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            style={{
                                padding: '1rem',
                                fontSize: '1rem',
                                fontWeight: 600,
                                borderRadius: '8px',
                                marginTop: '0.5rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {isSubmitting ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                                />
                            ) : 'Se connecter'}
                            {!isSubmitting && '→'}
                        </motion.button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--secondary)' }}>
                        Pas encore de compte ?{' '}
                        <Link href="/register" style={{
                            color: 'var(--primary)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            borderBottom: '1px solid transparent',
                            transition: 'border-color 0.2s'
                        }}
                            className="hover-underline"
                        >
                            Créer un compte gratuitement
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
