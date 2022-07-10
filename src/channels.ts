import { getData, setData } from './data';
import { Message } from './interfaces';
import { DataStore } from './data';

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

/// ///////////// ITERATION 2 FUNCTIONS ///////////////////

/**
 * Creates a new channel object and appends it to the channels section of the dataStore
 * Returns error if inactive token passed in || 1 > name length || name length > 20
 * @param {string} token
 * @param {string} name
 * @param {boolean} isPublic
 * @returns {channelsCreateRet}
 */

function channelsCreateV2(token: string, name: string, isPublic: boolean): channelsCreateRet {
  // INVALID NAME
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }

  // CHECK IF TOKEN VALID
  const dataStore = getData();
  const validId = checkValidToken(token, dataStore);

  if (validId === false) {
    return { error: 'error' };
  }

  const channel = {
    channelId: dataStore.lastChannelId + 1,
    name: name,
    isPublic: isPublic,
    ownerMembers: [validId],
    allMembers: [validId],
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
  const dataStore = getData();
  const validId = checkValidToken(token, dataStore);

  if (validId === false) {
    return { error: 'error' };
  }

  const channels = [];

  for (const channel of dataStore.channels) {
    for (const member of channel.allMembers) {
      if (member === validId) {
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
  const dataStore = getData();
  const validId = checkValidToken(token, dataStore);

  if (validId === false) {
    return { error: 'error' };
  }

  const channels = [];

  for (const channel of dataStore.channels) {
    channels.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }

  return { channels: channels };
}

/// ///////////// ITERATION 1 FUNCTIONS ///////////////////

//  Creates a new channel object and appends it to the channels section of the dataStore
// Arguments -
//  @authUserId (integer) - user id
//  @name (string) - channel name
//  @isPublic (boolean) - determines whether channel wil be public/private
// Returns -
//  @{channelId (integer)} - if channel is newly made
//  @ERROR - if invalid user id passed in || 1 > name length || name length > 20
function channelsCreateV1(authUserId: number, name: string, isPublic: boolean) {
  // INVALID NAME
  if (name.length < 1 || name.length > 20) {
    return { error: 'error' };
  }

  // CHECK IF USERID VALID
  const dataStore = getData();
  const validId = checkValidId(authUserId, dataStore);

  if (!(validId)) {
    return { error: 'error' };
  }

  const channel = {
    channelId: dataStore.lastChannelId + 1,
    name: name,
    isPublic: isPublic,
    ownerMembers: [authUserId],
    allMembers: [authUserId],
    messages: [] as Message[],
  };

  dataStore.channels.push(channel);
  dataStore.lastChannelId++;
  setData(dataStore);

  return { channelId: channel.channelId };
}

//  Returns a list of channels the user passed in is a part of
// Arguments -
//  @authUserId (integer) - user id
// Returns -
//  @channels (<Array> { channelId (integer), name (string) }) - if valid id passed in
//  @ERROR - if invalid user id passed in
function channelsListV1(authUserId: number) {
  // CHECK IF USERID VALID
  const dataStore = getData();
  const validId = checkValidId(authUserId, dataStore);

  if (!(validId)) {
    return { error: 'error' };
  }

  const channels = [];

  for (const channel of dataStore.channels) {
    for (const member of channel.allMembers) {
      if (member === authUserId) {
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

//  Returns a list of all existing channels
// Arguments -
//  @authUserId (integer) - user id
// Returns -
//  @channels (<Array> { channelId (integer), name (string) }) - if valid id passed in
//  @ERROR - if invalid user id passed in
function channelsListallV1(authUserId: number) {
  // CHECK IF USERID VALID
  const dataStore = getData();
  const validId = checkValidId(authUserId, dataStore);

  if (!(validId)) {
    return { error: 'error' };
  }

  const channels = [];

  for (const channel of dataStore.channels) {
    channels.push({
      channelId: channel.channelId,
      name: channel.name,
    });
  }

  return { channels: channels };
}

/// ///////////// HELPER FUNCTIONS ///////////////////

// Find out whether the uId is a valid user (returns bool)
function checkValidId(authUserId: number, dataStore: DataStore) {
  for (const user of dataStore.users) {
    if (user.uId === authUserId) {
      return true;
    }
  }
  return false;
}

// Find out whether the token is active (returns false if not active)
// (returns corresponding userId if token is active)
function checkValidToken(token: string, dataStore: DataStore) {
  for (const tokenPair of dataStore.tokens) {
    if (tokenPair.token === token) {
      return tokenPair.uId;
    }
  }
  return false;
}

export { channelsCreateV1, channelsListV1, channelsListallV1, channelsCreateV2, channelsListV2, channelsListallV2 };
