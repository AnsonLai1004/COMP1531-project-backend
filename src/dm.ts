import { getData, setData, updateStatsUserDm, updateStatsWorkplaceDms, updateStatsWorkplaceMessages } from './data';
import { Message, Notif } from './interfaces';
import { tokenToUId, membersobjCreate, isValidUserId } from './channel';
import HTTPError from 'http-errors';
import { userProfileV3 } from './users';

export { dmLeaveV1, dmRemoveV1, dmListV1, dmCreateV2, dmDetailsV2 };

function dmCreateV2(token: string, uIds: number[]) {
  const timeCreate = Math.floor((new Date()).getTime() / 1000);
  // any invalid uId in uIds
  for (const id of uIds) {
    if (!isValidUserId(id)) {
      throw HTTPError(403, 'Invalid uId');
    }
  }
  // any duplicate uId's in uIds
  const unique = Array.from(new Set(uIds));
  if (uIds.length !== unique.length) {
    throw HTTPError(400, 'duplicate uId');
  }
  //
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(400, 'Invalid token');
  }
  // create dmId
  const data = getData();
  const newId = data.lastDMId + 1;
  data.lastDMId = newId;
  // create name:
  // create array with ownerId and all uIds,
  const arrAll = uIds.slice();
  arrAll.push(tokenId.uId);
  // convert to handlestr
  const handlestrArr = [];
  for (const id of arrAll) {
    for (const user of data.users) {
      if (id === user.uId) {
        handlestrArr.push(user.handleStr);
      }
    }
  }
  handlestrArr.sort();
  const name = handlestrArr.join(', ');
  const dm = {
    dmId: newId,
    name: name,
    ownerId: tokenId.uId,
    uIds: uIds,
    messages: [] as Message[],
  };

  const getUserInfo = userProfileV3(token, tokenId.uId);
  const getHandle = getUserInfo.user.handleStr;
  const newNotif: Notif = {
    channelId: -1,
    dmId: dm.dmId,
    notificationMessage: `${getHandle} added you to ${dm.name}`
  };
  for (const id of uIds) {
    // get user of message.uId then unshift newNotif
    const getUidMessage = data.users.filter(el => el.uId === id);
    const exactUser = getUidMessage[0];
    if (exactUser.notification.length === 20) {
      // pop then add
      exactUser.notification.pop();
      exactUser.notification.unshift(newNotif);
    } else {
      exactUser.notification.unshift(newNotif);
    }
  }
  data.dms.push(dm);
  setData(data);

  for (const id of arrAll) {
    updateStatsUserDm(id, timeCreate, 'add');
  }
  updateStatsWorkplaceDms(timeCreate, 'add');

  return { dmId: dm.dmId };
}

function dmDetailsV2(token: string, dmId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(400, 'Invalid token');
  }
  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid DM');
  }
  if (!userIsDMmember(tokenId.uId, dmId)) {
    throw HTTPError(403, 'user not DM member');
  }
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      const arrAll = dm.uIds.slice();
      arrAll.push(dm.ownerId);
      const members = membersobjCreate(arrAll);
      return {
        name: dm.name,
        members: members,
      };
    }
  }
}

function dmListV1(token: string) {
  // check if token passed in is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(400, 'Invalid token');
  }

  const data = getData();
  const dms = [];

  for (const dm of data.dms) {
    // check if user is owner / member of a dm
    if (tokenId.uId === dm.ownerId || dm.uIds.includes(tokenId.uId)) {
      dms.push({
        dmId: dm.dmId,
        name: dm.name,
      });
    }
  }

  return { dms: dms };
}

function dmRemoveV1(token: string, dmId: number) {
  const timeRemove = Math.floor((new Date()).getTime() / 1000);
  // check if token passed in is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(400, 'Invalid token');
  }

  // check if dmId passed in is valid
  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dm');
  }

  // check if user is a member of dm
  if (!userIsDMmember(tokenId.uId, dmId)) {
    throw HTTPError(403, 'User not in dm');
  }

  // check if user is dm creator
  if (!userIsDMOwner(tokenId.uId, dmId)) {
    throw HTTPError(403, 'User is not dm creator');
  }

  const data = getData();
  const toRemoveDm = data.dms.filter((dm) => dm.dmId === dmId)[0];

  // remove dm from dataStore
  data.dms = data.dms.filter((dm) => dm.dmId !== dmId);
  setData(data);

  // update stats
  updateStatsUserDm(toRemoveDm.ownerId, timeRemove, 'remove');
  for (const uId of toRemoveDm.uIds) {
    updateStatsUserDm(uId, timeRemove, 'remove');
  }
  const numDmMessages = toRemoveDm.messages.length;
  for (let i = 0; i < numDmMessages; i++) {
    updateStatsWorkplaceMessages(timeRemove, 'remove');
  }

  updateStatsWorkplaceDms(timeRemove, 'remove');

  return {};
}

function dmLeaveV1(token: string, dmId: number) {
  const timeLeave = Math.floor((new Date()).getTime() / 1000);
  // check if token passed in is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(400, 'Invalid token');
  }

  // check if dmId passed in is valid
  if (!isValidDmId(dmId)) {
    throw HTTPError(400, 'Invalid dm');
  }

  // check if user is a member of dm
  if (!userIsDMmember(tokenId.uId, dmId)) {
    throw HTTPError(403, 'User is not dm member');
  }

  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      // change ownerId to negative since in our implementation cannot be negative
      if (dm.ownerId === tokenId.uId) {
        dm.ownerId = -1;
      } else { // remove member that is not owner
        dm.uIds = dm.uIds.filter((uId) => uId !== tokenId.uId);
      }
      break;
    }
  }

  setData(data);

  updateStatsUserDm(tokenId.uId, timeLeave, 'remove');

  return {};
}

/// //////////////////////// Helper Functions ////////////////////////////////
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
 * return false if user is not a member of the DM (checks owner as well)
 * @param {number} uId
 * @param {number} dmId
 * @returns {boolean}
 */
function userIsDMmember(uId: number, dmId: number) {
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

/**
 * Helper function
 * return false if user is not the DM owner
 * @param {number} uId
 * @param {number} dmId
 * @returns {boolean}
 */
function userIsDMOwner(uId: number, dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      if (dm.ownerId === uId) {
        return true;
      }
    }
  }
  return false;
}
