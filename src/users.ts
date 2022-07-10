/**
 * implementation of user-related functions
 * @module user
**/
import { getData } from './data';
import { tokenToUId } from './auth';

const errorObject = { error: 'error' };

/**
 * Function which, when given a valid token, calls userProfileV1
 * with the argument uId
 * @param token
 * @param uId
 * @returns
 */
export function userProfileV2(token: string, uId: number) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    return errorObject;
  }
  return userProfileV1(authUser.uId, uId);
}

/**
 * Function which, when given a valid token, returns an object with
 * an array containing information on all users
 * @param token
 * @returns
 */
export function usersAllV1(token: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    return errorObject;
  }
  const users = [];
  const data = getData();
  for (const user of data.users) {
    users.push({
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
    });
  }
  return { users: users };
}

interface userProfileV1Return {
  user?: {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string
  };
  error?: string;
}

/**
 * Function which, given a valid authUserId and uId, returns the
 * details of the user whose uId matches the argument uId
 * @param {number} authUserId
 * @param {number} uId
 * @returns {userProfileReturn}
 */
function userProfileV1(authUserId: number, uId: number): userProfileV1Return {
  if (!checkUserIdValid(authUserId)) {
    return errorObject;
  }
  const data = getData();
  for (const user of data.users) {
    if (uId === user.uId) {
      return {
        user: {
          uId: user.uId,
          email: user.email,
          nameFirst: user.nameFirst,
          nameLast: user.nameLast,
          handleStr: user.handleStr,
        }
      };
    }
  }

  return errorObject;
}

/**
 * Checks if a userId is valid.
 * @param {number} toCheck
 * @returns {boolean}
 */
function checkUserIdValid(toCheck: number) {
  const data = getData();
  for (const user of data.users) {
    if (toCheck === user.uId) {
      return true;
    }
  }
  return false;
}

export { userProfileV1 };
