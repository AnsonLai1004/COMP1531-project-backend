import { getData, setData } from './data';
import { Message, Channel } from './interfaces';
import { tokenToUId, membersobjCreate } from './channel';
export { dmDetailsV1 };


function dmDetailsV1(token, dmId) {
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


/////////////////////////// Helper Functions ////////////////////////////////
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
          if (member === dmId) {
            return true;
          }
        }
      }
    }
    return false;
}