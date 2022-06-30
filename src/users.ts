import { getData } from './dataStore.js';

const errorObject = { error: 'error' };

/**
 * Function which, given a valid authUserId and uId, returns the
 * details of the user whose uId matches the argument uId
 * @param {number} authUserId
 * @param {number} uId
 * @returns {user: {
 *  uId: number,
 *  email: string,
  * nameFirst: string,
  * nameFirst: string,
  * handleStr: string
 * }}
 */
function userProfileV1(authUserId: number, uId: number) {
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
