require('dotenv').config();  // Charge les variables d'environnement du fichier .env

const { Client, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const client = new Client({ intents: [] });

const token = process.env.DISCORD_TOKEN; // Récupère le token Discord
const channelId = process.env.CHANNEL_ID; // Récupère l'ID du canal
const apiKey = process.env.API_KEY; // Récupère la clé API
const statusAPI = process.env.STATUS_API; // URL de l'API de statut des serveurs

// Fonction pour récupérer l'état des serveurs
async function fetchStatus() {
  try {
    // Récupère les données depuis l'API avec authentification et timeout de 10 secondes
    const response = await axios.get(statusAPI, {
      auth: {
        username: '', // Nom d'utilisateur vide
        password: apiKey,
      },
      timeout: 10000, // Timeout de 10 secondes
    });

    // Récupère les métriques et les filtre
    const metrics = response.data;
    const statusLines = metrics.split('\n').filter(line => line.startsWith('monitor_status'));
    const responseTimeLines = metrics.split('\n').filter(line => line.startsWith('monitor_response_time'));

    // Variables pour suivre l'état global des serveurs
    let allOnline = true;
    let someOffline = false;
    let someMaintenance = false;

    // Création de l'embed pour afficher les statuts
    const embed = new EmbedBuilder()
      .setFooter({ text: 'Mis à jour toutes les 10 secondes' }); // Footer indiquant la fréquence de mise à jour

    // Contenu de la liste des serveurs
    let listContent = '';

    // Boucle à travers les lignes de statut des serveurs
    statusLines.forEach(line => {
      const regex = /monitor_status\{monitor_name="([^"]+)",monitor_type="([^"]+)",monitor_url="([^"]+)",monitor_hostname="([^"]+)",monitor_port="([^"]+)"\} (\d+)/;
      const match = line.match(regex);

      if (match) {
        const [, name, type, url, hostname, port, status] = match;

        // Exclure les serveurs nommés "Serveurs de Fury" (comparaison insensible à la casse)
        if (name.toLowerCase().includes('serveurs de fury')) {
          return; // Passer au serveur suivant
        }

        let statusEmoji;
        let statusText;
        // Déterminer le statut du serveur (en ligne, hors ligne, en maintenance, etc.)
        switch (parseInt(status)) {
          case 1:
            statusEmoji = '<a:online:1306558979337621546>';
            statusText = 'En ligne';
            break;
          case 0:
            statusEmoji = '<a:offline:1306559110325731348>';
            statusText = 'Hors ligne';
            allOnline = false;
            someOffline = true;
            break;
          case 2:
            statusEmoji = '<a:loading:1306555780794941461>';
            statusText = 'En attente';
            break;
          case 3:
            statusEmoji = '<a:alert:1306887871151607862>';
            statusText = 'En maintenance';
            someMaintenance = true;
            break;
          default:
            statusEmoji = '<a:question2:1306889124954767372>';
            statusText = 'Inconnu';
        }

        // Recherche du temps de réponse associé au serveur
        const responseTimeLine = responseTimeLines.find(rtLine =>
          rtLine.includes(`monitor_name="${name}"`)
        );

        let responseTimeText = "N/A";
        if (responseTimeLine) {
          const responseTimeMatch = responseTimeLine.match(/(\d+\.\d+|\d+)$/);
          if (responseTimeMatch) {
            responseTimeText = `${responseTimeMatch[0]} ms`;
          }
        }

        // Ajouter les détails du serveur à la liste
        listContent += `**${statusEmoji} ${name} **\n${statusText}\nPing : ${responseTimeText}\n\n`;
      }
    });

    // Déterminer la couleur et le titre de l'embed en fonction de l'état global des serveurs
    if (someMaintenance && someOffline) {
      embed.setColor(0xFF4500); // OrangeRed si certains serveurs sont hors ligne et en maintenance
      embed.setTitle('Certains serveurs sont en maintenance et hors ligne');
    } else if (someMaintenance) {
      embed.setColor(0x0000FF); // Bleu si certains serveurs sont en maintenance
      embed.setTitle('Certains serveurs sont en maintenance');
    } else if (allOnline) {
      embed.setColor(0x00FF00); // Vert si tous les serveurs sont en ligne
      embed.setTitle('Tous les serveurs sont en ligne');
    } else if (someOffline) {
      embed.setColor(0xFF0000); // Rouge si certains serveurs sont hors ligne
      embed.setTitle('Certains serveurs sont hors ligne');
    } else {
      embed.setColor(0xFFA500); // Orange si l'état des serveurs est inconnu
      embed.setTitle('État inconnu des serveurs');
    }

    // Ajouter la liste des serveurs à la description de l'embed
    embed.setDescription(`${listContent}\n\n[Voir le détails de la disponibilité des serveurs Fury](http://XXXXXXXXXXX/)`);

    return embed;
  } catch (error) {
    // Gestion des erreurs (URL ne répond pas ou timeout)
    console.error('Erreur lors de la récupération des données de l\'API:', error);

    // Si l'URL ne répond pas, on force l'état à "En attente"
    let listContent = '**Les serveurs peuvent fonctionner normalement.**\n\n';

    // Ajout de la liste des serveurs forcée à "En attente"
    const servers = [
      { name: 'SHOP-FURY', statusEmoji: '<a:loading:1306555780794941461>', statusText: 'Actuellement non monitoré', responseTime: 'N/A' },
      { name: 'SHOP RETRO-FURY', statusEmoji: '<a:loading:1306555780794941461>', statusText: 'Actuellement non monitoré', responseTime: 'N/A' },
      { name: 'RETROARCH-FURY', statusEmoji: '<a:loading:1306555780794941461>', statusText: 'Actuellement non monitoré', responseTime: 'N/A' },
      { name: 'LANPLAY-FURY', statusEmoji: '<a:loading:1306555780794941461>', statusText: 'Actuellement non monitoré', responseTime: 'N/A' },
      { name: 'DBI-FURY', statusEmoji: '<a:loading:1306555780794941461>', statusText: 'Actuellement non monitoré', responseTime: 'N/A' },
    ];

    servers.forEach(server => {
      listContent += `**${server.statusEmoji} ${server.name} **\n${server.statusText}\nPing : ${server.responseTime}\n\n`;
    });

    // Création de l'embed avec statut forcé à "En attente"
    const embed = new EmbedBuilder()
      .setColor(0xFFFF00) // Jaune pour injoignabilité
      .setTitle('Monitoring injoignable')
      .setDescription(`${listContent}\n\n[Voir le détails de la disponibilité des serveurs Fury](http://XXXXXXXXXXX/)`)
      .setFooter({ text: 'Mis à jour toutes les 10 secondes' });

    return embed;
  }
}

// Quand le bot est prêt, exécutez cette fonction
client.on('ready', async () => {
  console.log('Bot connecté avec succès');

  // Récupérer le canal où envoyer les messages
  const channel = await client.channels.fetch(channelId);

  async function updateEmbed() {
    const embed = await fetchStatus();

    if (embed) {
      // Récupérer les messages existants du bot dans le canal
      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(msg => msg.author.id === client.user.id);

      if (botMessage) {
        // Si un message existe déjà, le mettre à jour
        await botMessage.edit({ embeds: [embed] });
      } else {
        // Sinon, créer un nouveau message avec l'embed
        await channel.send({ embeds: [embed] });
      }
      console.log('Statuts mis à jour.');
    } else {
      console.log('Aucun statut disponible.');
    }
  }

  // Rafraîchir les statuts toutes les 10 secondes
  setInterval(updateEmbed, 10000); // Mettre à jour toutes les 10 secondes
});

// Connexion du bot avec le token Discord
client.login(token);
