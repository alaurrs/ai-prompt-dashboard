# Structure du Projet - AI Prompt Dashboard

## Arborescence Complète

```
ai-prompt-dashboard/
├── .angular/                          # Fichiers de cache Angular
├── .editorconfig                      # Configuration de l'éditeur
├── .git/                              # Dépôt Git
├── .gitignore                         # Fichiers ignorés par Git
├── .idea/                             # Configuration JetBrains IDE
├── .vscode/                           # Configuration VS Code
├── angular.json                       # Configuration Angular CLI
├── dist/                              # Fichiers de build (générés)
├── node_modules/                      # Dépendances npm
├── package-lock.json                  # Verrouillage des versions npm
├── package.json                       # Dépendances et scripts npm
├── README.md                          # Documentation du projet
├── tsconfig.json                      # Configuration TypeScript racine
├── tsconfig.app.json                  # Configuration TypeScript pour l'app
├── tsconfig.spec.json                 # Configuration TypeScript pour les tests
│
├── public/                            # Ressources statiques publiques
│   └── favicon.ico                    # Icône de l'application
│
└── src/                               # Code source de l'application
    ├── index.html                     # Page HTML principale
    ├── main.ts                        # Point d'entrée de l'application
    ├── styles.css                     # Fichier de styles global
    │
    ├── app/                           # Module principal de l'application
    │   ├── app.config.ts              # Configuration de l'application
    │   ├── app.css                    # Styles du composant App
    │   ├── app.html                   # Template du composant App
    │   ├── app.routes.ts              # Configuration des routes
    │   ├── app.spec.ts                # Tests du composant App
    │   ├── app.ts                     # Composant App principal
    │   │
    │   ├── core/                      # Fonctionnalités core de l'application
    │   │   ├── adapters/              # Adaptateurs pour les services externes
    │   │   │   ├── adapter.types.ts   # Types pour les adaptateurs
    │   │   │   └── mock.adapter.ts    # Adaptateur mock pour les tests
    │   │   │
    │   │   ├── models/                # Modèles de données
    │   │   │   ├── app-settings.model.ts           # Modèle des paramètres de l'app
    │   │   │   ├── chat-message-input.model.ts     # Modèle d'entrée de message
    │   │   │   ├── chat-message.model.ts           # Modèle de message de chat
    │   │   │   ├── chat-request.model.ts           # Modèle de requête de chat
    │   │   │   ├── chat-thread.model.ts            # Modèle de fil de conversation
    │   │   │   ├── prompt-template.model.ts        # Modèle de template de prompt
    │   │   │   ├── provided-settings.model.ts      # Modèle des paramètres fournis
    │   │   │   └── role.model.ts                   # Modèle de rôle utilisateur
    │   │   │
    │   │   └── services/              # Services métier
    │   │       ├── chat.service.ts    # Service de gestion du chat
    │   │       └── storage.service.ts # Service de stockage local
    │   │
    │   ├── features/                  # Fonctionnalités métier
    │   │   └── chat/                  # Feature Chat
    │   │       ├── chat.page.html     # Template de la page de chat
    │   │       ├── chat.page.scss     # Styles de la page de chat
    │   │       └── chat.page.ts       # Logique de la page de chat
    │   │
    │   └── shared/                    # Composants et utilitaires partagés
    │       └── ui/                    # Composants UI réutilisables
    │           └── app-shell/         # Composant Shell de l'application
    │               ├── app-shell.component.html  # Template du shell
    │               ├── app-shell.component.scss  # Styles du shell
    │               └── app-shell.component.ts    # Logique du shell
    │
    └── styles/                        # Système de design et styles globaux
        ├── index.scss                 # Point d'entrée des styles
        ├── fonts.css                  # Polices personnalisées
        ├── _reset.scss                # Reset CSS
        ├── _primitives.scss           # Variables et primitives CSS
        │
        ├── components/                # Styles des composants
        │   ├── _button.scss           # Styles des boutons
        │   ├── _buttons.scss          # Styles supplémentaires boutons
        │   ├── _card.scss             # Styles des cartes
        │   ├── _checkbox.scss         # Styles des checkboxes
        │   ├── _dialog.scss           # Styles des dialogues
        │   ├── _input.scss            # Styles des inputs
        │   ├── _list.scss             # Styles des listes
        │   ├── _select.scss           # Styles des selects
        │   ├── _tabs.scss             # Styles des onglets
        │   └── _textarea.scss         # Styles des textareas
        │
        └── theme/                     # Système de tokens de design
            └── _tokens.scss           # Design tokens (couleurs, espacements, etc.)
```

## Organisation du Projet

### 📁 Structure par Couches

#### **Core** (`src/app/core/`)
Contient la logique métier fondamentale de l'application :
- **Adapters** : Interfaces avec les services externes (API, mock)
- **Models** : Définitions des types et structures de données
- **Services** : Services singleton partagés dans toute l'app

#### **Features** (`src/app/features/`)
Modules fonctionnels de l'application :
- **Chat** : Gestion complète de l'interface de chat et des conversations

#### **Shared** (`src/app/shared/`)
Composants, directives et utilitaires réutilisables :
- **UI Components** : Composants d'interface communs (app-shell, etc.)

#### **Styles** (`src/styles/`)
Système de design centralisé :
- **Theme** : Tokens de design (variables CSS)
- **Components** : Styles des composants PrimeNG et custom
- **Primitives & Reset** : Fondations CSS

### 🛠️ Technologies Utilisées

- **Framework** : Angular (version standalone components)
- **UI Library** : PrimeNG (unstyled mode)
- **CSS** : SCSS + Tailwind CSS + TailwindCSS PrimeUI
- **State Management** : Angular Signals
- **Storage** : LocalStorage via service custom

### 📝 Conventions de Nommage

- **Composants** : `*.component.ts` (avec fichiers `.html` et `.scss` séparés)
- **Pages** : `*.page.ts` (features principales)
- **Services** : `*.service.ts`
- **Models** : `*.model.ts`
- **Styles partiels** : `_*.scss` (partials SCSS)

---

*Dernière mise à jour : Octobre 2025*

