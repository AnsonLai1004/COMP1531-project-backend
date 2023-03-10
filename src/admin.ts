import { getData, setData } from './data';
import { isValidUserId } from './channel';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
export function adminUserRemoveV1(token: string, uId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  if (!isValidUserId(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }
  const globalOwner = isOnlyGlobalOwner(tokenId.uId);
  if (globalOwner.globalOwner === false) {
    throw HTTPError(403, 'auth user not a global owner');
  }
  const user = isOnlyGlobalOwner(uId);
  if (user.globalOwner === true && user.count === 1) {
    throw HTTPError(400, 'only global owner');
  }

  // removed from all channels/DMS
  // contents of the messages they sent - replaced by 'Removed user'
  const data = getData();
  for (const channel of data.channels) {
    channel.ownerMembers = channel.ownerMembers.filter(id => { return id !== uId; });
    channel.allMembers = channel.allMembers.filter(id => { return id !== uId; });
    for (const message of channel.messages) {
      if (uId === message.uId) {
        message.message = 'Removed user';
      }
    }
  }
  for (const dm of data.dms) {
    if (dm.ownerId === uId) {
      dm.ownerId = undefined;
    }
    dm.uIds = dm.uIds.filter(id => { return id !== uId; });
    for (const message of dm.messages) {
      if (uId === message.uId) {
        message.message = 'Removed user';
      }
    }
  }
  // not be included in user array returned by users/all
  // profile still be retrievable with user/profile
  // change nameFirst - Removed, nameLast - user
  // user's email and handle should be reusable
  const indexOfUser = data.users.findIndex(object => { return object.uId === uId; });
  data.users[indexOfUser].nameFirst = 'Removed';
  data.users[indexOfUser].nameLast = 'user';
  setData(data);
  return {};
}

export function adminUserPermissionChangeV1(token: string, uId: number, permissionId: number) {
  const tokenId = tokenToUId(token);
  if (tokenId.error) {
    throw HTTPError(403, 'Invalid token');
  }
  const globalOwner = isOnlyGlobalOwner(tokenId.uId);
  if (globalOwner.globalOwner === false) {
    throw HTTPError(403, 'auth user not a global owner');
  }
  if (!isValidUserId(uId)) {
    throw HTTPError(400, 'Invalid uId');
  }
  if (permissionId < 1 || permissionId > 2) {
    throw HTTPError(400, 'Invalid permissionId');
  }
  if (permissionId === 2) {
    const user = isOnlyGlobalOwner(uId);
    if (user.globalOwner === true && user.count === 1) {
      throw HTTPError(400, 'only global owner cannot demote to user');
    }
  }
  const data = getData();
  for (const user of data.users) {
    if (uId === user.uId) {
      const isOwner = user.isGlobalOwner;
      if (isOwner === true) {
        if (permissionId === 1) {
          throw HTTPError(400, 'user already has the permissions level');
        }
      } else {
        if (permissionId === 2) {
          throw HTTPError(400, 'user already has the permissions level');
        }
      }
      if (permissionId === 1) {
        user.isGlobalOwner = true;
      } else {
        user.isGlobalOwner = false;
      }
    }
  }
  setData(data);
  return {};
}

function isOnlyGlobalOwner(uId: number) {
  const data = getData();
  let isGlobalOwner = false;
  let count = 0;
  for (const user of data.users) {
    if (uId === user.uId) {
      if (user.isGlobalOwner === true) {
        isGlobalOwner = true;
        count++;
      }
    } else {
      if (user.isGlobalOwner === true) {
        count++;
      }
    }
  }
  return {
    globalOwner: isGlobalOwner,
    count: count,
  };
}
