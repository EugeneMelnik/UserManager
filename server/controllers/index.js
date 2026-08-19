const {
  online,
  offline,
  unblockUsers,
  blockUsers
} = require('../queries/updateUser');
const { createUser } = require('../queries/createUser');
const { Router } = require('express');
const { executeQuery } = require('../DB');
const jwt = require('jsonwebtoken');
const { find, findAll } = require('../queries/find');
const { jwtMiddleware } = require('../middleware/jwt.middleware');
const { deleteUsers } = require('../queries/deleteUsers');

const router = Router();
let socketServer;

const setSocketServer = (io) => {
  socketServer = io;
};

const broadcast = (event, payload) => {
  socketServer?.emit(event, payload);
};

router.put('/api/login', async (req, res) => {
  let login = req.body.login;
  let password = req.body.password;

  const authorizationHeader = req.header('authorization');

  if (!login && !password && authorizationHeader) {
    const [, accessToken] = authorizationHeader.split(' ');

    const payload = jwt.decode(accessToken, process.env.JWT_SECRET);

    login = payload.login;
    password = payload.password;
  }

  try {
    const [user] = await executeQuery(find(login, password));

    if (!user) {
      return res.status(401).send('Unauthorized!');
    }

    if (user.state === 'blocked') {
      return res.status(403).send('User was blocked!');
    }

    await executeQuery(online(user.id));
    broadcast('user_updated', { ids: [user.id], state: 'online' });

    const accessToken = jwt.sign(
      { id: user.id, login: user.login, password: user.password },
      process.env.JWT_SECRET,
      { expiresIn: 3600 }
    );

    return res.status(200).send({
      accessToken,
      user
    });
  } catch (error) {
    return res.status(400).send(`Login failed: ${error.message}`);
  }
});

router.post('/api/signup', async (req, res) => {
  try {
    await executeQuery(createUser(req.body));

    const [createdUser] = await executeQuery(
      find(req.body.login, req.body.password)
    );
    const { password: _, ...user } = createdUser;

    broadcast('user_created', user);

    return res.status(201).send({ message: 'User was created successfully!' });
  } catch (error) {
    return res.status(400).send(`Signup failed: ${error.message}`);
  }
});

router.put('/api/logout', jwtMiddleware, async (req, res) => {
  const [, accessToken] = req.header('authorization').split(' ');

  try {
    const { id } = jwt.decode(accessToken, process.env.JWT_SECRET);

    await executeQuery(offline(id));
    broadcast('user_updated', { ids: [id], state: 'offline' });

    return res.status(200).send({ message: 'Bye-Bye!' });
  } catch (error) {
    return res.status(400).send(`Logout failed: ${error.message}`);
  }
});

router.get('/api/users', jwtMiddleware, async (req, res) => {
  const [, accessToken] = req.header('authorization').split(' ');

  try {
    const { id } = jwt.decode(accessToken, process.env.JWT_SECRET);

    const users = await executeQuery(findAll(id));

    return res.status(200).send({ accessToken: res.locals.accessToken, users });
  } catch (error) {
    return res.status(400).send(`Get all users failed: ${error.message}`);
  }
});

router.put('/api/block', jwtMiddleware, async (req, res) => {
  const ids = req.body;

  try {
    await executeQuery(blockUsers(ids));
    broadcast('user_updated', { ids, state: 'blocked' });

    return res
      .status(200)
      .send({ accessToken: res.locals.accessToken, message: `Success!!!` });
  } catch (error) {
    return res
      .status(400)
      .send({ message: `Block users failed: ${error.message}` });
  }
});

router.put('/api/unblock', jwtMiddleware, async (req, res) => {
  const ids = req.body;

  try {
    const query = unblockUsers(ids);

    await executeQuery(query);
    broadcast('user_updated', { ids, state: 'offline' });

    return res
      .status(200)
      .send({ accessToken: res.locals.accessToken, message: `Success!!!` });
  } catch (error) {
    return res
      .status(400)
      .send({ message: `Unblock users failed: ${error.message}` });
  }
});

router.delete('/api/delete', jwtMiddleware, async (req, res) => {
  const ids = req.body;

  try {
    await executeQuery(deleteUsers(ids));
    broadcast('user_deleted', { ids });

    return res
      .status(200)
      .send({ accessToken: res.locals.accessToken, message: `Success!!!` });
  } catch (error) {
    return res
      .status(400)
      .send({ message: `Delete users failed: ${error.message}` });
  }
});

module.exports = router;
module.exports.setSocketServer = setSocketServer;
