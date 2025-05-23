const express = require("express");
const http = require("http");
const websocket = require("ws");
const cors = require("cors");
const dotenv = require("dotenv")

dotenv.config()

const app = express();
app.use(cors({
    origin: 'http://localhost:3000'
}))


const PORT = process.env.API_PORT;
const server = http.createServer(app) || 5000;

server.listen(PORT, ()=>{
    console.log(`Le serveur écoute sur le port ${PORT}`);
})


const websocketServer = new websocket.Server({
    server: server
})

websocketServer.on('connection', (ws) =>{
    console.log("Nouveau Client Connecté à notre websocket");

    ws.on('close', () => {
        console.log('Client déconnecté')
    })
})