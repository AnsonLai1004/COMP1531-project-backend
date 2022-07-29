/**
 * implementation of channel related functions
 * @module channel
**/
import { getData, setData } from './data';
import { userProfileV1 } from './users';
import { Message } from './interfaces';
import { tokenToUId } from './auth';
export {
  channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1,
  channelLeaveV1, channelAddownerV1, channelRemoveownerV1,
  channelMessagesV2, channelInviteV2, channelDetailsV2, channelJoinV2,
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
  const dataStore = getData();

  // check uid and channel id exist
  const founduid = dataStore.users.some(el => el.uId === uId);
  const foundchannel = dataStore.channels.some(el => el.channelId === channelId);

  if (!founduid) {
    return { error: 'error' };
  }
  if (!foundchannel) {
    return { error: 'error' };
  }

  // check uId already a member in channels or not
  for (const element of dataStore.channels) {
    if (element.channelId === channelId) {
      for (const members of element.allMembers) {
        if (members === uId) {
          return { error: 'error' };
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
    return { error: 'error' };
  }
  exactchannel.allMembers.push(uId);
  setData(dataStore);
  return {};
}

function channelInviteV2(token: string, channelId: number, uId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
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
    return { error: 'error' };
  }

  const channel = dataStore.channels.filter(el => el.channelId === channelId);
  const exactchannel = channel[0];
  const checkowners = exactchannel.ownerMembers.includes(authUserId);
  const checkmembers = exactchannel.allMembers.includes(authUserId);

  if (!checkowners && !checkmembers) {
    return { error: 'error' };
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
    return { error: 'error' };
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

/**
 * Wrapper function which calls channelMessagesV1 if the given token is valid.
 * @param token
 * @param channelId
 * @param start
 * @returns {{messages: Arr object of type message, start:  number, end:  number}}
 */
function channelMessagesV2(token: string, channelId: number, start: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
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

/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * provide basic details about the channel.
 * @param {string} token
 * @param {number} channelId
 * @returns {{name: string, isPublic: boolean, ownerMembers: membersobj[], allMembers: membersobj[]}}
 */

function channelDetailsV1(authUserId: number, channelId: number): DetailReturn {
  // check if authUserId is valid
  if (!isValidUserId(authUserId)) {
    return { error: 'error' };
  }

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
        return { error: 'error' };
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
  return { error: 'error' };
}

/**
 * Given a channelId of a channel that the authorised
 * user can join, adds them to that channel.
 * @param {string} token
 * @param {number} channelId
 * @returns {{}}
 */
function channelJoinV1(authUserId: number, channelId: number) {
  if (!isValidUserId(authUserId)) {
    return { error: 'error' };
  }
  // check if channel exist, if yes return channel detail
  const data = getData();
  let channelDetail;
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channelDetail = channel;
    }
  }
  if (channelDetail === undefined) {
    return { error: 'error' };
  }
  // check if channel is private, if yes check if user is global owner
  if (channelDetail.isPublic === false) {
    for (const user of data.users) {
      if (authUserId === user.uId) {
        if (user.isGlobalOwner === false) {
          return { error: 'error' };
        }
      }
    }
  }
  // check if user is already a member
  for (const id of channelDetail.allMembers) {
    if (authUserId === id) {
      return { error: 'error' };
    }
  }
  // add memeber to channel
  for (const channel of data.channels) {
    if (channelId === channel.channelId) {
      channel.allMembers.push(authUserId);
      setData(data);
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
function channelDetailsV2(token: string, channelId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
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
function channelJoinV2(token: string, channelId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
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
function channelLeaveV1(token: string, channelId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }

  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      for (let i = 0; i < channel.allMembers.length; i++) {
        if (channel.allMembers[i] === tokenId.uId) {
          channel.allMembers.splice(i, 1);
          return {};
        }
      }
    }
  }
  return { error: 'error' };
}

/**
 * Given a valid token for a user who has owner permissions in the given channel,
 * give another member of the channel owner permissions.
 * @param token
 * @param channelId
 * @param uId
 * @returns
 */
function channelAddownerV1(token: string, channelId: number, uId: number) {
  // channelId valid?
  if (!isValidChannelId(channelId)) {
    return { error: 'error' };
  }
  // auth user is owner?
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }
  if (!userIsOwner(tokenId.uId as number, channelId)) {
    return { error: 'error' };
  }
  // uId valid?
  if (!isValidUserId(uId)) {
    return { error: 'error' };
  }
  // uId is member?
  if (!userIsMember(uId, channelId)) {
    return { error: 'error' };
  }
  // uId is already owner?
  if (userIsOwner(uId, channelId)) {
    return { error: 'error' };
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
function channelRemoveownerV1(token: string, channelId: number, uId: number) {
  // channelId valid?
  if (!isValidChannelId(channelId)) {
    return { error: 'error' };
  }
  // auth user is owner?
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }
  if (!userIsOwner(tokenId.uId as number, channelId)) {
    return { error: 'error' };
  }
  // uId valid?
  if (!isValidUserId(uId)) {
    return { error: 'error' };
  }
  // uId is not owner?
  if (!userIsOwner(uId, channelId)) {
    return { error: 'error' };
  }

  const data = getData();
  for (const channel of data.channels) {
    if (channel.channelId === channelId) {
      // check if uId is only owner of the channel
      if (channel.ownerMembers.length === 1) {
        return { error: 'error' };
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
