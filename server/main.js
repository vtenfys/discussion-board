const express = require('express');
const bodyParser = require('body-parser');
const greenlockExpress = require('greenlock-express');

const Message = require('./model').Message;
const db = require('./database');

async function main() {
  Message.setInitialId(await db.getLastId());

  const app = express();

  app.use(express.static('../public'));
  app.use(bodyParser.json());

  app.post('/messages/new', async (req, res) => {
    const data = req.body;
    const dateNow = new Date(Date.now());

    const message = new Message(data.message, data.author, dateNow);
    await db.insertMessage(message.id, message.data, data.sessionId);

    res.json(await db.getMessages());
    res.end();
  });

  app.get('/messages/get', async (req, res) => {
    res.json(await db.getMessages());
    res.end();
  });

  app.post('/users/signUp', async (req, res) => {
    res.json(await db.createUser(req.body));
    res.end();
  });

  app.post('/users/login', async (req, res) => {
    res.json(await db.login(req.body));
    res.end();
  });

  app.post('/users/logout', async (req, res) => {
    res.json(await db.logout(req.body));
    res.end();
  });

  app.post('/users/getStatus', async (req, res) => {
    const result = await db.getUserBySessionId(req.body.sessionId);

    res.json(result);
    res.end();
  });

  const server = greenlockExpress.create({
    version: 'draft-11',
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    email: 'david.j.b@vivaldi.net',
    agreeTos: true,
    approveDomains: ['www.davidjb.online'],
    configDir: require('path').join(require('os').homedir(), 'acme', 'etc'),
    app
  });
  server.listen(3000, 3443);
}

main();
