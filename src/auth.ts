/**
 * implementation of auth-related functions
 * @module auth
**/
import { getData, setData } from './data';
import { checkUserData } from './users';
import { Notif } from './interfaces';
import isEmail from 'validator/lib/isEmail.js';
import HTTPError from 'http-errors';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const secret = 'COMP1531W14BHASHASHAHSHAHSA(*%&&%&*&&FKUYSCWLCW';

/**
 * Wrapper function which calls authRegisterV1 and generates a token
 * for the return object if successful.
 * @param email
 * @param password
 * @param nameFirst
 * @param nameLast
 * @returns {{token: string, authUserId: number}}
 */
export function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  const register = authRegisterV1(email, password, nameFirst, nameLast);
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
 * @returns {{token: string, authUserId: number}}
 */
export function authLoginV3(email: string, password: string) {
  const login = authLoginV1(email, password);
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
 * @returns {{}}
 */
export function authLogoutV2(token: string) {
  const data = getData();
  data.tokens = data.tokens.filter((pair) => pair.token !== token);
  setData(data);
  return {};
}

/**
 * A function called authLoginV1
 * Given a correct email - password pair, returns an object with
 * the matching user id
 * Throws an error if email does not belong to a user or
 * password is incorrect
 *
 * @param {string} email
 * @param {string} password
 * @returns {{authUserId: number}}
 */

export function authLoginV1(email: string, password: string) {
  const data = getData();
  for (const user of data.users) {
    if (email === user.email) {
      const inputHash = crypto.createHash('sha256').update(password + secret).digest('hex');
      if (inputHash === user.passwordHash) {
        return { authUserId: user.uId };
      }
    }
  }

  throw HTTPError(400, 'User not found!');
}

interface authRegisterV1Return {
  authUserId?: number;
  error?: string;
}

/**
 * A function called authRegisterV1
 * Registers a new user to the dataStore and returns their
 * unique user id
 * Throws an error if email is invalid, already used by another user,
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
  const registerTime = Math.floor((Date.now() / 1000));
  if (!isEmail(email)) {
    throw HTTPError(400, 'Invalid email!');
  }
  if (checkUserData(email, 'email')) {
    throw HTTPError(400, 'Email is already in use!');
  }
  if (password.length < 6) {
    throw HTTPError(400, 'Password is less than 6 characters!');
  }
  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'First name is not between 1 and 50 characters inclusive!');
  }
  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Last name is not between 1 and 50 characters inclusive!');
  }

  const data = getData();
  const newId = data.lastAuthUserId + 1;
  data.lastAuthUserId = newId;

  const handle = generateHandle(nameFirst, nameLast);
  let isGlobalOwner = false;

  const passwordHash = crypto.createHash('sha256').update(password + secret).digest('hex');

  if (newId === 1) {
    // the first user who signs up
    isGlobalOwner = true;
  }

  const newUser = {
    uId: newId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    passwordHash: passwordHash,
    handleStr: handle,
    isGlobalOwner: isGlobalOwner,
    notification: [] as Notif[],
    resetCodes: [] as string[],
    stats: {
      channelsJoined: [{ numChannelsJoined: 0, timeStamp: registerTime }],
      dmsJoined: [{ numDmsJoined: 0, timeStamp: registerTime }],
      messagesSent: [{ numMessagesSent: 0, timeStamp: registerTime }],
    }
  };

  data.users.push(newUser);
  setData(data);
  return {
    authUserId: newId
  };
}

/**
 * Given a valid email of a user, emails them with a reset code allowing
 * the password to be reset when passed to reset route.
 * Logs user out of all sessions
 * Return object always empty, does not throw errors
 * @param email
 */
export function authPasswordResetRequest(email: string) {
  const data = getData();

  for (const user of data.users) {
    if (user.email === email) {
      const resetCode = crypto.randomUUID();
      const transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: '0132b007a74eae',
          pass: 'f111d5fc0e1c90'
        }
      });
      const mailContent = {
        from: 'microsoft-treats-w14b-boost@server.com',
        to: email,
        subject: 'Password Reset Request',
        text: `Enter this code "${resetCode}" to reset your password. \nYou have been logged out of all user sessions.`
      };
      transport.sendMail(mailContent);
    
      // logout all sessions
      data.tokens = data.tokens.filter(pair => pair.uId !== user.uId);
      user.resetCodes.push(resetCode);
      setData(data);
    }
  }



  return {};
}

export function authPasswordResetReset(resetCode: string, newPassword: string) {
  if (newPassword.length < 6) {
    throw HTTPError(400, 'Password must be longer than 6 chars');
  }
  const data = getData();
  for (const user of data.users) {
    for (const code of user.resetCodes) {
      if (code === resetCode) {
        const passwordHash = crypto.createHash('sha256').update(newPassword + secret).digest('hex');
        user.passwordHash = passwordHash;
        setData(data);
        return {};
      }
    }
    user.resetCodes = user.resetCodes.filter(code => code !== resetCode);
  }

    throw HTTPError(400, 'Invalid reset code');
  

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
  const hashedToken = crypto.createHash('sha256').update(tokenStr + secret).digest('hex');
  data.lastToken = tokenNum;
  data.tokens.push({ token: hashedToken, uId: uId });
  setData(data);
  return hashedToken;
}

type tokenToUIdReturn = {
  uId?: number;
  error?: string;
}

/**
 * Given a token, return authUserId
 * Returns an error object if the token is invalid
 * @param {string} token
 * @returns {tokenToUIdReturn}
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
  while (checkUserData(finalHandle, 'handleStr')) {
    finalHandle = prelimHandle + `${i}`;
    i++;
  }

  return finalHandle;
}
