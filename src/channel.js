/**
 * implementation of channel.js
**/

import { getData, setData } from './dataStore.js';

// Sample stub for a function 'channelInviteV1', 
// with arguments named 'authUserId', 'channelId', 'uId'
// Returns empty object if no error
function channelInviteV1(authUserId, channelId, uId) {
    return {};
}

// Sample stub for a function 'channelMessagesV1', 
// with arguments named 'authUserId', 'channelId', 'start'
// Returns object with types 'messages', 'start', 'end' if no error
function channelMessagesV1(authUserId, channelId, start) {
    return {
        messages: [],
        start: 0,
        end: -1,
    };
}

/**
 * Given a channel with ID channelId that the authorised user is a member of, 
 * provide basic details about the channel.
 * @param {integer} authUserId 
 * @param {integer} channelId
 * @returns {{name: string, isPublic: boolean, ownerMembers: integer[], allMembers: integer[]}}
 */
function channelDetailsV1(authUserId, channelId) {
    // check if authUserId is valid
    if (!isValidUserId(authUserId)) {
        return { error: 'error' };
    }

    const data = getData();
    for (let channel of data.channels) {
        if (channel.channelId === channelId) {
            // check if authUserId is member
            let isMember = false;
            for (let userId of channel.allMembers) {
                if (userId === authUserId) {
                    isMember = true;
                }
            }
            if (isMember === false) {
                return { error: 'error' };
            }
            return {
                name: channel.name, 
                isPublic: channel.isPublic,
                ownerMembers: channel.ownerMembers,
                allMembers: channel.allMembers,
            };           
        }
    }
    return { error: 'error' };   
}

/**
 * Given a channelId of a channel that the authorised  
 * user can join, adds them to that channel.
 * @param {integer} authUserId 
 * @param {integer} channelId
 * @returns {{}}
 */
function channelJoinV1(authUserId, channelId) {    
    if (!isValidUserId(authUserId)) {
        return { error: 'error' };
    }
    // check if channel exist, if yes return channel detail
    const data = getData();
    let channelDetail = undefined;
    for (let channel of data.channels) {
        if (channelId === channel.channelId) {
            channelDetail = channel;
        }
    }
    if (channelDetail === undefined) {
        return { error: 'error' };
    }
    // check if channel is private, if yes check if user is global owner
    if (channelDetail.isPublic === false) {        
        for (let user of data.users) {
            if (authUserId === user.uId) {
                if (user.isOwner === false) {
                    return { error: 'error' };
                }
            }
        }
    }
    // check if user is already a member
    for (let id of channelDetail.allMembers) {
        if (authUserId === id) {
            return { error: 'error' };
        }
    }
    // add memeber to channel
    for (let channel of data.channels) {
        if (channelId === channel.channelId) {
            channel.allMembers.push(authUserId);
            setData(data);
        }
    }
    return {};
}


/**
 * Helper function  
 * return false if authUserId is not valid 
 * @param {integer} authUserId 
 * @returns {boolean}
 */
function isValidUserId(authUserId) {
    const data = getData();
    for (let user of data.users) {
        if (authUserId === user.uId) {
            return true;
        }
    }
    return false;
}

export { channelDetailsV1, channelInviteV1, channelJoinV1, channelMessagesV1 }
