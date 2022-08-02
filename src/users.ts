/**
 * implementation of user-related functions
 * @module user
**/
import { User } from './interfaces';
import { getData, setData } from './data';
import { tokenToUId } from './auth';
import isEmail from 'validator/lib/isEmail.js';

const errorObject = { error: 'error' };

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
 * Function which, when given a valid token, calls userProfileV1
 * with the argument uId
 * @param token
 * @param uId
 * @returns
 */
export function userProfileV2(token: string, uId: number): userProfileV1Return {
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

/**
 * Function which updates the name of the user associated with the token.
 * Returns an error object if either the first or last name are
 * not between 1 and 50 characters inclusive.
 * @param token
 * @param nameFirst
 * @param nameLast
 * @returns
 */
export function userSetNameV1(token: string, nameFirst: string, nameLast: string) {
  const authUser = tokenToUId(token);
  // check if token is invalid
  if ('error' in authUser) {
    return errorObject;
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return errorObject;
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return errorObject;
  }
  const data = getData();
  for (const user of data.users) {
    if (authUser.uId === user.uId) {
      user.nameFirst = nameFirst;
      user.nameLast = nameLast;
      setData(data);
      return {};
    }
  }
}

/**
 * Function which updates the email of the user associated with the token.
 * Returns an error object if the email is invalid or already in use by another user.
 * @param token
 * @param email
 * @returns
 */
export function userSetEmailV1(token: string, email: string) {
  const authUser = tokenToUId(token);
  // check if token is invalid
  if ('error' in authUser) {
    return errorObject;
  }
  // check if email is invalid or used by another user
  if (!isEmail(email) || checkUserData(email, 'email', authUser.uId)) {
    return errorObject;
  }
  const data = getData();
  for (const user of data.users) {
    if (authUser.uId === user.uId) {
      user.email = email;
      setData(data);
      return {};
    }
  }
}

/**
 * Function which updates the handle of the user associated with the token.
 * Returns an error object if the handle has non-alphanumeric characters,
 * is already in use by another user, or is not between 3 & 20 chars inclusive.
 * @param token
 * @param handleStr
 * @returns
 */
export function userSetHandleV1(token: string, handleStr: string) {
  const authUser = tokenToUId(token);
  // check if token is invalid
  if ('error' in authUser) {
    return errorObject;
  }
  // check if handle is used by another user or has non-alphanumeric characters
  if (checkUserData(handleStr, 'handleStr', authUser.uId) || !(/^[0-9a-z]+$/i).test(handleStr)) {
    return errorObject;
  }
  // check handle length
  if (handleStr.length < 3 || handleStr.length > 20) {
    return errorObject;
  }
  const data = getData();
  for (const user of data.users) {
    if (authUser.uId === user.uId) {
      user.handleStr = handleStr;
      setData(data);
      return {};
    }
  }
}

/**
 * Function which returns the details of the user whose uId matches the argument uId
 * Assumes that the given authUserId is valid
 * @param {number} authUserId
 * @param {number} uId
 * @returns {userProfileReturn}
 */
export function userProfileV1(authUserId: number, uId: number): userProfileV1Return {
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

/// // HELPER FUNCTIONS

/**
 * Function which checks if a particular piece of data is
 * already used by another user.
 * Optional parameter "excludeId" to remove from the search
 * @param {string | number} toCheck
 * @param {string} field
 * @returns {boolean}
 */
export function checkUserData(toCheck: string | number, field: keyof User, excludeId?: number): boolean {
  const data = getData();
  for (const user of data.users) {
    if (excludeId !== undefined && excludeId === user.uId) {
      continue;
    }
    if (toCheck === user[field]) {
      return true;
    }
  }
  return false;
}
