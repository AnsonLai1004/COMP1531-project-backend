"use strict";
exports.__esModule = true;
exports.userProfileV1 = void 0;
var dataStore_js_1 = require("./dataStore.js");
var errorObject = { error: 'error' };
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
    if (!checkUserIdValid(authUserId)) {
        return errorObject;
    }
    var data = (0, dataStore_js_1.getData)();
    for (var _i = 0, _a = data.users; _i < _a.length; _i++) {
        var user = _a[_i];
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
exports.userProfileV1 = userProfileV1;
/**
 * Checks if a userId is valid.
 * @param {number} toCheck
 * @returns {boolean}
 */
function checkUserIdValid(toCheck) {
    var data = (0, dataStore_js_1.getData)();
    for (var _i = 0, _a = data.users; _i < _a.length; _i++) {
        var user = _a[_i];
        if (toCheck === user.uId) {
            return true;
        }
    }
    return false;
}
