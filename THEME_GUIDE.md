# 🎨 OAPET Theme Guide

## Vue d'ensemble du thème

OAPET utilise un système de thème avancé basé sur **Violet/Pourpre** et **Rose/Rose pâle** avec support complet du mode sombre/clair.

## 🌈 Palette de couleurs

### Mode Clair
```css
/* Couleurs principales (Violet/Pourpre) */
--primary: #8b5cf6        /* Violet principal */
--primary-50: #faf5ff     /* Violet très clair */
--primary-100: #f3e8ff    /* Violet clair */
--primary-600: #7c3aed    /* Violet foncé */
--primary-700: #6d28d9    /* Violet très foncé */
--primary-900: #581c87    /* Violet sombre */

/* Couleurs d'accent (Rose/Rose pâle) */
--accent: #f472b6         /* Rose principal */
--accent-50: #fdf2f8      /* Rose très clair */
--accent-500: #f472b6     /* Rose standard */

/* Gradient de marque */
--gradient-brand: linear-gradient(135deg, #8b5cf6 0%, #f472b6 100%)
```

### Mode Sombre
```css
/* Couleurs principales adaptées */
--primary: #a78bfa        /* Violet clair pour le fond sombre */
--accent: #fb7185         /* Rose saumon pour le fond sombre */
```

## 🎯 Tokens sémantiques

### Texte
- `text-foreground` : Texte principal (noir/blanc selon thème)
- `text-muted-foreground` : Texte secondaire (gris adaptatif)
- `text-primary` : Texte violet de marque
- `text-destructive` : Texte d'erreur
- `text-emerald-500` : Texte de succès

### Arrière-plans
- `bg-background` : Arrière-plan principal
- `bg-card` : Arrière-plan des cartes
- `bg-muted` : Arrière-plan subtil
- `bg-primary` : Arrière-plan violet de marque
- `bg-accent` : Arrière-plan rose d'accent

### Bordures
- `border-border` : Bordures standard
- `border-primary` : Bordures violettes
- `divide-border` : Séparateurs

## 🔧 Comment changer de thème

### Utilisation du sélecteur
Dans le header, utilisez les boutons :
- ☀️ **Mode clair** : Fond blanc, texte noir
- 🌙 **Mode sombre** : Fond noir, texte blanc  
- 🖥️ **Système** : Suit les préférences de l'OS

### Programmation
```typescript
// Changer le thème par code
const applyTheme = (theme: 'light' | 'dark' | 'system') => {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
  
  localStorage.setItem('theme', theme);
};
```

## 📝 Bonnes pratiques

### ✅ À faire
```tsx
// Utiliser les tokens sémantiques
<div className="bg-card text-foreground border-border">
  <h1 className="text-primary">Titre</h1>
  <p className="text-muted-foreground">Description</p>
</div>

// Boutons avec thème
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Action
</button>
```

### ❌ À éviter
```tsx
// Ne pas utiliser de couleurs hardcodées
<div className="bg-white text-gray-900 border-gray-300"> ❌
<div className="bg-blue-500 text-white"> ❌
```

## 🎨 Variantes de couleurs

### Système d'opacité
```css
/* Backgrounds subtils */
bg-primary/10      /* 10% d'opacité */
bg-primary/20      /* 20% d'opacité */
bg-accent/5        /* 5% d'opacité */

/* Borders légers */
border-primary/30  /* 30% d'opacité */
```

### Mode sombre avec variants
```tsx
// Pattern pour mode sombre
<div className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200">
  Contenu adaptatif
</div>
```

## 🧩 Composants thématisés

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card className="hover:shadow-lg transition-shadow">
  <CardHeader>
    <CardTitle>Titre de la carte</CardTitle>
  </CardHeader>
  <CardContent>
    Contenu automatiquement thématisé
  </CardContent>
</Card>
```

### Formulaires
```tsx
import { Input } from '@/components/ui/input';

<Input 
  placeholder="Rechercher..." 
  className="bg-background border-border focus:ring-primary"
/>
```

### Navigation
```tsx
// La sidebar utilise le gradient de marque
.sidebar {
  background: var(--gradient-brand);
}
```

## 🚀 États interactifs

### Focus
```css
/* Anneaux de focus violet */
focus:ring-primary
focus:ring-primary/50
focus:border-primary
```

### Hover
```css
/* États de survol thématisés */
hover:bg-muted
hover:text-primary
hover:shadow-lg
```

## 📱 Responsive et accessibilité

### Contrastes
- ✅ Ratio WCAG AA respecté
- ✅ Texte lisible sur tous les fonds
- ✅ États d'erreur bien visibles

### Media queries
```css
/* Mode haute luminosité */
@media (prefers-contrast: high) {
  :root {
    --border: #000000;
  }
  
  [data-theme="dark"] {
    --border: #ffffff;
  }
}

/* Animation réduite */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🔍 Débogage thème

### Vérifications
1. **Contraste** : Tous les textes sont-ils lisibles ?
2. **Cohérence** : Les couleurs s'harmonisent-elles ?
3. **Réactivité** : Le changement de thème fonctionne-t-il ?
4. **Persistance** : Le thème choisi est-il sauvegardé ?

### Outils de test
- Inspecteur navigateur pour les variables CSS
- Tests de contraste automatisés
- Changement de thème système pour tester 'auto'

## 🎯 Migration des anciens composants

### Avant (couleurs hardcodées)
```tsx
<div className="bg-gray-50 text-gray-900 border-gray-300">
  <p className="text-gray-600">Texte secondaire</p>
</div>
```

### Après (tokens sémantiques)
```tsx
<div className="bg-muted text-foreground border-border">
  <p className="text-muted-foreground">Texte secondaire</p>
</div>
```

---

## 🎉 Résultat final

Le système de thème OAPET offre :
- 🎨 **Design cohérent** avec violet/rose
- 🌙 **Mode sombre parfait**
- ♿ **Accessibilité optimale** 
- 🔧 **Maintenance facilitée**
- 🚀 **Performance préservée**