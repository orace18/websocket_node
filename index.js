const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const mysql = require('mysql');

const app = express();
const port = 7878;
const hostname = "192.168.0.103";

// Configurer la connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'otrip'
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
  const userID = req.url.substr(1);

 /*  ws.on('message', message => {
    console.log(message);
    const datastring = message.toString();
    if (datastring.charAt(0) === '{') {
      const data = JSON.parse(datastring);
      if (data.auth === 'chatapphdfgjd34534hjdfk' && data.cmd === 'send') {
        const positionData = {
          userID: userID,
          longitude: data.longitude,
          latitude: data.latitude
        };
        // Insérer la position dans la base de données
        const query = 'INSERT INTO positions SET ?';
        connection.query(query, positionData, (error, results, fields) => {
          if (error) {
            console.error('Error inserting position into MySQL:', error);
            ws.send('send:error');
          } else {
            console.log('Position saved in MySQL');
            ws.send('send:success');
          }
        });
      } else {
        console.log('Invalid authentication or command');
        ws.send('send:error');
      }
    } else {
      console.log('Non JSON type data');
      ws.send('error');
    }
  });
 */

  ws.on('message', message => {
    console.log(message);
    try {
      // Analyse le message JSON
      const data = JSON.parse(message);
      
      // Enregistre les données de localisation dans la base de données
      const positionData = {
        longitude: data.longitude,
        latitude: data.latitude
      };
      const query = 'INSERT INTO positions SET ?';
      connection.query(query, positionData, (error, results, fields) => {
        if (error) {
          console.error('Error inserting position into MySQL:', error);
        } else {
          console.log('Position saved in MySQL');
        }
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
      ws.send('error');
    }
  });
  
  ws.on('close', function () {
    console.log('User Disconnected: ' + userID);
  });

  ws.send('connected');
});

app.on('error', error => console.error(error));
