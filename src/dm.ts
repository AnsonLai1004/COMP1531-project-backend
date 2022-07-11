import { getData, setData } from './data';
import { Message } from './interfaces';
import { tokenToUId, membersobjCreate, isValidUserId } from './channel';
export { dmListV1, dmCreateV1, dmDetailsV1 };

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
      const members = membersobjCreate(dm.uIds);
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
    return { error: 'error' };
  }
  
  const data = getData();
  const dms = [];

  for (const dm of data.dms) {
    // check if user is owner / member of a dm
    if (tokenId.uId === dm.ownerId || dm.uIds.includes(tokenId.uId)) {
      dms.push({
        dmId: dm.dmId,
        name: dm.name,
      })
    }
  }

  return { dms: dms }
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
 * return false if user is not a member of the DM
 * @param {number} uId
 * @param {number} channelId
 * @returns {boolean}
 */
function userIsDMmember(uId: number, dmId: number) {
  const data = getData();
  for (const dm of data.dms) {
    if (dm.dmId === dmId) {
      for (const member of dm.uIds) {
        if (member === uId) {
          return true;
        }
      }
    }
  }

  return false;
}
