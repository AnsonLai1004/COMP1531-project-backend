import { Message, Reacts, Notif } from './interfaces';
import { getData, setData, updateStatsUserMessage, updateStatsWorkplaceMessages } from './data';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
import { userProfileV3 } from './users';
export {
  messageSendV2, messageRemoveV2, messageEditV2, messageSendDmV2,
  dmMessagesV2, messagesSearch, messagePin, messageUnpin, messageReact,
  messageUnreact, messageSendLater, messageSendLaterDM, getNotification
  , messageShareV1
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
  const timeSent = Math.floor((new Date()).getTime() / 1000);
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
    timeSent: timeSent,
    reacts: [],
    isPinned: false
  };

  let channelName = '';
  for (const channel of datastore.channels) {
    if (channel.channelId === channelId) {
      channel.messages.unshift(newmessage);
      channelName = channel.name;
    }
  }
  datastore.lastMessageId++;

  setData(datastore);
  pushTagsChannel(message, channelId, channelName, tokenId.uId);

  updateStatsUserMessage(tokenId.uId, timeSent);
  updateStatsWorkplaceMessages(timeSent, 'add');

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

  const prevMessage = chosenMessage.message;
  // change message
  if (message === '') {
    // remove message
    messageRemoveV2(token, messageId);
  } else {
    chosenMessage.message = message;
    setData(datastore);
  }

  // check for tags
  if (chosenChannel != null) {
    pushTagsChannel(message, chosenChannel.channelId, chosenChannel.name, tokenId.uId, prevMessage);
  }
  if (chosenDm != null) {
    pushTagsDm(message, chosenDm.dmId, chosenDm.name, tokenId.uId, prevMessage);
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
  const timeRemove = Math.floor((new Date()).getTime() / 1000);
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
  updateStatsWorkplaceMessages(timeRemove, 'remove');
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
  const timeSent = Math.floor((new Date()).getTime() / 1000);
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
    timeSent: timeSent,
    reacts: [],
    isPinned: false
  };
  let dmName = '';
  for (const dm of datastore.dms) {
    if (dm.dmId === dmId) {
      dm.messages.unshift(newmessage);
      dmName = dm.name;
    }
  }
  datastore.lastMessageId++;

  setData(datastore);
  pushTagsDm(message, dmId, dmName, tokenId.uId);

  updateStatsUserMessage(tokenId.uId, timeSent);
  updateStatsWorkplaceMessages(timeSent, 'add');

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
  for (const message of messages) {
    for (const reaction of message.reacts) {
      if (reaction.uIds.includes(authUserId)) {
        reaction.isThisUserReacted = true;
      } else {
        reaction.isThisUserReacted = false;
      }
    }
  }
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
    console.log(userIsAuthorisedInDm(tokenId.uId, ogMessage.Id));
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
    reacts: [],
    isPinned: false,
  };

  if (channelId === -1) {
    for (const dm of data.dms) {
      if (dm.dmId === dmId) {
        dm.messages.unshift(newmessage);
        data.lastMessageId++;
        setData(data);
        // check for new tags only in the optional extra message
        pushTagsDm(message, dmId, dm.name, tokenId.uId);
      }
    }
  } else {
    for (const channel of data.channels) {
      if (channel.channelId === channelId) {
        channel.messages.unshift(newmessage);
        data.lastMessageId++;
        setData(data);
        pushTagsChannel(message, channelId, channel.name, tokenId.uId);
      }
    }
  }
  return { sharedMessageId: newmessage.messageId };
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

/*
master
 * Send a message from the authorised user to the channel specified by channelId
 * automatically at a specified time in the future. The returned messageId will only
 * be considered valid for other actions (editing/deleting/reacting/etc)
 * once it has been sent (i.e. after timeSent).
 * @param { channelId, message, timeSent }
 * @returns { messageId }
*/
function messageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  // check for invalid token
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  // check if channelId is valid
  if (!isValidChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channel');
  }
  // check if user is member of channel
  if (!userIsAuthorised(tokenId.uId, channelId)) {
    throw HTTPError(403, 'User not in channel');
  }
  // check if message too long or short
  if (message.length > 1000 || message.length < 1) {
    throw HTTPError(400, 'Message too long');
  }
  // check if timeSent is valid
  const curTime = Math.floor((new Date()).getTime() / 1000);
  if (timeSent < curTime) {
    throw HTTPError(400, 'Time must be after current time');
  }

  // update lastmessageid
  const data = getData();
  data.lastMessageId++;
  const futureMessageId = data.lastMessageId;
  setData(data);

  setTimeout((futureMessageId, tokenId, channelId, message, timeSent) => {
    // basically send message but with custom lastmessageid (futuremessageid)
    const datastore = getData();
    console.log('IN TIMEOUT ADDING', futureMessageId, tokenId, channelId, message, timeSent);
    const newmessage: Message = {
      messageId: (futureMessageId) as number,
      uId: tokenId.uId,
      message: message,
      timeSent: timeSent,
      reacts: [],
      isPinned: false
    };
    let channelName = '';
    for (const channel of datastore.channels) {
      if (channel.channelId === channelId) {
        channel.messages.unshift(newmessage);
        channelName = channel.name;
      }
    }
    datastore.lastMessageId++;
    setData(datastore);
    pushTagsChannel(message, channelId, channelName, tokenId.uId);
  }, (timeSent - curTime) * 1000, futureMessageId, tokenId, channelId, message, timeSent);

  return { messageId: futureMessageId };
}

/**
 * Send a message from the authorised user to the DM specified by dmId
 * automatically at a specified time in the future. The returned messageId will
 * only be considered valid for other actions (editing/deleting/reacting/etc)
 * once it has been sent (i.e. after timeSent). If the DM is removed before the
 * message has sent, the message will not be sent.
 * @param { dmId, message, timeSent }
 * @returns { messageId }
*/
function messageSendLaterDM(token: string, dmId: number, message: string, timeSent: number) {
  // check for invalid token
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  // check if dmId is valid
  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dm');
  }
  // check if user is member of dm
  if (!userIsAuthorisedInDm(tokenId.uId, dmId)) {
    throw HTTPError(403, 'User not in dm');
  }
  // check if message too long or short
  if (message.length > 1000 || message.length < 1) {
    throw HTTPError(400, 'Message too long');
  }
  // check if timeSent is valid
  const curTime = Math.floor((new Date()).getTime() / 1000);
  if (timeSent < curTime) {
    throw HTTPError(400, 'Time must be after current time');
  }

  // update lastmessageid
  const data = getData();
  data.lastMessageId++;
  const futureMessageId = data.lastMessageId;
  setData(data);

  setTimeout((futureMessageId, tokenId, dmId, message, timeSent) => {
    // check if dm has not been removed
    if (isValidDmId(dmId)) {
      // basically send message but with custom lastmessageid (futuremessageid)
      const datastore = getData();
      const newmessage: Message = {
        messageId: (futureMessageId) as number,
        uId: tokenId.uId,
        message: message,
        timeSent: timeSent,
        reacts: [],
        isPinned: false
      };
      let dmName = '';
      for (const dm of datastore.dms) {
        if (dm.dmId === dmId) {
          dm.messages.unshift(newmessage);
          dmName = dm.name;
        }
      }
      datastore.lastMessageId++;
      setData(datastore);
      pushTagsDm(message, dmId, dmName, tokenId.uId);
    }
  }, (timeSent - curTime) * 1000, futureMessageId, tokenId, dmId, message, timeSent);

  return { messageId: futureMessageId };
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

  const getUserInfo = userProfileV3(token, tokenId.uId);
  const getHandle = getUserInfo.user.handleStr;
  const datastore = getData();
  for (const channel of datastore.channels) {
    if (userIsAuthorised(tokenId.uId, channel.channelId)) {
      for (const message of channel.messages) {
        if (message.messageId === messageId) {
          // check whether reactId in reacts
          if (userIsAuthorised(message.uId, channel.channelId) && (message.uId !== tokenId.uId)) {
            const newNotif: Notif = {
              channelId: channel.channelId,
              dmId: -1,
              notificationMessage: `${getHandle} reacted to your message in ${channel.name}`
            };
            // get user of message.uId then unshift newNotif
            const getUidMessage = datastore.users.filter(el => el.uId === message.uId);
            const exactUser = getUidMessage[0];
            if (exactUser.notification.length === 20) {
              // pop then add
              exactUser.notification.pop();
              exactUser.notification.unshift(newNotif);
            } else {
              exactUser.notification.unshift(newNotif);
            }
          }
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
          if (userIsAuthorisedInDm(message.uId, dm.dmId) && (message.uId !== tokenId.uId)) {
            const newNotif: Notif = {
              channelId: -1,
              dmId: dm.dmId,
              notificationMessage: `${getHandle} reacted to your message in ${dm.name}`
            };
            // get user of message.uId then unshift newNotif
            const getUidMessage = datastore.users.filter(el => el.uId === message.uId);
            const exactUser = getUidMessage[0];
            if (exactUser.notification.length === 20) {
              // pop then add
              exactUser.notification.pop();
              exactUser.notification.unshift(newNotif);
            } else {
              exactUser.notification.unshift(newNotif);
            }
          }
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

function getNotification(token: string) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const datastore = getData();
  const getUidMessage = datastore.users.filter(el => el.uId === tokenId.uId);
  const notifications = getUidMessage[0].notification;
  return { notifications };
}

/************************************************************************
>>>>>>> master
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
        return {
          message: message.message,
          Id: data.dms[i].dmId,
        };
      }
    }
  }
  return undefined;
}

// helper function, check for tags and push to notifications array for channels
function pushTagsChannel(message: string, channelId: number, channelName: string, senderId: number, prevMessage?: string) {
  const datastore = getData();
  let senderName = '';
  // get handle of user who sent
  for (const user of datastore.users) {
    if (senderId === user.uId) {
      senderName = user.handleStr;
    }
  }

  // check for tags for notifications
  for (const user of datastore.users) {
    const regex = new RegExp('@' + user.handleStr + '\\b');
    if (prevMessage !== undefined && regex.test(prevMessage)) {
      // already taggged in previous version of message
      continue;
    }
    if (regex.test(message) && userIsAuthorised(user.uId, channelId)) {
      const notificationMessage = `${senderName} tagged you in ${channelName}: ${message.slice(0, 20)}`;
      const newNotif: Notif = {
        channelId: channelId,
        dmId: -1,
        notificationMessage: notificationMessage
      };
      if (user.notification.length === 20) {
        // pop then add
        user.notification.pop();
        user.notification.unshift(newNotif);
      } else {
        user.notification.unshift(newNotif);
      }
    }
  }
  setData(datastore);
}

// helper function, check for tags and push to notifications array for dms
function pushTagsDm(message: string, dmId: number, dmName: string, senderId: number, prevMessage ?: string) {
  const datastore = getData();
  let senderName = '';
  // get handle of user who sent
  for (const user of datastore.users) {
    if (senderId === user.uId) {
      senderName = user.handleStr;
    }
  }

  // check for tags for notifications
  for (const user of datastore.users) {
    const regex = new RegExp('@' + user.handleStr + '\\b');
    if (prevMessage !== undefined && regex.test(prevMessage)) {
      // already taggged in previous version of message
      continue;
    }
    if (regex.test(message) && userIsAuthorisedInDm(user.uId, dmId)) {
      const notificationMessage = `${senderName} tagged you in ${dmName}: ${message.slice(0, 20)}`;
      const newNotif: Notif = {
        channelId: -1,
        dmId: dmId,
        notificationMessage: notificationMessage
      };
      if (user.notification.length === 20) {
        // pop then add
        user.notification.pop();
        user.notification.unshift(newNotif);
      } else {
        user.notification.unshift(newNotif);
      }
    }
  }
  setData(datastore);
}
