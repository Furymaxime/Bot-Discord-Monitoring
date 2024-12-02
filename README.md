# Bot Discord Monitoring

Ce projet est un bot Discord qui récupère l'état des serveurs d'un jeu ou d'un service via une API externe. Il utilise `discord.js` pour interagir avec l'API de Discord et afficher des informations sur l'état des serveurs dans un canal Discord. Les statuts des serveurs sont mis à jour toutes les 10 secondes.

## Fonctionnalités

- Surveillance des serveurs via une API tierce.
- Envoi des statuts des serveurs dans un canal Discord sous forme d'embed.
- Mise à jour des statuts toutes les 10 secondes.
- Possibilité de filtrer certains serveurs à ne pas afficher.
- Gestion des erreurs en cas d'API hors ligne ou de problème de connexion.

## Prérequis

Avant d'exécuter ce bot, vous devez avoir les éléments suivants :

- **Node.js** installé sur votre machine.
- Un **bot Discord** avec son token.
- Un accès à une API qui fournit des informations sur les serveurs à surveiller (ex. : un statut des serveurs de jeux ou d'un service).

## Installation

### 1. Cloner le projet

Clonez ce dépôt GitHub sur votre machine locale :

```bash
git clone https://github.com/Furymaxime/Bot-Discord-Monitoring.git
cd Bot-Discord-Monitoring'''

### 2. Installer les dépendances
Ensuite, installez les dépendances nécessaires avec npm :
