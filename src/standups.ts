import HTTPError from 'http-errors';
import { getData, setData, DataStore } from './data';
import { userIsMember, isValidChannelId } from './channel';
import { tokenToUId } from './auth'
import { userProfileV2 } from './users'
import { messageSendV1 } from './message'

export function standupStartV1(token: string, channelId: number, length: number) {
  // check if token is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  // check if channelId is valid
  if (isValidChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channel');
  }
  // Check if user is member of channel
  if (!userIsMember(tokenId.id)) {
    throw HTTPError(403, 'User not in channel');
  }
  // check if length invalid
  if (length < 0) {
    throw HTTPError(400, 'Standup length invalid');
  }
  // check if standup active
  const standupDetails = standUpActiveV1(token, channelId);
  if (standupDetails.isActive) {
    throw HTTPError(400, 'Standup already active in current channel');
  }

  const data = getData();
  const timeFinish = Math.floor((new Date()).getTime() / 1000) + length;

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standupActive = true;
      channel.standupEnd = timeFinish;
    }
  }

  setData(data);

  setTimeout(standupEnd(token, channelId));
  return { timeFinish: timeFinish }
}

function standupEnd(token: string, channelId: number) {
  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.standupActive = false;
      channel.standupEnd = null;
    }
  }

  // not empty string
  if (data.standupStr) {
    messageSendV1(token, channelId, data.standupStr);
    data.standupStr = '';
  }

  setData(data);
}

export function standupSendV1(token: string, channelId: number, message: string) {
  // check if token is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  // check if channelId is valid
  if (isValidChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channel');
  }
  // Check if user is member of channel
  if (!userIsMember(tokenId.id)) {
    throw HTTPError(403, 'User not in channel');
  }
  // check if message too long 
  if (message.length > 1000) {
    throw HTTPError(400, 'Message too long');
  }
  // check if standup active
  const standupDetails = standUpActiveV1(token, channelId);
  if (!standupDetails.isActive) {
    throw HTTPError(400, 'No standup active in current channel');
  }

  const data = getData();
  const handleStr = userProfileV2(token, tokenId.id).user.handleStr;

  if (Math.floor((new Date()).getTime() / 1000) < standupDetails.timeFinish) {
    data.standupStr += handleStr + ': ' + message;
  }

  setData(data);
  return {}
}

export function standUpActiveV1(token: string, channelId: number) {
  // check if token is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  // check if channelId is valid
  if (isValidChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channel');
  }
  // Check if user is member of channel
  if (!userIsMember(tokenId.id)) {
    throw HTTPError(403, 'User not in channel');
  }

  const data = getData();

  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return {
        isActive: channel.standupActive,
        timeFinish: channel.standupEnd,
      }
    }
  }
}