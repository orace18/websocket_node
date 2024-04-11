const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const mysql = require('mysql');

const app = express();
const port = 7878;
const hostname = "192.168.0.107";

// Configurer la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Le nom votre base de données'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  res.send('Hello World');
});

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', function (ws, req) {
  
  ws.on('message', message => {
    try {
      // Analyse le message JSON
      const data = JSON.parse(message);
      
      // Extrayez les données de localisation
      const { userId, longitude, latitude } = data;

      // Mettre à jour la base de données
      const query = 'UPDATE users SET positions = JSON_SET(positions, "$.longitude", ?, "$.latitude", ?) WHERE id = ?';
      connection.query(query, [longitude, latitude, userId], (error, results, fields) => {
        if (error) {
          console.error('Error updating user position in MySQL:', error);
        } else {
          console.log('User position updated in MySQL');
        }
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
  
  ws.on('close', function () {
    console.log('User Disconnected');
  });

  ws.send('connected', function(){
    console.log('User connected');
  });
});

app.on('error', error => console.error(error));
