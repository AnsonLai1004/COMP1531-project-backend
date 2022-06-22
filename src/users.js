import { getData } from './dataStore.js';

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
function userProfileV1(authUserId, uId) {
  return {
    user: {
      uId: 2, 
      email: 'different@gmail.com',
      nameFirst: 'Hermione',
      nameLast: 'Granger',
      handleStr: 'hermionegranger'
    }
  }
}

/**
 * Checks if a userId is valid.
 * @param {number} toCheck 
 * @returns {boolean}
 */
function checkUserIdValid(toCheck) {
  const data = getData();
  for (const user of data.users) {
    if (toCheck === user.uId) {
        return true;
    }
  }
  return false;
}

export { userProfileV1 }