import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';

import { channelInviteV3, channelMessagesV3, channelDetailsV3, channelJoinV3, channelLeaveV2, channelAddownerV2, channelRemoveownerV2 } from './channel';

import { authRegisterV3, authLoginV3, authLogoutV2 } from './auth';
import { channelsCreateV3, channelsListallV3, channelsListV3 } from './channels';
import { messageUnpin, messagePin, messagesSearch, messageSendV2, messageRemoveV2, messageEditV2, dmMessagesV2, messageSendDmV2, messageSendLater, messageSendLaterDM } from './message';
import { standupSendV1, standupActiveV1, standupStartV1 } from './standups';
import { dmLeaveV1, dmRemoveV1, dmListV1, dmCreateV2, dmDetailsV2 } from './dm';
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

/// /////////////////////////// ITERATION 3 /////////////////////////////////////////////////////////
// standup routes
app.post('/standup/start/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, length } = req.body;
    res.json(standupStartV1(token, channelId, length));
  } catch (err) {
    console.log(err);
    next(err);
  }
});

app.get('/standup/active/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = parseInt(req.query.channelId as string);
    res.json(standupActiveV1(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/standup/send/v1', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId, message } = req.body;
    res.json(standupSendV1(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

// dm routes
app.post('/dm/create/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { uIds } = req.body;
    res.json(dmCreateV2(token, uIds));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/details/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = parseInt((req.query.dmId) as string);
    res.json(dmDetailsV2(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/list/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    res.json(dmListV1(token));
  } catch (err) {
    next(err);
  }
});

app.delete('/dm/remove/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const dmId = parseInt(req.query.dmId as string);
    res.json(dmRemoveV1(token, dmId));
  } catch (err) {
    next(err);
  }
});

app.post('/dm/leave/v2', (req, res) => {
  const token = req.headers.token as string;
  const { dmId } = req.body;
  res.json(dmLeaveV1(token, dmId));
});

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

// channel routes
app.get('/channel/details/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const channelId = parseInt((req.query.channelId) as string);
    res.json(channelDetailsV3(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/join/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    res.json(channelJoinV3(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/invite/v3', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { uId, channelId } = req.body;
    res.json(channelInviteV3(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.get('/channel/messages/v3', (req, res, next) => {
  try {
    const start = parseInt((req.query.start) as string);
    const channelId = parseInt((req.query.channelId) as string);
    const token = req.headers.token as string;
    res.json(channelMessagesV3(token, channelId, start));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/leave/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { channelId } = req.body;
    res.json(channelLeaveV2(token, channelId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/addowner/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { uId, channelId } = req.body;
    res.json(channelAddownerV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

app.post('/channel/removeowner/v2', (req, res, next) => {
  try {
    const token = req.headers.token as string;
    const { uId, channelId } = req.body;
    res.json(channelRemoveownerV2(token, channelId, uId));
  } catch (err) {
    next(err);
  }
});

// message routes
app.post('/message/send/v2', (req, res, next) => {
  try {
    const { channelId, message } = req.body;
    const token = req.headers.token as string;
    res.json(messageSendV2(token, channelId, message));
  } catch (err) {
    next(err);
  }
});

app.put('/message/edit/v2', (req, res, next) => {
  try {
    const { messageId, message } = req.body;
    const token = req.headers.token as string;
    res.json(messageEditV2(token, messageId, message));
  } catch (err) {
    next(err);
  }
});

app.delete('/message/remove/v2', (req, res, next) => {
  try {
    const messageId = parseInt((req.query.messageId) as string);
    const token = req.headers.token as string;
    res.json(messageRemoveV2(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/senddm/v2', (req, res, next) => {
  try {
    const { dmId, message } = req.body;
    const token = req.headers.token as string;
    res.json(messageSendDmV2(token, dmId, message));
  } catch (err) {
    next(err);
  }
});

app.post('/message/pin/v1', (req, res, next) => {
  try {
    const { messageId } = req.body;
    const token = req.headers.token as string;
    res.json(messagePin(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.post('/message/unpin/v1', (req, res, next) => {
  try {
    const { messageId } = req.body;
    const token = req.headers.token as string;
    res.json(messageUnpin(token, messageId));
  } catch (err) {
    next(err);
  }
});

app.get('/dm/messages/v2', (req, res, next) => {
  try {
    const dmId = parseInt((req.query.dmId) as string);
    const start = parseInt((req.query.start) as string);
    const token = req.headers.token as string;
    res.json(dmMessagesV2(token, dmId, start));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlater/v1', (req, res, next) => {
  try {
    const { channelId, message, timeSent } = req.body;
    const token = req.headers.token as string;
    res.json(messageSendLater(token, channelId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

app.post('/message/sendlaterdm/v1', (req, res, next) => {
  try {
    const { dmId, message, timeSent } = req.body;
    const token = req.headers.token as string;
    res.json(messageSendLaterDM(token, dmId, message, timeSent));
  } catch (err) {
    next(err);
  }
});

/// ////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

// search route
app.get('/search/v1', (req, res, next) => {
  try {
    const queryStr = req.query.queryStr as string;
    const token = req.headers.token as string;
    res.json(messagesSearch(token, queryStr));
  } catch (err) {
    next(err);
  }
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
