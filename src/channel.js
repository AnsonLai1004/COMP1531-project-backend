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

// Sample stub for a function 'channelDetailsV1', 
// with arguments named 'authUserId', 'channelId'
// Returns a object with types 'name', 'isPublic', 
// ownerMembers', 'allMembers' if no error
function channelDetailsV1(authUserId, channelId) {
    // check if authUserId is valid
    if (!isValidUserId(authUserId)) {
        return { error: 'error' };
    }
    //
    const data = getData();
    for (let channel of data.channels) {
        if (channel.cId === channelId) {
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
                name: channel.channelName, 
                isPublic: channel.isPublic,
                ownerMembers: channel.ownerIds,
                allMembers: channel.memberIds,
            };           
        }
    }
    return { error: 'error' };   
}

// Sample stub for a function 'channelJoinV1', 
// with arguments named 'authUserId', 'channelId'
// Returns empty object if no error
function channelJoinV1(authUserId, channelId) {
    return {};
}

// Helper function
// return false if authUserId is not valid 
function isValidUserId(authUserId) {
    const data = getData;
    for (let user of data.users) {
        if (authUserId === user.uId) {
            return true;
        }
    }
    return false;
}
export { channelInviteV1, channelMessagesV1, channelDetailsV1, channelJoinV1 }