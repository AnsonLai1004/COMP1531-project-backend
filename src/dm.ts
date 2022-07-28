import { getData, setData } from './data';
import { Message } from './interfaces';
import { tokenToUId, membersobjCreate, isValidUserId } from './channel';
export { dmLeaveV1, dmRemoveV1, dmListV1, dmCreateV1, dmDetailsV1 };
import HTTPError from 'http-errors'

function dmCreateV1(token: string, uIds: number[]) {
  // any invalid uId in uIds
  for (const id of uIds) {
    if (!isValidUserId(id)) {
      return { error: 'error' };
    }
  }
  // any duplicate uId's in uIds
  const unique = Array.from(new Set(uIds));
  if (uIds.length !== unique.length) {
    return { error: 'error' };
  }
  //
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
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
  data.dms.push(dm);
  setData(data);
  return { dmId: dm.dmId };
}

function dmDetailsV1(token: string, dmId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }
  if (!isValidDmId(dmId)) {
    return { error: 'error' };
  }
  if (!userIsDMmember(tokenId.uId, dmId)) {
    return { error: 'error' };
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
  return { error: 'error' };
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
  data.dms = data.dms.filter((dm) => dm.dmId !== dmId);
  setData(data);

  return {};
}

function dmLeaveV1(token: string, dmId: number) {
  // check if token passed in is valid
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    return { error: 'error' };
  }

  // check if dmId passed in is valid
  if (!isValidDmId(dmId)) {
    return { error: 'error' };
  }

  // check if user is a member of dm
  if (!userIsDMmember(tokenId.uId, dmId)) {
    return { error: 'error' };
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
