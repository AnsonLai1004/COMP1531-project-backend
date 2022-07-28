import { getData, setData } from './data';
import { Message } from './interfaces';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';

/// ///////////// ADDITIONAL TYPES ///////////////////
interface channel {
  channelId: number;
  name: string
}

interface channelsCreateRet {
  channelId?: number;
  error?: string;
}

interface channelsListRet {
  channels?: channel[];
  error?: string;
}

/// ////////////// ITERATION 3 FUNCTIONS ////////////////////////////////////////
/**
 * Creates a new channel object and appends it to the channels section of the dataStore
 * Returns error if inactive token passed in || 1 > name length || name length > 20
 * @param {string} token
 * @param {string} name
 * @param {boolean} isPublic
 * @returns {channelsCreateRet}
 */

function channelsCreateV3(token: string, name: string, isPublic: boolean): channelsCreateRet {
  // INVALID NAME
  if (name.length < 1 || name.length > 20) {
    throw HTTPError(400, 'Invalid channel name');
  }

  // CHECK IF TOKEN VALID
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(400, 'Invalid token');
  }

  const dataStore = getData();
  const channel = {
    channelId: dataStore.lastChannelId + 1,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUser.uId],
    allMembers: [authUser.uId],
    messages: [] as Message[],
  };
  dataStore.channels.push(channel);
  dataStore.lastChannelId++;
  setData(dataStore);
  return { channelId: channel.channelId };
}

/**
 * Returns a list of channels the specified user is a part of
 * Returns error if inactive token passed in
 * @param {string} token
 * @returns {channelsListRet}
 */

function channelsListV3(token: string): channelsListRet {
  // CHECK IF USERID VALID
  const authUser = tokenToUId(token);

  if ('error' in authUser) {
    throw HTTPError(400, 'Invalid token');
  }

  const dataStore = getData();
  const channels = [];

  for (const channel of dataStore.channels) {
    for (const member of channel.allMembers) {
      if (member === authUser.uId) {
        channels.push({
          channelId: channel.channelId,
          name: channel.name,
        });
        break;
      }
    }
  }

  return { channels: channels };
}

/**
 * Returns a list of all existing channels
 * Returns error if inactive token passed in
 * @param {string} token
 * @returns {channelsListRet}
 */

function channelsListallV3(token: string): channelsListRet {
  // CHECK IF USERID VALID
  const authUser = tokenToUId(token);

  if ('error' in authUser) {
    throw HTTPError(400, 'Invalid token');
  }

  const dataStore = getData();
  const channels = [];

  for (const channel of dataStore.channels) {
    channels.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }

  return { channels: channels };
}
/// /////////////////////////////////////////////////////////////////////////////
function channelsCreateV2(token: string, name: string, isPublic: boolean): channelsCreateRet {
  // INVALID NAME
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }

  // CHECK IF TOKEN VALID
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    return { error: 'error' };
  }

  const dataStore = getData();
  const channel = {
    channelId: dataStore.lastChannelId + 1,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUser.uId],
    allMembers: [authUser.uId],
    messages: [] as Message[],
  };
  dataStore.channels.push(channel);
  dataStore.lastChannelId++;
  setData(dataStore);
  return { channelId: channel.channelId };
}

/**
 * Returns a list of channels the specified user is a part of
 * Returns error if inactive token passed in
 * @param {string} token
 * @returns {channelsListRet}
 */

function channelsListV2(token: string): channelsListRet {
  // CHECK IF USERID VALID
  const authUser = tokenToUId(token);

  if ('error' in authUser) {
    return { error: 'error' };
  }

  const dataStore = getData();
  const channels = [];

  for (const channel of dataStore.channels) {
    for (const member of channel.allMembers) {
      if (member === authUser.uId) {
        channels.push({
          channelId: channel.channelId,
          name: channel.name,
        });
        break;
      }
    }
  }

  return { channels: channels };
}

/**
 * Returns a list of all existing channels
 * Returns error if inactive token passed in
 * @param {string} token
 * @returns {channelsListRet}
 */

function channelsListallV2(token: string): channelsListRet {
  // CHECK IF USERID VALID
  const authUser = tokenToUId(token);

  if ('error' in authUser) {
    return { error: 'error' };
  }

  const dataStore = getData();
  const channels = [];

  for (const channel of dataStore.channels) {
    channels.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }

  return { channels: channels };
}

export { channelsCreateV2, channelsListV2, channelsListallV2, channelsCreateV3, channelsListallV3, channelsListV3 };
