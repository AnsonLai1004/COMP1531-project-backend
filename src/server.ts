import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { channelInviteV3, channelMessagesV3, channelDetailsV2, channelJoinV2, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { authRegisterV3, authLoginV3, authLogoutV2 } from './auth';
import { channelsCreateV3, channelsListallV3, channelsListV3 } from './channels';
import { messageSendV2, messageRemoveV2, messageEditV2, dmMessagesV2, messageSendDmV2 } from './message';

import { dmListV2, dmRemoveV2, dmLeaveV1, dmCreateV1, dmDetailsV1 } from './dm';
import { clearV1 } from './other';
import { fileLoadData } from './data';

import { userProfileV3, usersAllV2, userSetNameV2, userSetEmailV2, userSetHandleV2 } from './users';

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

/// /////////////////////////// ITERATION 3 /////////////////////////////////////
app.post('/channels/create/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { name, isPublic } = req.body;
    res.json(channelsCreateV3(token, name, isPublic));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/list/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(channelsListV3(token));
  } catch (err) {
    next(err);
  }
});

app.get('/channels/listall/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(channelsListallV3(token));
  } catch (err) {
    next(err);
  }
});
/// /////////////////////////////////////////////////////////////////////////////

// auth routes
app.post('/auth/login/v3', (req, res) => {
  const { email, password } = req.body;
  res.json(authLoginV3(email, password));
});

app.post('/auth/register/v3', (req, res) => {
  const { email, password, nameFirst, nameLast } = req.body;
  res.json(authRegisterV3(email, password, nameFirst, nameLast));
});

app.post('/auth/logout/v2', (req, res) => {
  const token = req.headers.token as string;
  res.json(authLogoutV2(token));
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

app.post('/channel/invite/v3', (req, res) => {
  const { uId, token, channelId } = req.body;
  res.json(channelInviteV3(token, channelId, uId));
});

app.get('/channel/messages/v3', (req, res) => {
  const start = parseInt((req.query.start) as string);
  const channelId = parseInt((req.query.channelId) as string);
  const token = req.query.token as string;
  res.json(channelMessagesV3(token, channelId, start));
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
app.get('/user/profile/v3', (req, res) => {
  const uId = parseInt((req.query.uId) as string);
  const token = req.headers.token as string;
  res.json(userProfileV3(token, uId));
});

app.get('/users/all/v2', (req, res) => {
  const token = req.headers.token as string;
  res.json(usersAllV2(token));
});

app.put('/user/profile/setname/v2', (req, res) => {
  const { nameFirst, nameLast } = req.body;
  const token = req.headers.token as string;
  res.json(userSetNameV2(token, nameFirst, nameLast));
});

app.put('/user/profile/setemail/v2', (req, res) => {
  const { email } = req.body;
  const token = req.headers.token as string;
  res.json(userSetEmailV2(token, email));
});

app.put('/user/profile/sethandle/v2', (req, res) => {
  const { handleStr } = req.body;
  const token = req.headers.token as string;
  res.json(userSetHandleV2(token, handleStr));
});

// message routes

app.post('/message/send/v2', (req, res) => {
  const { token, channelId, message } = req.body;
  res.json(messageSendV2(token, channelId, message));
});

app.put('/message/edit/v2', (req, res) => {
  const { token, messageId, message } = req.body;
  res.json(messageEditV2(token, messageId, message));
});

app.delete('/message/remove/v2', (req, res) => {
  const messageId = parseInt((req.query.messageId) as string);
  const token = req.query.token as string;
  res.json(messageRemoveV2(token, messageId));
});

// dm routes
app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(dmListV2(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = parseInt(req.query.dmId as string);
    res.json(dmRemoveV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/create/v1', (req, res) => {
  const { token, uIds } = req.body;
  res.json(dmCreateV1(token, uIds));
});

app.get('/dm/details/v1', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt((req.query.dmId) as string);
  res.json(dmDetailsV1(token, dmId));
});

app.post('/message/senddm/v2', (req, res) => {
  const { token, dmId, message } = req.body;
  res.json(messageSendDmV2(token, dmId, message));
});

app.get('/dm/messages/v2', (req, res) => {
  const token = req.query.token as string;
  const dmId = parseInt((req.query.dmId) as string);
  const start = parseInt((req.query.start) as string);
  res.json(dmMessagesV2(token, dmId, start));
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
