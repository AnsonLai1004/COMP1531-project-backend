import { getData, setData } from './data';
import { Message } from './interfaces';
import { membersobjCreate, isValidUserId } from './channel';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
export { dmLeaveV1, dmRemoveV2, dmListV2, dmCreateV2, dmDetailsV2 };

function dmCreateV2(token: string, uIds: number[]) {
  // any invalid uId in uIds
  for (const id of uIds) {
    if (!isValidUserId(id)) {
      throw HTTPError(400, 'Invalid uId');
    }
  }
  // any duplicate uId's in uIds
  const unique = Array.from(new Set(uIds));
  if (uIds.length !== unique.length) {
    throw HTTPError(400, 'duplicate uId');
  }
  //
  const tokenId = tokenToUId(token);
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
}

function dmDetailsV2(token: string, dmId: number) {
  const tokenId = tokenToUId(token);
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

function dmListV2(token: string) {
  // check if token passed in is valid
  const tokenId = tokenToUId(token);
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

function dmRemoveV2(token: string, dmId: number) {
  // check if token passed in is valid
  const tokenId = tokenToUId(token);

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
  try {
    const tokenId = tokenToUId(token);

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
  } catch (err) {
    return { error: 'error' };
  }
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
