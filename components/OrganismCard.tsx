import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import OrganismTags from './OrganismTags';
import OrganismReminder from './OrganismReminder';
import OrganismNotes from './OrganismNotes';
import OrganismAttachments from './OrganismAttachments';
import OrganismCalendar from './OrganismCalendar';
import ShareOrganism from './ShareOrganism';

interface OrganismCardProps {
    name: string;
    status: 'ok' | 'warning' | 'urgent';
    message: string;
    icon: string;
    url?: string;
    tags?: string[];
    isFavorite?: boolean;
    reminderDate?: string;
    reminderMessage?: string;
    notes?: string;
    attachments?: string;
    events?: string;
    organismId: string;
    onUpdate?: (updates: {
        name?: string;
        url?: string;
        status?: string;
        message?: string;
        tags?: string[];
        isFavorite?: boolean;
        reminderDate?: string;
        reminderMessage?: string;
        notes?: string;
        attachments?: string;
        events?: string;
    }) => void;
    onDelete?: () => void;
    onToggleFavorite?: () => void;
}

const OrganismCard: React.FC<OrganismCardProps> = ({
    name,
    status,
    message,
    icon,
    url,
    tags = [],
    isFavorite = false,
    reminderDate,
    reminderMessage,
    notes,
    attachments,
    events,
    organismId,
    onUpdate,
    onDelete,
    onToggleFavorite
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [editUrl, setEditUrl] = useState(url || '');
    const [editName, setEditName] = useState(name);
    const [editStatus, setEditStatus] = useState(status);
    const [editMessage, setEditMessage] = useState(message);
    const [editTags, setEditTags] = useState(tags);

    const getStatusColor = () => {
        switch (status) {
            case 'urgent': return 'var(--danger)';
            case 'warning': return 'var(--warning)';
            case 'ok': return 'var(--success)';
            default: return 'var(--secondary)';
        }
    };

    const handleSave = () => {
        if (onUpdate) {
            onUpdate({
                name: editName,
                url: editUrl,
                status: editStatus,
                message: editMessage,
                tags: editTags,
            });
        }
        setShowSettings(false);
    };

    const handleReminderChange = useCallback((date?: string, reminderMsg?: string) => {
        if (onUpdate) {
            onUpdate({
                reminderDate: date,
                reminderMessage: reminderMsg,
            });
        }
    }, [onUpdate]);

    const handleDelete = () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
            if (onDelete) {
                onDelete();
            }
        }
    };

    const handleAccessPortal = () => {
        if (url) {
            window.open(url, '_blank');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="glass-panel"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: getStatusColor()
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {icon} {name}
                    {isFavorite && <span title="Favori">⭐</span>}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: `${getStatusColor()}20`,
                        color: getStatusColor(),
                        border: `1px solid ${getStatusColor()}40`
                    }}>
                        {status === 'warning' ? 'ATTENTION' : status.toUpperCase()}
                    </span>
                    <button
                        onClick={() => onToggleFavorite && onToggleFavorite()}
                        className="btn btn-secondary"
                        style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.8rem',
                            background: isFavorite ? 'var(--primary)' : 'transparent',
                            color: isFavorite ? 'white' : 'var(--foreground)',
                        }}
                        title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        ⭐
                    </button>
                    <button
                        onClick={() => setShowShare(true)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        title="Partager"
                    >
                        🔗
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        title="Paramètres"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                {message}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {tags.map(tag => (
                        <span
                            key={tag}
                            style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                background: 'var(--form-bg)',
                                border: '1px solid var(--card-border)',
                                fontSize: '0.75rem',
                                color: 'var(--secondary)',
                            }}
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Rappel */}
            {reminderDate && (
                <div style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    background: 'var(--warning)20',
                    border: '1px solid var(--warning)',
                    fontSize: '0.85rem',
                    color: 'var(--warning)',
                }}>
                    📅 Rappel: {new Date(reminderDate).toLocaleDateString('fr-FR')}
                    {reminderMessage && ` - ${reminderMessage}`}
                </div>
            )}

            {showSettings && (
                <div style={{ padding: '1rem', background: 'var(--form-bg)', borderRadius: 'var(--radius)', marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--primary)' }}>Paramètres de l'organisme</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                Nom
                            </label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                URL du portail
                            </label>
                            <input
                                type="url"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="https://..."
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                Statut
                            </label>
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value as 'ok' | 'warning' | 'urgent')}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--foreground)'
                                }}
                            >
                                <option value="ok">OK</option>
                                <option value="warning">Attention</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                Message
                            </label>
                            <input
                                type="text"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: '4px',
                                    background: 'var(--input-bg)',
                                    border: '1px solid var(--input-border)',
                                    color: 'var(--foreground)'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                Tags
                            </label>
                            <OrganismTags
                                tags={editTags}
                                onTagsChange={setEditTags}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--secondary)' }}>
                                Rappel
                            </label>
                            <OrganismReminder
                                reminderDate={reminderDate}
                                reminderMessage={reminderMessage}
                                onReminderChange={handleReminderChange}
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                        <OrganismNotes
                            organismId={organismId}
                            notes={notes}
                            onUpdateNotes={(updatedNotes) => {
                                if (onUpdate) {
                                    onUpdate({ notes: JSON.stringify(updatedNotes) });
                                }
                            }}
                        />
                    </div>

                    {/* Pièces jointes */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                        <OrganismAttachments
                            organismId={organismId}
                            attachments={attachments}
                            onUpdateAttachments={(updatedAttachments) => {
                                if (onUpdate) {
                                    onUpdate({ attachments: JSON.stringify(updatedAttachments) });
                                }
                            }}
                        />
                    </div>

                    {/* Calendrier */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                        <OrganismCalendar
                            organismId={organismId}
                            events={events}
                            onUpdateEvents={(updatedEvents) => {
                                if (onUpdate) {
                                    onUpdate({ events: JSON.stringify(updatedEvents) });
                                }
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                            onClick={handleSave}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                        >
                            Enregistrer
                        </button>
                        <button
                            onClick={handleDelete}
                            className="btn btn-secondary"
                            style={{ padding: '0.5rem', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        >
                            🗑️ Supprimer
                        </button>
                    </div>
                </div>
            )}

            <button
                onClick={handleAccessPortal}
                className="btn btn-secondary"
                style={{ marginTop: 'auto', width: '100%' }}
                disabled={!url}
            >
                Accéder au portail
            </button>

            {/* Modal de partage */}
            {showShare && (
                <ShareOrganism
                    organismId={organismId}
                    organismName={name}
                    onClose={() => setShowShare(false)}
                />
            )}
        </motion.div>
    );
};

export default OrganismCard;
