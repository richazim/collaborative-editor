const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // Charger les variables d'environnement depuis le fichier .env

const app = express();
app.use(cors({
    origin: "http://localhost"
}));

const API_PORT = process.env.API_PORT || 5000;

const httpServer = http.createServer(app); // Créer un serveur http qui écoute sur le port 80 seulement
// On utilise http.createServer(app) pour pouvoir brancher WebSocket dessus, car app.listen() est une abstraction qui cache le serveur HTTP sous-jacent.

httpServer.listen(API_PORT, () => {
    console.log(`✅ Serveur HTTP démarré sur le port ${API_PORT}`);
});


let sharedTextContent = ""; // le texte qui sera partagé entre les clients

const wsServer = new WebSocket.Server({ server: httpServer }); // serveur WebSocket qui réutilise le serveur HTTP existant pour établir des connexions socket.
// Change le protocole http avec le protocole ws (websocket)
// Permet aux clients de faire les connexions "ws://"

wsServer.on("connection", (clientSocket) => { // Si un client WebSocket se connecte au serveur websocket
    console.log("🔗 Nouveau client WebSocket connecté");

    clientSocket.send(JSON.stringify({ // Envoie le contenu initial du text partagé au client
        type: "init",
        data: sharedTextContent
    }));

    clientSocket.on("message", (rawMessage) => { // Dès qu'il y'a réception d’un message provenant d'un client
        try {
            const message = JSON.parse(rawMessage);

            // Si le message envoyé est de type update, définir le contenu de ce message comme le texte partagé et puis diffuser ce message à tous les clients connecté au serveur websocket
            if (message.type === "update") {
                sharedTextContent = message.data;

                wsServer.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: "update",
                            data: sharedTextContent
                        }));
                    }
                });
            }

        } catch (error) {
            console.error("❌ Erreur lors de l'analyse du message :", error);
        }
    });

    clientSocket.on("close", () => {
        console.log("🔌 Client WebSocket déconnecté");
    });
});
