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

    const newUser = {
        'uId': newId,
        'nameFirst': nameFirst,
        'nameLast': nameLast,
        'email': email,
        'password': password,
        'handleStr': handle,
        'profilePicUrl': '/path/to/image',
        'isOnline': true,
        'isOwner': true,
    };

    data.users.push(newUser);
    setData(data);

    return {
        authUserId: newId
    }
}

/**
 * Function which checks if a particular piece of data is
 * already used by another user.
 * @param {string} toCheck
 * @param {string} field
 * @returns {boolean}
 */
function checkDuplicateUserData(toCheck, field) {
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
const generateHandle = function(nameFirst, nameLast) {
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
}
