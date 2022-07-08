import express from 'express';
import { echo } from './echo';
import morgan from 'morgan';
import config from './config.json';

import { channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1 } from './channel'
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


app.get('channel/details/v2', (req, res) => {
  const channelId = parseInt((req.query.channelId) as string);
  const token = req.query.token as string;
  res.json(channelDetailsV1(token, channelId));
});

app.post('channel/join/v2', (req, res) => {
  const { token, channelId } = req.body;
  res.json(channelJoinV1(token, channelId));
});
// start server
app.listen(PORT, HOST, () => {
  console.log(`⚡️ Server listening on port ${PORT} at ${HOST}`);
});
