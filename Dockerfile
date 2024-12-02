# Utiliser une image Node.js
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier uniquement package.json pour réduire les rebuilds inutiles
COPY package.json .

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers dans le conteneur
COPY . .

# Exposer un port si nécessaire
# EXPOSE 3000

# Commande de démarrage
CMD ["node", "fury-bot-monitoring.js"]
