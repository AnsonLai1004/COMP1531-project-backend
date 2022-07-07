"use strict";
exports.__esModule = true;
exports.channelMessagesV1 = exports.channelJoinV1 = exports.channelInviteV1 = exports.channelDetailsV1 = void 0;
var dataStore_js_1 = require("./dataStore.js");
var users_js_1 = require("./users.js");
/**
 * implementation of channel.js
**/
/**
 * Invites a user with ID uId to join a channel with ID channelId.
 * returns empty if success, otherwise error
 * @param {number} authUserId
 * @param {number} channelId
 * @param {number} uId
 * @returns {{}}
*/
function channelInviteV1(authUserId, channelId, uId) {
    var dataStore = (0, dataStore_js_1.getData)();
    // check uid and channel id exist
    var founduid = dataStore.users.some(function (el) { return el.uId === uId; });
    var foundchannel = dataStore.channels.some(function (el) { return el.channelId === channelId; });
    if (!founduid) {
        return { error: 'error' };
    }
    if (!foundchannel) {
        return { error: 'error' };
    }
    // check uId already a member in channels or not
    for (var _i = 0, _a = dataStore.channels; _i < _a.length; _i++) {
        var element = _a[_i];
        if (element.channelId === channelId) {
            for (var _b = 0, _c = element.allMembers; _b < _c.length; _b++) {
                var members = _c[_b];
                if (members === uId) {
                    return { error: 'error' };
                }
            }
        }
    }
    // check authorized user who invited the member is not a member of the group
    var channel = dataStore.channels.filter(function (el) { return el.channelId === channelId; });
    var exactchannel = channel[0];
    var checkowners = exactchannel.ownerMembers.includes(authUserId);
    var checkmembers = exactchannel.allMembers.includes(authUserId);
    if (!checkowners && !checkmembers) {
        return { error: 'error' };
    }
    exactchannel.allMembers.push(uId);
    (0, dataStore_js_1.setData)(dataStore);
    return {};
}
exports.channelInviteV1 = channelInviteV1;
/**
 * Given a channel with ID channelId that the authorised user is a member of
 * return up to 50 messages between index "start" and "start + 50"
 * return end = -1 if end of messages.
 * otherwise return error.
 * @param {number} authUserId
 * @param {number} channelId
 * @param {number} start
 * @returns {{messages: Arr object of type message, start:  number, end:  number}}
 */
function channelMessagesV1(authUserId, channelId, start) {
    var dataStore = (0, dataStore_js_1.getData)();
    // check uid and channel id exist
    // check authorized user who invited the member is not a member of the group
    var foundchannel = dataStore.channels.some(function (el) { return el.channelId === channelId; });
    if (!foundchannel) {
        return { error: 'error' };
    }
    var channel = dataStore.channels.filter(function (el) { return el.channelId === channelId; });
    var exactchannel = channel[0];
    var checkowners = exactchannel.ownerMembers.includes(authUserId);
    var checkmembers = exactchannel.allMembers.includes(authUserId);
    if (!checkowners && !checkmembers) {
        return { error: 'error' };
    }
    // find channel get length of messages
    var numofmessages = 0;
    var messages = [];
    for (var _i = 0, _a = dataStore.channels; _i < _a.length; _i++) {
        var element = _a[_i];
        if (element.channelId === channelId) {
            numofmessages = element.messages.length;
            messages = element.messages;
            break;
        }
    }
    if (start > numofmessages) {
        return { error: 'error' };
    }
    var end = start + 50;
    if (end < numofmessages) {
        return {
            messages: messages,
            start: start,
            end: end
        };
    }
    else {
        return {
            messages: messages,
            start: start,
            end: -1
        };
    }
}
exports.channelMessagesV1 = channelMessagesV1;
/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * provide basic details about the channel.
 * @param {number} authUserId
 * @param {number} channelId
 * @returns {{name: string, isPublic: boolean, ownerMembers:  number[], allMembers:  number[]}}
 */
function channelDetailsV1(authUserId, channelId) {
    // check if authUserId is valid
    if (!isValidUserId(authUserId)) {
        return { error: 'error' };
    }
    var data = (0, dataStore_js_1.getData)();
    for (var _i = 0, _a = data.channels; _i < _a.length; _i++) {
        var channel = _a[_i];
        if (channel.channelId === channelId) {
            // check if authUserId is member
            var isMember = false;
            for (var _b = 0, _c = channel.allMembers; _b < _c.length; _b++) {
                var userId = _c[_b];
                if (userId === authUserId) {
                    isMember = true;
                }
            }
            if (isMember === false) {
                return { error: 'error' };
            }
            var owners = membersobjCreate(channel.ownerMembers);
            var members = membersobjCreate(channel.allMembers);
            return {
                name: channel.name,
                isPublic: channel.isPublic,
                ownerMembers: owners,
                allMembers: members
            };
        }
    }
    return { error: 'error' };
}
exports.channelDetailsV1 = channelDetailsV1;
/**
 * Given a channelId of a channel that the authorised
 * user can join, adds them to that channel.
 * @param {number} authUserId
 * @param {number} channelId
 * @returns {{}}
 */
function channelJoinV1(authUserId, channelId) {
    if (!isValidUserId(authUserId)) {
        return { error: 'error' };
    }
    // check if channel exist, if yes return channel detail
    var data = (0, dataStore_js_1.getData)();
    var channelDetail = undefined;
    for (var _i = 0, _a = data.channels; _i < _a.length; _i++) {
        var channel = _a[_i];
        if (channelId === channel.channelId) {
            channelDetail = channel;
        }
    }
    if (channelDetail === undefined) {
        return { error: 'error' };
    }
    // check if channel is private, if yes check if user is global owner
    if (channelDetail.isPublic === false) {
        for (var _b = 0, _c = data.users; _b < _c.length; _b++) {
            var user = _c[_b];
            if (authUserId === user.uId) {
                if (user.isGlobalOwner === false) {
                    return { error: 'error' };
                }
            }
        }
    }
    // check if user is already a member
    for (var _d = 0, _e = channelDetail.allMembers; _d < _e.length; _d++) {
        var id = _e[_d];
        if (authUserId === id) {
            return { error: 'error' };
        }
    }
    // add memeber to channel
    for (var _f = 0, _g = data.channels; _f < _g.length; _f++) {
        var channel = _g[_f];
        if (channelId === channel.channelId) {
            channel.allMembers.push(authUserId);
            (0, dataStore_js_1.setData)(data);
        }
    }
    return {};
}
exports.channelJoinV1 = channelJoinV1;
/**
 * Helper function
 * return false if authUserId is not valid
 * @param {number} authUserId
 * @returns {boolean}
 */
function isValidUserId(authUserId) {
    var data = (0, dataStore_js_1.getData)();
    for (var _i = 0, _a = data.users; _i < _a.length; _i++) {
        var user = _a[_i];
        if (authUserId === user.uId) {
            return true;
        }
    }
    return false;
}
function membersobjCreate(MembersArr) {
    var result = [];
    var data = (0, dataStore_js_1.getData)();
    for (var _i = 0, MembersArr_1 = MembersArr; _i < MembersArr_1.length; _i++) {
        var memberid = MembersArr_1[_i];
        var user = (0, users_js_1.userProfileV1)(memberid, memberid);
        result.push({
            uId: user.user.uId,
            email: user.user.email,
            nameFirst: user.user.nameFirst,
            nameLast: user.user.nameLast,
            handleStr: user.user.handleStr
        });
    }
    return result;
}
