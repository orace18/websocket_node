const https = require('https');
const { createServer } = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const moment = require('moment');

module.exports = ({ app }) => new Promise((resolve, reject) => {
  const port = 5000;
  const hostname = '192.168.0.107';

  if (app.get('env') === 'development') {
    const server = createServer(app);

    const wss = new WebSocket.Server({ server }); 

    const webSockets = {};

    wss.on('connection', function (ws, req) {
      var userID = req.url.substr(1); 
      webSockets[userID] = ws; 

      console.log('User ' + userID + ' Connected ');

      ws.on('message', message => {
        console.log(message);
        var datastring = message.toString();
        if (datastring.charAt(0) == '{') {
          datastring = datastring.replace(/'/g, '"');
          var data = JSON.parse(datastring);
          if (data.auth == 'chatapphdfgjd34534hjdfk') {
            if (data.cmd == 'send') {
              var boardws = webSockets[data.userid]; 
              if (boardws) {
                var positionData = {
                  longitude: data.longitude,
                  latitude: data.latitude
                };
                boardws.send(JSON.stringify(positionData));
                ws.send(data.cmd + ':success');
              } else {
                console.log('No receiver user found.');
                ws.send(data.cmd + ':error');
              }
            } else {
              console.log('No send command');
              ws.send(data.cmd + ':error');
            }
          } else {
            console.log('App Authentication error');
            ws.send(data.cmd + ':error');
          }
        } else {
          console.log('Non JSON type data');
          ws.send(data.cmd + ':error');
        }
      });

      ws.on('close', function () {
        var userID = req.url.substr(1);
        delete webSockets[userID]; // on connection close, remove receiver from connection list
        console.log('User Disconnected: ' + userID);
      });

      ws.send('connected'); // initial connection return message
    });

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
      resolve(server);
    });

    server.on('error', error => reject({ error, port }));
  } else {
    const option = {
      key: fs.readFileSync(path.join('keys', 'server.key'), 'utf-8'),
      cert: fs.readFileSync(path.join('keys', 'server.cert'), 'utf-8'),
    };

    const server = https.createServer(option, app);

    server.listen(port, hostname);
    server.on('listening', () => resolve(server));
    server.on('error', error => reject({ error, port }));
  }
});
