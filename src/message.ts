import { getData, setData } from './data';
import { Message, Reacts } from './interfaces';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
export {
  messageSendV2, messageRemoveV2, messageEditV2, messageSendDmV2,
  dmMessagesV2, messagesSearch, messagePin, messageUnpin, messageReact,
  messageUnreact
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
    timeSent: Math.round(Date.now() / 1000),
    reacts: [],
    isPinned: false
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
    timeSent: Math.round(Date.now() / 1000),
    reacts: [],
    isPinned: false
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

/**
 * Given a query string, return a collection of messages in all of the channels/DMs
 * that the user has joined that contain the query (case-insensitive). \
 * No expected order for these messages.
 * @param {string} token
 * @param {string} queryStr
 * @returns { messages: Array of Messages}
*/
function messagesSearch(token: string, queryStr: string) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  if (queryStr.length < 1 || queryStr.length > 1000) {
    throw HTTPError(400, queryStr);
  }
  const datastore = getData();
  const messages = [];

  for (const channel of datastore.channels) {
    if (userIsAuthorised(tokenId.uId, channel.channelId)) {
      for (const message of channel.messages) {
        if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
          messages.push(message);
        }
      }
    }
  }
  for (const dm of datastore.dms) {
    if (userIsAuthorisedInDm(tokenId.uId, dm.dmId)) {
      for (const message of dm.messages) {
        if (message.message.toLowerCase().includes(queryStr.toLowerCase())) {
          messages.push(message);
        }
      }
    }
  }
  return { messages };
}

/**
 * Given a message within a channel or DM, mark it as "pinned".
 * @param {string} token
 * @param {number} messageId
 * @returns { messages: Array of Messages}
*/
function messagePin(token: string, messageId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const datastore = getData();
  for (const channel of datastore.channels) {
    if (userIsAuthorised(tokenId.uId, channel.channelId)) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          if (!userIsOwner(tokenId.uId, channel.channelId)) {
            throw HTTPError(403, 'No owner permissions in channel');
          }
          if (message.isPinned === false) {
            message.isPinned = true;
            setData(datastore);
            return {};
          } else {
            throw HTTPError(400, 'the message is already pinned');
          }
        }
      }
    }
  }
  for (const dm of datastore.dms) {
    if (userIsAuthorisedInDm(tokenId.uId, dm.dmId)) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          if (!userIsOwnerInDm(tokenId.uId, dm.dmId)) {
            throw HTTPError(403, 'No owner permissions in dm');
          }
          if (message.isPinned === false) {
            message.isPinned = true;
            setData(datastore);
            return {};
          } else {
            throw HTTPError(400, 'the message is already pinned');
          }
        }
      }
    }
  }
  throw HTTPError(400, 'messageId is not found in dms or channels');
}

/**
 * Given a message within a channel or DM, remove its mark as "unpinned".
 * @param {string} token
 * @param {number} messageId
 * @returns { messages: Array of Messages}
*/
function messageUnpin(token: string, messageId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const datastore = getData();
  for (const channel of datastore.channels) {
    if (userIsAuthorised(tokenId.uId, channel.channelId)) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          if (!userIsOwner(tokenId.uId, channel.channelId)) {
            throw HTTPError(403, 'No owner permissions in channel');
          }
          if (message.isPinned === true) {
            message.isPinned = false;
            setData(datastore);
            return {};
          } else {
            throw HTTPError(400, 'the message is not pinned');
          }
        }
      }
    }
  }
  for (const dm of datastore.dms) {
    if (userIsAuthorisedInDm(tokenId.uId, dm.dmId)) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          if (!userIsOwnerInDm(tokenId.uId, dm.dmId)) {
            throw HTTPError(403, 'No owner permissions in dm');
          }
          if (message.isPinned === true) {
            message.isPinned = false;
            setData(datastore);
            return {};
          } else {
            throw HTTPError(400, 'the message is not pinned');
          }
        }
      }
    }
  }
  throw HTTPError(400, 'messageId is not found in dms or channels');
}

/**
 * Given a message within a channel or DM the authorised user is part of
 * add a "react" to that particular message.
 * @param {string} token
 * @param {number} messageId
 * @param {number} reactId
 * @returns { messages: Array of Messages}
*/
function messageReact(token: string, messageId: number, reactId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }

  const datastore = getData();
  for (const channel of datastore.channels) {
    if (userIsAuthorised(tokenId.uId, channel.channelId)) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          // check whether reactId in reacts
          let reactexist = false;
          for (const i of message.reacts) {
            if ((i.reactId === reactId) && (i.uIds.includes(tokenId.uId))) {
              throw HTTPError(400, 'the message already contains a react with ID reactId from the authorised user');
            } else if ((i.reactId === reactId) && !(i.uIds.includes(tokenId.uId))) {
              reactexist = true;
              i.uIds.push(tokenId.uId);
              setData(datastore);
              return {};
            }
          }
          // if reactid dont exist, add new react
          if (reactexist === false) {
            const newreact: Reacts = {
              reactId: reactId,
              uIds: [tokenId.uId],
              isThisUserReacted: false
            };
            message.reacts.push(newreact);
            setData(datastore);
            return {};
          }
        }
      }
    }
  }

  for (const dm of datastore.dms) {
    if (userIsAuthorisedInDm(tokenId.uId, dm.dmId)) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          let reactexist = false;
          for (const i of message.reacts) {
            if ((i.reactId === reactId) && (i.uIds.includes(tokenId.uId))) {
              throw HTTPError(400, 'the message already contains a react with ID reactId from the authorised user');
            } else if ((i.reactId === reactId) && !(i.uIds.includes(tokenId.uId))) {
              reactexist = true;
              i.uIds.push(tokenId.uId);
              setData(datastore);
              return {};
            }
          }
          // if reactid dont exist, add new react
          if (reactexist === false) {
            const newreact: Reacts = {
              reactId: reactId,
              uIds: [tokenId.uId],
              isThisUserReacted: false
            };
            message.reacts.push(newreact);
            setData(datastore);
            return {};
          }
        }
      }
    }
  }
  throw HTTPError(400, 'messageId is not found in dms or channels');
}

function messageUnreact(token: string, messageId: number, reactId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  if (reactId !== 1) {
    throw HTTPError(400, 'Invalid reactId');
  }

  const datastore = getData();
  for (const channel of datastore.channels) {
    if (userIsAuthorised(tokenId.uId, channel.channelId)) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          // check whether reactId in reacts
          let reactexist = false;
          for (const i of message.reacts) {
            if ((i.reactId === reactId) && (i.uIds.includes(tokenId.uId))) {
              reactexist = true;
              i.uIds = i.uIds.filter(e => e !== tokenId.uId);
              if (i.uIds.length === 0) {
                message.reacts = [];
              }
              setData(datastore);
              return {};
            } else if ((i.reactId === reactId) && !(i.uIds.includes(tokenId.uId))) {
              // user dont exist in uids
              throw HTTPError(400, 'authorised user not in react uids');
            }
          }
          // if reactid dont exist, return error
          if (reactexist === false) {
            // react dont exist
            throw HTTPError(400, 'reactId is not valid reactId');
          }
        }
      }
    }
  }

  for (const dm of datastore.dms) {
    if (userIsAuthorisedInDm(tokenId.uId, dm.dmId)) {
      for (const message of dm.messages) {
        if (message.messageId === messageId) {
          let reactexist = false;
          for (const i of message.reacts) {
            if ((i.reactId === reactId) && (i.uIds.includes(tokenId.uId))) {
              reactexist = true;
              i.uIds = i.uIds.filter(e => e !== tokenId.uId);
              if (i.uIds.length === 0) {
                message.reacts = [];
              }
              setData(datastore);
              return {};
            } else if ((i.reactId === reactId) && !(i.uIds.includes(tokenId.uId))) {
              throw HTTPError(400, 'authorised user not in react uids');
            }
          }
          // if reactid dont exist, add new react
          if (reactexist === false) {
            throw HTTPError(400, 'react dont exist');
          }
        }
      }
    }
  }
  throw HTTPError(400, 'messageId is not found in dms or channels');
}

/************************************************************************
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
