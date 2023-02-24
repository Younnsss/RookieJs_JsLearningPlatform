# Projet étudiant

## Prérequis

Vous devez disposer d’au moins : 

- NodeJS v16 / v17 (https://nodejs.org/en/)
- MySQL (https://laragon.org/download/index.html)
- Git (https://git-scm.com/downloads)

## Installation 

```jsx
git clone https://github.com/DevNono/PE_P22

cd ./PE_P22

copy .env.example .env 

npm install

npx sequelize-cli db:migrate // Migration de la base de donnée

npx sequelize-cli db:seed:all // Seeding de la base de donnée

npm run dev // Démarrage du projet en mode développement
```

## Extensions VSCode recommandées
```
Error Lens
ESLint
DotENV
Headwind
Json
Material icon theme
TailwindCSS IntelliSense
Tailwind Docs
Twig Language 2
```

## Jeu

Le code source du jeu est disponible dans le dossier `card_game`
