# 🎨 Guide des Couleurs et Thèmes

## Variables CSS par Thème

### Mode Sombre (Dark)
- `--background`: `#0f172a` (Fond principal)
- `--foreground`: `#f8fafc` (Texte principal)
- `--secondary`: `#64748b` (Texte secondaire)
- `--card-bg`: `rgba(30, 41, 59, 0.7)` (Fond des cartes)
- `--input-bg`: `rgba(255, 255, 255, 0.05)` (Fond des inputs)
- `--form-bg`: `rgba(255, 255, 255, 0.05)` (Fond des formulaires)
- `--button-secondary-bg`: `rgba(255, 255, 255, 0.1)` (Fond boutons secondaires)

### Mode Clair (Light)
- `--background`: `#f8fafc` (Fond principal)
- `--foreground`: `#0f172a` (Texte principal)
- `--secondary`: `#475569` (Texte secondaire)
- `--card-bg`: `rgba(255, 255, 255, 0.9)` (Fond des cartes)
- `--input-bg`: `rgba(255, 255, 255, 0.9)` (Fond des inputs)
- `--form-bg`: `rgba(0, 0, 0, 0.03)` (Fond des formulaires)
- `--button-secondary-bg`: `rgba(0, 0, 0, 0.05)` (Fond boutons secondaires)

## Couleurs Sémantiques (Communes aux deux thèmes)

- `--primary`: `#3b82f6` (Bleu - Actions principales)
- `--success`: `#10b981` (Vert - Succès)
- `--warning`: `#f59e0b` (Orange - Avertissements)
- `--danger`: `#ef4444` (Rouge - Erreurs/Urgent)

## Utilisation

### ✅ À FAIRE
```tsx
// Utiliser les variables CSS
style={{ color: 'var(--foreground)' }}
style={{ background: 'var(--input-bg)' }}
style={{ border: '1px solid var(--input-border)' }}
```

### ❌ À ÉVITER
```tsx
// Ne pas utiliser de couleurs fixes
style={{ color: '#f8fafc' }}
style={{ background: 'rgba(255,255,255,0.05)' }}
```

## Contraste et Accessibilité

Tous les contrastes respectent les standards WCAG 2.1 :
- Texte principal : Ratio ≥ 4.5:1
- Texte secondaire : Ratio ≥ 3:1
- Boutons : Ratio ≥ 3:1

## Migration

Tous les composants ont été migrés pour utiliser les variables CSS. Si vous ajoutez de nouvelles couleurs, utilisez toujours les variables définies dans `ThemeContext.tsx`.

