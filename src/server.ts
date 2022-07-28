import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import HTTPError from 'http-errors';
import errorHandler from 'middleware-http-errors';

import { channelInviteV2, channelMessagesV2, channelDetailsV2, channelJoinV2, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { authRegisterV2, authLoginV2, authLogoutV1 } from './auth';
import { channelsCreateV2, channelsListV2, channelsListallV2 } from './channels';
import { messageSendV1, messageRemoveV1, messageEditV1, dmMessagesV1, messageSendDmV1 } from './message';

import { dmLeaveV1, dmRemoveV1, dmListV1, dmCreateV1, dmDetailsV1 } from './dm';
import { clearV1 } from './other';
import { fileLoadData } from './data';

import { userProfileV2, usersAllV1, userSetNameV1, userSetEmailV1, userSetHandleV1 } from './users';

// Set up web app, use JSON
const app = express();
app.use(express.json());
// Use middleware that allows for access from other domains
app.use(cors());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

app.get('/echo', (req, res, next) => {
  try {
    const data = req.query.echo as string;
    return res.json(echo(data));
  } catch (err) {
    next(err);
  }
});

// for logging errors
app.use(morgan('dev'));

// auth routes
app.post('/auth/login/v2', (req, res) => {
  const { email, password } = req.body;
  res.json(authLoginV2(email, password));
});

app.post('/auth/register/v2', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV2(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v1', (req, res) => {
  const { token } = req.body;
  res.json(authLogoutV1(token));
});

// channels routes
app.post('/channels/create/v2', (req, res, next) => {
  try {
    const { token, name, isPublic } = req.body;
    const ret = channelsCreateV2(token, name, isPublic);
    res.json(ret)
  } catch(err) {
    console.log(err)
    throw err;
  }
});

app.get('/channels/list/v2', (req, res) => {
  try {
    const token = req.query.token as string;
    res.json(channelsListV2(token));
  } catch(err) {
    throw err;
  }
});

app.get('/channels/listall/v2', (req, res) => {
  try {
    const token = req.query.token as string;
    res.json(channelsListallV2(token));
  } catch(err) {
    throw err;
  }
});

// channel routes
app.get('/channel/details/v2', (req, res) => {
  const channelId = parseInt((req.query.channelId) as string);
  const token = req.query.token as string;
  res.json(channelDetailsV2(token, channelId));
});

app.post('/channel/join/v2', (req, res) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV2(token, channelId));
});

app.post('/channel/invite/v2', (req, res) => {
  const { uId, token, channelId } = req.body;
  res.json(channelInviteV2(token, channelId, uId));
});

app.get('/channel/messages/v2', (req, res) => {
  const start = parseInt((req.query.start) as string);
  const channelId = parseInt((req.query.channelId) as string);
  const token = req.query.token as string;
  res.json(channelMessagesV2(token, channelId, start));
});

app.post('/channel/leave/v1', (req, res) => {
  const { token, channelId } = req.body;
  res.json(channelLeaveV1(token, channelId));
});

app.post('/channel/addowner/v1', (req, res) => {
  const { token, channelId, uId } = req.body;
  res.json(channelAddownerV1(token, channelId, uId));
});

app.post('/channel/removeowner/v1', (req, res) => {
  const { token, channelId, uId } = req.body;
  res.json(channelRemoveownerV1(token, channelId, uId));
});

// user(s) routes
app.get('/user/profile/v2', (req, res) => {
  const uId = parseInt((req.query.uId) as string);
  const token = req.query.token as string;
  res.json(userProfileV2(token, uId));
});

app.get('/users/all/v1', (req, res) => {
  const token = req.query.token as string;
  res.json(usersAllV1(token));
});

app.put('/user/profile/setname/v1', (req, res) => {
  const { token, nameFirst, nameLast } = req.body;
  res.json(userSetNameV1(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v1', (req, res) => {
  const { token, email } = req.body;
  res.json(userSetEmailV1(token, email));
});

app.put('/user/profile/sethandle/v1', (req, res) => {
  const { token, handleStr } = req.body;
  res.json(userSetHandleV1(token, handleStr));
});

// message routes

app.post('/message/send/v1', (req, res) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV1(token, channelId, message));
});

app.put('/message/edit/v1', (req, res) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV1(token, messageId, message));
});

app.delete('/message/remove/v1', (req, res) => {
  const messageId = parseInt((req.query.messageId) as string);
  const token = req.query.token as string;
  res.json(messageRemoveV1(token, messageId));
});

// dm routes
app.post('/dm/create/v1', (req, res) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/details/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt((req.query.dmId) as string);
  res.json(dmDetailsV1(token, dmId));
});

app.post('/message/senddm/v1', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV1(token, dmId, message));
});

app.get('/dm/messages/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt((req.query.dmId) as string);
  const start = parseInt((req.query.start) as string);
  res.json(dmMessagesV1(token, dmId, start));
});

app.get('/dm/list/v1', (req, res) => {
  try {
    const token = req.query.token as string;
    res.json(dmListV1(token));
  } catch(err) {
    throw err;
  }
  
});

app.delete('/dm/remove/v1', (req, res) => {
  try {
    const token = req.query.token as string;
    const dmId = parseInt(req.query.dmId as string);
    res.json(dmRemoveV1(token, dmId));
  } catch(err) {
    throw err;
  }
});

app.post('/dm/leave/v1', (req, res) => {
  const { token, dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});

// other routes
app.delete('/clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

// handles errors nicely
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
  // auto-load saved data on server start
  fileLoadData();
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
