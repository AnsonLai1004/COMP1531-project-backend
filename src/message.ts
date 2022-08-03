import { getData, setData } from './data';
import { Message } from './interfaces';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
export {
  messageSendV2, messageRemoveV2, messageEditV2, messageSendDmV2,
  dmMessagesV2, messageShareV1
};

/**
 * Send a message from the authorised user to the channel specified by channelId.
 * Note: Each message should have its own unique ID,
 * i.e. no messages should share an ID with another message,
 * even if that other message is in a different channel.
 * @param {string} token
 * @param {number} channelId
 * @param {string} message
 * @returns {{messageId: number}}
*/
function messageSendV2(token: string, channelId: number, message: string) {
  // channel Id does not refer to valid channel Id
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'invalid tokenid');
  }
  console.log(message);
  if (!isValidChannelId(channelId)) {
    throw HTTPError(400, 'ChannelId does not refer to a valid channel');
  }
  // if message lenght is less than 1 or greater than 1000
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message less than 1 or greater than 1000');
  }
  // authorised user is not a member of the channel
  // uId is not owner?
  if (!userIsAuthorised(tokenId.uId, channelId)) {
    throw HTTPError(403, 'Authorized user not a member of channel');
  }
  const datastore = getData();
  // lastmessageid+1, uid, message, timesent
  const newmessage: Message = {
    messageId: (datastore.lastMessageId + 1) as number,
    uId: tokenId.uId,
    message: message,
    timeSent: Math.round(Date.now() / 1000)
  };
  for (const channel of datastore.channels) {
    if (channel.channelId === channelId) {
      channel.messages.unshift(newmessage);
    }
  }
  datastore.lastMessageId++;
  setData(datastore);
  return { messageId: newmessage.messageId };
}
/**
 * Given a message, update its text with new text.
 * If the new message is an empty string,
 * the message is deleted.
 * @param {string} token
 * @param {number} messageId
 * @param {string} message
 * @returns {{messageId: number}}
*/
function messageEditV2(token: string, messageId: number, message: string) {
  // if message length is greater than 1000
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid TokenId');
  }
  if (message.length > 1000) {
    throw HTTPError(400, 'length of messages is greater than 1000');
  }
  const datastore = getData();
  let chosenChannel = null;
  let chosenMessage: Message = null;
  // find message
  for (const channel of datastore.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        chosenChannel = channel;
        chosenMessage = message;
      }
    }
  }
  let chosenDm = null;
  for (const dm of datastore.dms) {
    for (const message of dm.messages) {
      if (message.messageId === messageId) {
        chosenDm = dm;
        chosenMessage = message;
      }
    }
  }

  // no message return error
  if (chosenMessage === null) {
    throw HTTPError(400, 'messageId does not refer to any message in channel');
  }
  // if chosen message uid not equal to token then return error
  if (chosenMessage.uId !== tokenId.uId) {
    throw HTTPError(403, 'message was not sent by current user who wants to edit');
  }
  // check if user is owner in channel
  if (chosenChannel != null) {
    if (!userIsOwner(tokenId.uId, chosenChannel.channelId)) {
      throw HTTPError(403, 'not owner in channel');
    }
  }
  // check if userisowner in dm
  if (chosenDm != null) {
    if (!userIsOwnerInDm(tokenId.uId, chosenDm.dmId)) {
      throw HTTPError(403, 'not member in channel');
    }
  }

  // change message
  if (message === '') {
    // remove message
    messageRemoveV2(token, messageId);
  } else {
    chosenMessage.message = message;
    setData(datastore);
  }
  return {};
}

/**
 * Given a messageId for a message,
 * this message is removed from the channel/DM
 * @param {string} token
 * @param {number} messageId
 * @param {string} message
 * @returns {{messageId: number}}
*/
function messageRemoveV2(token: string, messageId: number) {
  // if message length is less than 1 or greater than 1000
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid tokenId');
  }

  const datastore = getData();
  let chosenChannel = null;
  let chosenMessage: Message = null;
  // find message
  for (const channel of datastore.channels) {
    for (const message of channel.messages) {
      if (message.messageId === messageId) {
        chosenChannel = channel;
        chosenMessage = message;
      }
    }
  }
  let chosenDm = null;
  for (const dms of datastore.dms) {
    for (const message of dms.messages) {
      if (message.messageId === messageId) {
        chosenDm = dms;
        chosenMessage = message;
      }
    }
  }

  // no message or found return error
  if (chosenMessage === null) {
    throw HTTPError(400, 'message not found in dms or channels');
  }
  // if chosen message uid not equal to token then return error
  if (chosenMessage.uId !== tokenId.uId) {
    throw HTTPError(403, 'message not send by uid');
  }
  // check if user is owner in channel
  if (chosenChannel !== null) {
    if (!userIsOwner(tokenId.uId, chosenChannel.channelId)) {
      throw HTTPError(403, 'Uid not owner of channel');
    }
  }
  // check if userisowner in dm
  if (chosenDm !== null) {
    if (!userIsOwnerInDm(tokenId.uId, chosenDm.dmId)) {
      throw HTTPError(403, 'Uid not owner of dm');
    }
  }

  // find chosen dm or chosen channel
  // then change the array using filter
  if (chosenDm === null) {
    // use chosen channel since not found in dm
    for (const element of datastore.channels) {
      if (element.channelId === chosenChannel.channelId) {
        element.messages = element.messages.filter(item => item.messageId !== chosenMessage.messageId);
      }
    }
    setData(datastore);
  } else {
    // use chosendm since not found in channel
    for (const element of datastore.dms) {
      if (element.dmId === chosenDm.dmId) {
        element.messages = element.messages.filter(item => item.messageId !== chosenMessage.messageId);
      }
    }
    setData(datastore);
  }
  return {};
}

/**
 * Send a message from authorisedUser to the DM specified by dmId.
 * Note: Each message should have it's own unique ID,
 * i.e. no messages should share an ID with another message,
 * even if that other message is in a different channel or DM.
 * @param {string} token
 * @param {number} dmId
 * @param {string} message
 * @returns
 */
function messageSendDmV2(token: string, dmId: number, message: string) {
  // dm Id does not refer to valid dm Id
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'invalid Token');
  }
  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'dmId does not refer to valid dmId');
  }
  // if message length is less than 1 or greater than 1000
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  // authorised user is not a member of the dm
  // uId is not owner?
  if (!userIsAuthorisedInDm(tokenId.uId, dmId)) {
    throw HTTPError(403, 'user is authorized but not in dm');
  }
  const datastore = getData();
  // lastmessageid+1, uid, message, timesent
  const newmessage: Message = {
    messageId: (datastore.lastMessageId + 1) as number,
    uId: tokenId.uId,
    message: message,
    timeSent: Math.round(Date.now() / 1000)
  };
  for (const dm of datastore.dms) {
    if (dm.dmId === dmId) {
      dm.messages.unshift(newmessage);
    }
  }
  datastore.lastMessageId++;
  setData(datastore);
  return { messageId: newmessage.messageId };
}

/**
 * Given a channel with ID channelId that the authorised user is a member of
 * return up to 50 messages between index "start" and "start + 50"
 * return end = -1 if end of messages.
 * otherwise return error.
 * @param {number} authUserId
 * @param {number} dmId
 * @param {number} start
 * @returns {{messages: Arr object of type message, start:  number, end:  number}}
 */
function dmMessageV1helper(authUserId: number, dmId: number, start: number) {
  const dataStore = getData();

  // check uid and dm id exist
  // check authorized user who invited the member is not a member of the group
  const foundDm = dataStore.dms.some(el => el.dmId === dmId);
  if (!foundDm) {
    throw HTTPError(400, 'dmId not found');
  }

  const getdm = dataStore.dms.filter(el => el.dmId === dmId);
  const exactdm = getdm[0];
  const checkmembers = exactdm.uIds.includes(authUserId);
  if (!checkmembers && exactdm.ownerId !== authUserId) {
    throw HTTPError(403, 'authorised user is not a member of the dm');
  }

  // find channel get length of messages
  let numofmessages = 0;
  let messages: Message[] = [];
  for (const element of dataStore.dms) {
    if (element.dmId === dmId) {
      numofmessages = element.messages.length;
      messages = element.messages;
      break;
    }
  }
  if (start > numofmessages) {
    throw HTTPError(400, 'start greater than total number of messages in channel');
  }
  const end = start + 50;
  if (end < numofmessages) {
    return {
      messages: messages,
      start: start,
      end: end,
    };
  } else {
    return {
      messages: messages,
      start: start,
      end: -1,
    };
  }
}

function dmMessagesV2(token: string, dmId: number, start: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const result = dmMessageV1helper(tokenId.uId as number, dmId, start);
  return result;
}

/// //////////////////////Iteration 3 new functions////////////////////////////////////////////////////////////////////////////////////////
// message/share/v1
function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  console.log(message);
  if (message.length > 1000) {
    throw HTTPError(400, 'length of messages is greater than 1000');
  }
  // check channelId and dmId is valid, and either one need to be -1
  // check ogMessageId is valid and get the message obj
  if (channelId === -1) {
    if (isValidDmId(dmId) === false) {
      throw HTTPError(400, 'Invalid dmId');
    }
    if (!userIsAuthorisedInDm(tokenId.uId, dmId)) {
      throw HTTPError(403, 'user has not joined the channel');
    }
  } else if (dmId === -1) {
    if (isValidChannelId(channelId) === false) {
      throw HTTPError(400, 'Invalid channelId');
    }
    if (!userIsAuthorised(tokenId.uId, channelId)) {
      throw HTTPError(403, 'user has not joined the channel');
    }
  } else {
    throw HTTPError(400, 'neither channelId nor dmId are -1');
  }

  const ogMessage = findMessageStr(ogMessageId);
  if (ogMessage === undefined) {
    throw HTTPError(400, 'ogMessageId is Invalid');
  }
  // ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined
  if (channelId === -1) {
    if (!userIsAuthorisedInDm(tokenId.uId, ogMessage.Id)) {
      throw HTTPError(400, 'user share message from Dm they are not authorised');
    }
  }
  if (dmId === -1) {
    if (!userIsAuthorised(tokenId.uId, ogMessage.Id)) {
      throw HTTPError(400, 'user share message from channel they are not authorised');
    }
  }
  // create newMessage with both string concat together
  const data = getData();
  const newmessage: Message = {
    messageId: (data.lastMessageId + 1) as number,
    uId: tokenId.uId,
    message: ogMessage.message + message,
    timeSent: Math.round(Date.now() / 1000),
  };

  if (channelId === -1) {
    for (const dm of data.dms) {
      if (dm.dmId === dmId) {
        dm.messages.unshift(newmessage);
      }
    }
  } else {
    for (const channel of data.channels) {
      if (channel.channelId === channelId) {
        channel.messages.unshift(newmessage);
      }
    }
  }
  data.lastMessageId++;
  setData(data);
  return { sharedMessageId: newmessage.messageId };
}

/// //////////////////////Helper functions/////////////////////////////////////////////////////////////////////////////////////
/**
 * Helper function
 * return false if channelId is not valid
 * @param {number} channelId
 * @returns {boolean}
 */
function isValidChannelId(channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function
 * return false if dmId is not valid
 * @param {number} dmId
 * @returns {boolean}
 */
function isValidDmId(dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function
 * return false if user is not an owner of the channel
 * @param {number} uId
 * @param {number} channelId
 * @returns {boolean}
 */
function userIsOwner(uId: number, channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const owner of channel.ownerMembers) {
        if (owner === uId) {
          return true;
        }
      }
    }
  }
  return false;
}
/*
* Helper function
* return false if user is not owner of DM
* @param {number} uId
* @param {number} channelId
* @returns {boolean}
*/
function userIsOwnerInDm(uId: number, dmId: number) {
  const data = getData();
  for (const dms of data.dms) {
    if (dms.dmId === dmId) {
      if (dms.ownerId === uId) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Helper function
 * return false if user is not a member of the channel
 * @param {number} uId
 * @param {number} channelId
 * @returns {boolean}
 */
function userIsAuthorised(uId: number, channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.allMembers) {
        if (member === uId) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Helper function
 * return false if user is not a member of the dm
 * @param {number} uId
 * @param {number} channelId
 * @returns {boolean}
 */
function userIsAuthorisedInDm(uId: number, dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.ownerId === uId) {
        return true;
      }
      for (const member of dm.uIds) {
        if (member === uId) {
          return true;
        }
      }
    }
  }
  return false;
}

// return message string from channel or Dm
function findMessageStr(messageId: number) {
  const data = getData();
  let i;
  for (i = 0; i < data.channels.length; i++) {
    for (const message of data.channels[i].messages) {
      if (messageId === message.messageId) {
        console.log(data.channels[i].channelId + '+_=============================================');
        return {
          message: message.message,
          Id: data.channels[i].channelId,
        };
      }
    }
  }// let j = 0; j < data.channels[i].messages.length; i++
  for (i = 0; i < data.dms.length; i++) {
    for (const message of data.dms[i].messages) {
      if (messageId === message.messageId) {
        console.log(data.dms[i].dmId + '+_=============================================');
        return {
          message: message.message,
          Id: data.dms[i].dmId,
        };
      }
    }
  }
  return undefined;
}
