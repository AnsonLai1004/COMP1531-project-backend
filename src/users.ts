/**
 * implementation of user-related functions
 * @module user
**/
import { User } from './interfaces';
import { getData, setData, getUserStats, getWorkplaceStats } from './data';
import { tokenToUId } from './auth';
import isEmail from 'validator/lib/isEmail.js';
import HTTPError from 'http-errors';
import request from 'sync-request';
import fs from 'fs';
import sizeOf from 'image-size';
import sharp from 'sharp';
import config from './config.json';

interface userProfileV1Return {
  user?: {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string,
    profileImgUrl: string,
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
    if (user.nameFirst !== 'Removed' && user.nameLast !== 'user') {
      users.push({
        uId: user.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
        profileImgUrl: user.profileImgUrl,
        notification: [],
      });
    }
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
 * Function which returns the analytics stats of a given user
 * Includes the number of channels and dms they have joined and
 * the number of messages they have sent
 * @param token
 * @returns
 */
export function userStatsV1(token: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
  }
  return getUserStats(authUser.uId);
}

/**
 * Function which returns the analytics stats of the workplace
 * @param token
 */
export function usersStatsV1(token: string) {
  const authUser = tokenToUId(token);
  if ('error' in authUser) {
    throw HTTPError(403, 'Invalid token!');
  }
  return getWorkplaceStats();
}

/**
 * Given a URL of an image on the internet, crop the image within bounds 
 * (xStart, yStart) and (xEnd, yEnd). Position (0,0) is the top left.
 * @param { imgUrl, xStart, yStart, xEnd, yEnd }
 * @returns {}
 */
export function userUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const tokenId = tokenToUId(token);
  // check if token valid
  if ('error' in tokenId) {
    throw HTTPError(403, 'Invalid token!');
  }
  // make request
  const res = request(
    'GET',
    imgUrl
  );
  // check if request to get image failes
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'Error getting image');
  }
  // save image locally
  const body = res.body;
  const imgPath = `img/${tokenId.uId}.jpg`
  fs.writeFileSync(imgPath, body, { flag: 'w' });
  // get dimensions
  const dimensions = sizeOf(imgPath);
  const x = dimensions.width;
  const y = dimensions.height;
  // dimension errors
  if (xEnd > x || xStart < 0 || yEnd > y || yStart < 0 || xStart >= xEnd || yStart >= yEnd) {
    console.log(dimensions, x, y, xEnd, yEnd, xStart, yStart)
    throw HTTPError(400, 'Illegal dimensions');
  }
  // crop image - NOT WORKING
  sharp(imgPath).extract({ width: xEnd - xStart, height: yEnd - yStart, left: xStart, top: yStart }).toFile(imgPath)
  .then(function(success) {
      console.log("Image cropped and saved");
  })
  .catch(function(err) {
      console.log("An error occured");
  });
  // set users profile img url
  const PORT: number = parseInt(process.env.PORT || config.port);
  const HOST: string = process.env.IP || 'localhost';
  const data = getData()
  for (const user of data.users) {
    if (user.uId === tokenId.uId) {
      user.profileImgUrl = `http://${HOST}:${PORT}/${imgPath}`
      console.log(user)
    }
  }
  setData(data)
  return {};
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
          profileImgUrl: user.profileImgUrl,
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
