/**
 * implementation of user-related functions
 * @module user
**/
import { getData } from './dataStore';

const errorObject = { error: 'error' };

interface userProfileReturn {
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
function userProfileV1(authUserId: number, uId: number): userProfileReturn {
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
          handleStr: user.handleStr
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
