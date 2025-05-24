import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [sharedText, setSharedText] = useState("");

  const [webSocketConnection, setWebSocketConnection] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socketInstance = new WebSocket(import.meta.env.BASE_URL); // Lors du montage du composant, le client (navigateur) initie la connexion websocket vers le serveur

    setWebSocketConnection(socketInstance);

    socketInstance.onopen = () => { // Le client reçoit un événement onopen quand la connexion est active (le serveur est prêt pour communiquer avec lui)
      console.log("✅ Connexion WebSocket établie");
    };
    socketInstance.onmessage = (event) => { // Le client reçoit un évènement onmessage quand le serveur lui envoie une donnée
      try {
        const receivedMessage = JSON.parse(event.data);

        if (receivedMessage.type === 'init' || receivedMessage.type === 'update') {
          setSharedText(receivedMessage.data);
        }
      } catch (error) {
        console.error('❌ Erreur de parsing du message reçu :', error);
      }
    };

    socketInstance.onclose = () => { // Le client reçoit un evènement onclose au moment où le canal de communication entre le client (ex. navigateur) et le serveur est interrompu.
      console.log("🔌 Connexion WebSocket fermée");
    };

    socketInstance.onerror = (error) => {
      console.error("Erreur WebSocket :", error);
    };

    return () => {
      socketInstance.close(); // Interrompre la connexion WebSocket entre le client et le serveur lorsque le composant est démonté (retiré du dom virtuel de React).
    };
  }, []);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedText = event.target.value;

    setSharedText(updatedText);

    if (webSocketConnection && webSocketConnection.readyState === WebSocket.OPEN) { // Vérifie si la connexion websocket au serveur est ouverte pour pouvoir envoyer la donnné textuelle au serveur
      webSocketConnection.send(JSON.stringify({
        type: 'update',
        data: updatedText
      }));
    }
  };


  return (
    <div className=''>
      <h1>📝 Éditeur Collaboratif en Temps Réel</h1>

      <textarea
        value={sharedText}
        onChange={handleTextChange}
        rows={20}
        cols={80}
      />
    </div>
  );
}

export default App;
