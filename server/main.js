const express = require('express');
const bodyParser = require('body-parser');
const greenlockExpress = require('greenlock-express');

const db = require('./database');

async function main() {
  const app = express();

  app.use(express.static('../public'));
  app.use(bodyParser.json());

  app.post('/messages/new', async (req, res) => {
    const data = req.body;
    const dateNow = new Date(Date.now());

    await db.insertMessage(data.sessionId, {
      _id: await db.getLastId() + 1,
      message: data.message,
      date: dateNow
    });

    res.json(await db.getMessages());
    res.end();
  });

  app.post('/messages/delete', async (req, res) => {
    res.json(await db.deleteMessage(req.body));
    res.end();
  });

  app.post('/messages/edit', async (req, res) => {
    res.json(await db.editMessage(req.body));
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

  const devel = true;

  if (devel) {
    app.listen(3000, () => console.log('Discussion board server running on port 3000!'));
  } else {
    const server = greenlockExpress.create({
      version: 'draft-11',
      server: 'https://acme-v02.api.letsencrypt.org/directory',
      email: 'david.j.b@vivaldi.net',
      agreeTos: true,
      approveDomains: ['discussion.davidjb.online'],
      configDir: require('path').join(require('os').homedir(), 'acme', 'etc'),
      app
    });
    server.listen(3000, 3443);
  }
}

main();
