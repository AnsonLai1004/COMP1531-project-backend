/**
 * implementation of auth.js
**/

import { getData, setData } from './dataStore.js';
import isEmail from 'validator/lib/isEmail.js';

const errorObject = {error: 'error'};

// sample stub for a function called authLoginV1
// takes arguments 'email' (string) and 'password' (string)
// returns object containing type 'authUserId' (integer) if no error
export function authLoginV1(email, password) {
    return {
        authUserId: 1,
    }
}

// sample stub for a function called authRegisterV1
// takes arguments 'email' (string), 'password' (string),
// 'nameFirst' (string), and 'nameLast' (string)
// returns object containing type 'authUserId' (integer) if no error
export function authRegisterV1(email, password, nameFirst, nameLast) {
    if (!isEmail(email) || checkEmailIsUsed(email)) {
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
    return {
        authUserId: 1,
    }
}

/**
 * Function which checks if an email is already used by another user.
 * @param {string} email 
 * @returns {boolean}
 */
function checkEmailIsUsed(email) {
    const data = getData();
    for (const user in data.users) {
        if (email === user.email) {
            return true;
        }
    }
    return false;
}