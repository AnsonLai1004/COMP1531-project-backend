/**
 * implementation of auth-related functions
 * @module auth
**/
import { User } from './interfaces';
import { getData, setData } from './data';
import isEmail from 'validator/lib/isEmail.js';

const errorObject = { error: 'error' };

// console.log(getData());

/**
 * A function called authLoginV1
 * Given a correct email - password pair, returns an object with
 * the matching user id
 * Returns an errorObject if email does not belong to a user or
 * password is incorrect
 *
 * @param {string} email
 * @param {string} password
 * @returns {{authUserId: number}}
 */

export function authLoginV1(email: string, password: string) {
  const data = getData();
  for (const user of data.users) {
    if (email === user.email && password === user.password) {
      return { authUserId: user.uId };
    }
  }

  return errorObject;
}

interface authRegisterV1Return {
  authUserId?: number;
  error?: string;
}

/**
 * A function called authRegisterV1
 * Registers a new user to the dataStore and returns their
 * unique user id
 * Returns an errorObject if email is invalid, already used by another user,
 * password is less than 6 characters, or nameFirst or nameLast are not
 * between 1 and 50 characters inclusive.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {{authUserId: number}}
 */
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): authRegisterV1Return {
  if (!isEmail(email) || checkDuplicateUserData(email, 'email')) {
    return errorObject;
  }
  if (password.length < 6) {
    return errorObject;
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    return errorObject;
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    return errorObject;
  }

  const data = getData();
  const newId = data.lastAuthUserId + 1;
  data.lastAuthUserId = newId;

  const handle = generateHandle(nameFirst, nameLast);
  let isGlobalOwner = false;

  if (newId === 1) {
    // the first user who signs up
    isGlobalOwner = true;
  }

  const newUser = {
    uId: newId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    handleStr: handle,
    isGlobalOwner: isGlobalOwner,
  };

  data.users.push(newUser);
  setData(data);
  return {
    authUserId: newId
  };
}

/**
 * Wrapper function which calls authRegisterV1 and generates a token
 * for the return object if successful.
 * @param email
 * @param password
 * @param nameFirst
 * @param nameLast
 */
export function authRegisterV2(email: string, password: string, nameFirst: string, nameLast: string) {
  const register = authRegisterV1(email, password, nameFirst, nameLast);
  if ('error' in register) {
    return errorObject;
  }
  const token = generateToken(register.authUserId);
  return {
    token: token,
    authUserId: register.authUserId
  };
}

/**
 * Wrapper function which calls authLoginV1 and generates a token
 * for the return object if successful.
 * @param email
 * @param password
 */
export function authLoginV2(email: string, password: string) {
  const login = authLoginV1(email, password);
  if ('error' in login) {
    return errorObject;
  }

  const token = generateToken(login.authUserId);
  return {
    token: token,
    authUserId: login.authUserId
  };
}

/**
 * Function which invalidates the token given to it by removing
 * the associated token-uId pair from the dataStore.
 * @param token
 * @returns
 */
export function authLogoutV1(token: string) {
  const data = getData();
  data.tokens = data.tokens.filter((pair) => pair.token !== token);
  setData(data);
  return {};
}

/// //////////////////////// Helper Functions ////////////////////////////////

/**
 * Function which generates a new unique user token
 * @returns {string}
 */
function generateToken(uId: number) {
  const data = getData();
  const tokenNum = data.lastToken + 1;
  const tokenStr = tokenNum.toString();
  data.lastToken = tokenNum;
  data.tokens.push({ token: tokenStr, uId: uId });
  setData(data);
  return tokenStr;
}


type tokenToUIdReturn = {
  uId?: number;
  error?: string;
}

/**
 * Given a token, return authUserId
 * @param {string} token
 * @returns {number}
 */
 export function tokenToUId(token: string): tokenToUIdReturn {
  const data = getData();
  for (const element of data.tokens) {
    if (element.token === token) {
      return { uId: element.uId };
    }
  }
  return { error: 'error' };
}

/**
 * Function which checks if a particular piece of data is
 * already used by another user.
 * @param {string | number} toCheck
 * @param {string} field
 * @returns {boolean}
 */
function checkDuplicateUserData(toCheck: string | number, field: keyof User): boolean {
  // console.log(setData);
  const data = getData();
  for (const user of data.users) {
    if (toCheck === user[field]) {
      return true;
    }
  }
  return false;
}

/**
 * A function which generates a unique user handle based on
 * first name and last name concatenated, casted to lowercase,
 * non-alphanumeric characters removed and truncated at 20 characters.
 * A number index is appended at the end if the handle already exists.
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {string}
 */
function generateHandle(nameFirst: string, nameLast: string) {
  let prelimHandle = (nameFirst + nameLast).toLowerCase();
  prelimHandle = prelimHandle.replace(/[_\W]/g, '');
  prelimHandle = prelimHandle.slice(0, 20);

  let finalHandle = prelimHandle;
  let i = 0;
  while (checkDuplicateUserData(finalHandle, 'handleStr')) {
    finalHandle = prelimHandle + `${i}`;
    i++;
  }

  return finalHandle;
};
