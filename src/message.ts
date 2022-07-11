import { getData, setData } from './data';
import { Message } from './interfaces';
export {
  messageSendV1, messageRemoveV1, messageEditV1
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
function messageSendV1(token: string, channelId: number, message: string) {
  // channel Id does not refer to valid channel Id
  if (!isValidChannelId(channelId)) {
    return { error: 'error' };
  }
  // if message lenght is less than 1 or greater than 100
  if (message.length < 1 || message.length > 1000) {
    return { error: 'error' };
  }
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }
  // authorised user is not a member of the channel
  // uId is not owner?
  if (!userIsAuthorised(tokenId.uId, channelId)) {
    return { error: 'error' };
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
      channel.messages.push(newmessage);
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
function messageEditV1(token: string, messageId: number, message: string) {
  // if message length is less than 1 or greater than 1000
  if (message.length > 1000) {
    return { error: 'error' };
  }
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }

  const datastore = getData();
  let chosenChannel = null;
  let chosenMessage = null;
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
    return { error: 'error' };
  }
  // if chosen message uid not equal to token then return error
  if (chosenMessage.uId !== tokenId.uId) {
    return { error: 'error' };
  }
  // check if user is owner in channel
  if (chosenChannel != null) {
    if (!userIsOwner(tokenId.uId, chosenChannel.channelId)) {
      return { error: 'error' };
    }
  }
  // check if userisowner in dm
  if (chosenDm != null) {
    if (!userIsOwnerInDm(tokenId.uId, chosenDm.dmId)) {
      return { error: 'error' };
    }
  }

  // change message
  if (message === '') {
    // remove message
    messageRemoveV1(token, messageId);
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
function messageRemoveV1(token: string, messageId: number) {
  // if message length is less than 1 or greater than 1000
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }

  const datastore = getData();
  let chosenChannel = null;
  let chosenMessage = null;
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
    return { error: 'error' };
  }
  // if chosen message uid not equal to token then return error
  if (chosenMessage.uId !== tokenId.uId) {
    return { error: 'error' };
  }
  // check if user is owner in channel
  if (chosenChannel !== null) {
    if (!userIsOwner(tokenId.uId, chosenChannel.channelId)) {
      return { error: 'error' };
    }
  }
  // check if userisowner in dm
  if (chosenDm !== null) {
    if (!userIsOwnerInDm(tokenId.uId, chosenDm.dmId)) {
      return { error: 'error' };
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
        element.messages = element.messages.filter(item => item.messageId !== chosenDm.messageId);
      }
    }
    setData(datastore);
  }
  return {};
}

/************************************************************************
 * Helper function
 * return false if authUserId is not valid
 * @param {number} authUserId
 * @returns {boolean}
 */
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
 * Given a token, return authUserId
 * @param {string} token
 * @returns {number}
 */
function tokenToUId(token: string)/*: tokenToUId */ {
  const data = getData();
  for (const element of data.tokens) {
    if (element.token === token) {
      return { uId: element.uId };
    }
  }
  return { error: 'error' };
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
 * return false if user is not an owner of the channel
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
