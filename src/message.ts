import { getData, setData } from './data';
import { userProfileV1 } from './users';
import { Message } from './interfaces';
export {
    messageSendV1
};

/**
 * implementation of channel related functions
**/
interface error {
  error: string;
}

interface member {
  uId: number;
  email: string;
  nameFirst: string;
  nameLast: string;
  handleStr: string;
}
type membersobj = member | error;

interface DetailReturn {
  name?: string;
  isPublic?: boolean;
  ownerMembers?: membersobj[];
  allMembers?: membersobj[];
  error?: string;
}

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
  if (message.length < 1 || message.length > 100) {
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
  let newmessage: Message = {
      messageId: (datastore.lastMessageId + 1) as number,
      uId: tokenId.uId,
      message: message,
      timeSent: Math.round(Date.now() / 1000)
  }
  for (const channel of datastore.channels) {
      if (channel.channelId === channelId) {
          channel.messages.push(newmessage);
      }
  }
  datastore.lastMessageId++;
  setData(datastore);
  return { messageId: newmessage.messageId};
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
 * Given an array of uid, return array of user
 * @param {number[]} MembersArr
 * @returns {user[]}
 */
function membersobjCreate(MembersArr: number[]): membersobj[] {
  const result = [];
  for (const memberid of MembersArr) {
    const user = userProfileV1(memberid, memberid);
    result.push({
      uId: user.user.uId,
      email: user.user.email,
      nameFirst: user.user.nameFirst,
      nameLast: user.user.nameLast,
      handleStr: user.user.handleStr,
    });
  }
  return result;
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
 * return false if user is not a member of the channel
 * @param {number} uId
 * @param {number} channelId
 * @returns {boolean}
 */
function userIsMember(uId: number, channelId: number) {
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
