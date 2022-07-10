import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { channelDetailsV2, channelJoinV2, channelLeaveV1, channelAddownerV1, channelRemoveownerV1 } from './channel';
import { authRegisterV2, authLoginV2, authLogoutV1 } from './auth';
import { channelsCreateV2, channelsListV2, channelsListallV2 } from './channels';

import { clearV1 } from './other';

// Set up web app, use JSON
const app = express();
app.use(express.json());

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

// Example get request
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
app.post('/channels/create/v2', (req, res) => {
  const { token, name, isPublic } = req.body;
  res.json(channelsCreateV2(token, name, isPublic));
});

app.get('/channels/list/v2', (req, res) => {
  const token = req.query.token as string;
  res.json(channelsListV2(token));
});

app.get('/channels/listall/v2', (req, res) => {
  const token = req.query.token as string;
  res.json(channelsListallV2(token));
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

// other routes
app.delete('/clear/v1', (req, res) => {
  clearV1();
  res.json({});
});

// channel routes
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

// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
