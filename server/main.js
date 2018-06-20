const express = require('express');
const bodyParser = require('body-parser');

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

  app.listen(3000, () => console.log('Discussion board server running on port 3000!'));
}

main();
