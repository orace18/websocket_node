const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const mysql = require('mysql');
const dotenv = require('dotenv'); 
dotenv.config(); 

const app = express();
const port = process.env.PORT || 7878; 
const hostname = process.env.HOSTNAME || '192.168.0.107'; 

const dbConfig = require('./databases/configDatabase');

const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});


const routes = require('./routes/routes');

app.use('/', routes);

const server = http.createServer(app);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const wss = new WebSocket.Server({ server });

wss.on('connection', function (ws, req) {
  ws.on('message', message => {
    try {
      const data = JSON.parse(message);
      const { userId, longitude, latitude } = data;

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
