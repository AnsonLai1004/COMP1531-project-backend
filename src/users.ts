/**
 * implementation of user-related functions
 * @module user
**/
import { User } from './interfaces';
import { getData, setData } from './data';
import { tokenToUId } from './auth';
import isEmail from 'validator/lib/isEmail.js';
import HTTPError from 'http-errors';

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
export function userProfileV3(token: string, uId: number) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
  }
  return userProfileV1(uId);
}

/**
 * Function which, when given a valid token, returns an object with
 * an array containing information on all users
 * @param token
 * @returns
 */
export function usersAllV2(token: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
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
export function userSetNameV2(token: string, nameFirst: string, nameLast: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'First name is not between 1 and 50 characters inclusive!');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Last name is not between 1 and 50 characters inclusive!');
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
export function userSetEmailV2(token: string, email: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
  }
  // check if email is invalid
  if (!isEmail(email)) {
    throw HTTPError(400, 'Invalid email!');
  }
  // check if email is used by another user
  if (checkUserData(email, 'email', authUser.uId)) {
    throw HTTPError(400, 'Email already in use!');
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
export function userSetHandleV2(token: string, handleStr: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
  }
  // check if handle is used by another user
  if (checkUserData(handleStr, 'handleStr', authUser.uId)) {
    throw HTTPError(400, 'Handle already in use!');
  }
  // check if contains non alphanumeric characters
  if (!(/^[0-9a-z]+$/i).test(handleStr)) {
    throw HTTPError(400, 'Handle cannot contain non alphanumeric characters!');
  }
  // check handle length
  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'Handle is not between 3 and 20 characters inclusive!');
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
 * @param {number} authUserId
 * @param {number} uId
 * @returns {userProfileReturn}
 */
export function userProfileV1(uId: number): userProfileV1Return {
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

  throw HTTPError(400, 'Invalid userId!');
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
