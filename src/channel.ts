/**
 * implementation of channel related functions
 * @module channel
**/
// delete channels iter 2 later on
import { getData, setData, updateStatsUserChannel } from './data';
import { userProfileV1 } from './users';
import { Message } from './interfaces';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
export {
  channelLeaveV2, channelAddownerV2, channelRemoveownerV2,
  channelInviteV3, channelMessagesV3, channelDetailsV3, channelJoinV3,
  membersobjCreate, isValidUserId, tokenToUId
};

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
 * Invites a user with ID uId to join a channel with ID channelId.
 * returns empty if success, otherwise error
 * @param {number} authUserId
 * @param {number} channelId
 * @param {number} uId
 * @returns {{}}
*/
function channelInviteV1(authUserId: number, channelId: number, uId: number) {
  const timeInvite = Math.floor((new Date()).getTime() / 1000);
  const dataStore = getData();

  // check uid and channel id exist
  const founduid = dataStore.users.some(el => el.uId === uId);
  const foundchannel = dataStore.channels.some(el => el.channelId === channelId);

  if (!founduid) {
    throw HTTPError(400, 'uId does not refer to a valid user');
  }
  if (!foundchannel) {
    throw HTTPError(400, 'ChannelId does not refer to a valid channel');
  }

  // check uId already a member in channels or not
  for (const element of dataStore.channels) {
    if (element.channelId === channelId) {
      for (const members of element.allMembers) {
        if (members === uId) {
          throw HTTPError(400, 'uId refers to a user who is already a member of the channel');
        }
      }
    }
  }

  // check authorized user who invited the member is not a member of the group
  const channel = dataStore.channels.filter(el => el.channelId === channelId);
  const exactchannel = channel[0];
  const checkowners = exactchannel.ownerMembers.includes(authUserId);
  const checkmembers = exactchannel.allMembers.includes(authUserId);

  if (!checkowners && !checkmembers) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }
  exactchannel.allMembers.push(uId);
  setData(dataStore);

  updateStatsUserChannel(uId, timeInvite, 'add');

  return {};
}

function channelInviteV3(token: string, channelId: number, uId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const result = channelInviteV1(tokenId.uId as number, channelId, uId);
  return result;
}

/**
 * Given a channel with ID channelId that the authorised user is a member of
 * return up to 50 messages between index "start" and "start + 50"
 * return end = -1 if end of messages.
 * otherwise return error.
 * @param {number} authUserId
 * @param {number} channelId
 * @param {number} start
 * @returns {{messages: Arr object of type message, start:  number, end:  number}}
 */
function channelMessagesV1(authUserId: number, channelId: number, start: number) {
  const dataStore = getData();

  // check uid and channel id exist
  // check authorized user who invited the member is not a member of the group
  const foundchannel = dataStore.channels.some(el => el.channelId === channelId);
  if (!foundchannel) {
    throw HTTPError(400, 'channelId not found');
  }

  const channel = dataStore.channels.filter(el => el.channelId === channelId);
  const exactchannel = channel[0];
  const checkowners = exactchannel.ownerMembers.includes(authUserId);
  const checkmembers = exactchannel.allMembers.includes(authUserId);

  if (!checkowners && !checkmembers) {
    throw HTTPError(403, 'authorised user is not a member of the channel');
  }

  // find channel get length of messages
  let numofmessages = 0;
  let messages: Message[] = [];
  for (const element of dataStore.channels) {
    if (element.channelId === channelId) {
      numofmessages = element.messages.length;
      messages = element.messages;
      break;
    }
  }
  if (start > numofmessages) {
    throw HTTPError(400, 'start greater than total number of messages in channel');
  }
  const end = start + 50;
  for (const el of messages) {
    for (const reaction of el.reacts) {
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

/**
 * Wrapper function which calls channelMessagesV1 if the given token is valid.
 * @param token
 * @param channelId
 * @param start
 * @returns {{messages: Arr object of type message, start:  number, end:  number}}
 */
function channelMessagesV3(token: string, channelId: number, start: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const result = channelMessagesV1(tokenId.uId as number, channelId, start);
  return result;
}

/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * provide basic details about the channel.
 * @param {string} token
 * @param {number} channelId
 * @returns {{name: string, isPublic: boolean, ownerMembers: membersobj[], allMembers: membersobj[]}}
 */

function channelDetailsV1(authUserId: number, channelId: number): DetailReturn {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      // check if authUserId is member
      let isMember = false;
      for (const userId of channel.allMembers) {
        if (userId === authUserId) {
          isMember = true;
        }
      }
      if (isMember === false) {
        throw HTTPError(403, 'user not a member');
      }
      const owners = membersobjCreate(channel.ownerMembers);
      const members = membersobjCreate(channel.allMembers);
      return {
        name: channel.name,
        isPublic: channel.isPublic,
        ownerMembers: owners,
        allMembers: members,
      };
    }
  }
  throw HTTPError(400, 'Invalid channelId');
}

/**
 * Given a channelId of a channel that the authorised
 * user can join, adds them to that channel.
 * @param {string} token
 * @param {number} channelId
 * @returns {{}}
 */
function channelJoinV1(authUserId: number, channelId: number) {
  const timeJoin = Math.floor((new Date()).getTime() / 1000);
  // check if channel exist, if yes return channel detail
  const data = getData();
  let channelDetail;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channelDetail = channel;
    }
  }
  if (channelDetail === undefined) {
    throw HTTPError(400, 'Invalid channelId');
  }
  // check if channel is private, if yes check if user is global owner
  if (channelDetail.isPublic === false) {
    for (const user of data.users) {
      if (authUserId === user.uId) {
        if (user.isGlobalOwner === false) {
          throw HTTPError(403, 'channel is private, user not a member or global owner');
        }
      }
    }
  }
  // check if user is already a member
  for (const id of channelDetail.allMembers) {
    if (authUserId === id) {
      throw HTTPError(400, 'already a member');
    }
  }
  // add member to channel
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channel.allMembers.push(authUserId);
      setData(data);
      updateStatsUserChannel(authUserId, timeJoin, 'add');
      return {};
    }
  }
}

/**
 * Wrapper function which calls channelDetailsV1 if the given token is valid.
 * @param token
 * @param channelId
 * @returns {{name: string, isPublic: boolean, ownerMembers: membersobj[], allMembers: membersobj[]}}
 */
function channelDetailsV3(token: string, channelId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const result = channelDetailsV1(tokenId.uId as number, channelId);
  return result;
}

/**
 * Wrapper function which calls channelJoinV1 if the given token is valid.
 * @param token
 * @param channelId
 * @returns {{}}
 */
function channelJoinV3(token: string, channelId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const result = channelJoinV1(tokenId.uId as number, channelId);
  return result;
}

// channel /leave /addowner /removeowner V1

/**
 * Given a valid token, remove the user from a channel they are currently in
 * @param token
 * @param channelId
 * @returns
 */
// FIXME: standup error???
function channelLeaveV2(token: string, channelId: number) {
  const timeLeave = Math.floor((new Date()).getTime() / 1000);
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }

  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (let i = 0; i < channel.allMembers.length; i++) {
        if (channel.allMembers[i] === tokenId.uId) {
          channel.allMembers.splice(i, 1);
          setData(data);
          updateStatsUserChannel(tokenId.uId, timeLeave, 'remove');
          return {};
        }
      }
    }
  }
  throw HTTPError(400, 'Invalid channel');
}

/**
 * Given a valid token for a user who has owner permissions in the given channel,
 * give another member of the channel owner permissions.
 * @param token
 * @param channelId
 * @param uId
 * @returns
 */
function channelAddownerV2(token: string, channelId: number, uId: number) {
  // channelId valid?
  if (!isValidChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channel');
  }
  // auth user is owner?
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!userIsOwner(tokenId.uId as number, channelId)) {
    throw HTTPError(403, 'user not an owner');
  }
  // uId valid?
  if (!isValidUserId(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }
  // uId is member?
  if (!userIsMember(uId, channelId)) {
    throw HTTPError(400, 'uId not member');
  }
  // uId is already owner?
  if (userIsOwner(uId, channelId)) {
    throw HTTPError(400, 'uId already an owner');
  }
  // add owner
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      channel.ownerMembers.push(uId);
      return {};
    }
  }
}

/**
 * Given a valid token for a user who has owner permissions in the given channel,
 * remove another owner of the channel's owner permissions.
 * @param token
 * @param channelId
 * @param uId
 * @returns
 */
function channelRemoveownerV2(token: string, channelId: number, uId: number) {
  // channelId valid?
  if (!isValidChannelId(channelId)) {
    throw HTTPError(400, 'Invalid channel');
  }
  // auth user is owner?
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!userIsOwner(tokenId.uId as number, channelId)) {
    throw HTTPError(400, 'user not an owner');
  }
  // uId valid?
  if (!isValidUserId(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }
  // uId is not owner?
  if (!userIsOwner(uId, channelId)) {
    throw HTTPError(400, 'uId not an owner');
  }

  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      // check if uId is only owner of the channel
      if (channel.ownerMembers.length === 1) {
        throw HTTPError(400, 'uId is the only owner');
      }
      // remove owner
      for (let i = 0; i < channel.ownerMembers.length; i++) {
        if (channel.ownerMembers[i] === uId) {
          channel.ownerMembers.splice(i, 1);
          return {};
        }
      }
    }
  }
}

/************************************************************************
 * Helper function
 * return false if authUserId is not valid
 * @param {number} authUserId
 * @returns {boolean}
 */
function isValidUserId(authUserId: number) {
  const data = getData();
  for (const user of data.users) {
    if (authUserId === user.uId) {
      return true;
    }
  }
  return false;
}

/**
 * Helper function
 * return false if channelId is not valid
 * @param {number} channelId
 * @returns {boolean}
 */
export function isValidChannelId(channelId: number) {
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
    const user = userProfileV1(memberid);
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
 * return false if user is not a member of the channel
 * @param {number} uId
 * @param {number} channelId
 * @returns {boolean}
 */
export function userIsMember(uId: number, channelId: number) {
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
function userIsOwner(uId: number, channelId: number) {
  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (const member of channel.ownerMembers) {
        if (member === uId) {
          return true;
        }
      }
    }
  }
  return false;
}
