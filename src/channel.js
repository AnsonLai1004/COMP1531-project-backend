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


// with arguments named 'authUserId', 'channelId'
// Returns a object with types 'name', 'isPublic', 
// ownerMembers', 'allMembers' if no error
// Given a channel with ID channelId that the 
// authorised user is a member of, provide basic 
// details about the channel.
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
// Given a channelId of a channel that the authorised 
// user can join, adds them to that channel.
function channelJoinV1(authUserId, channelId) {
    if (!isValidChannelId(channelId) || !isValidUserId(authUserId)) {
        return { error: 'error' };
    }
    // check if channel is private, if yes check if user is global owner
    const channel = channelDetailsV1(channelId);
    const data = getData();
    if (channel.isPublic === false) {        
        for (let user of data.users) {
            if (authUserId === user.uId) {
                if (user.isOwner === false) {
                    return { error: 'error' };
                }
            }
        }
    }
    // need to check if user is already a member
    for (let id of channel.allMembers) {
        if (authUserId === id) {
            return { error: 'error' };
        }
    }
    // 
    for (let channel of data.channels) {
        if (channelId === channel.cId) {
            channel.memberIds.push(authUserId);
            setData(data);
        }
    }
    return {};
}

// Helper functions
// return false if channelId does not refer to a valid channel
function isValidChannelId(channelId) {
    const data = getData();
    for (let channel of data.channels) {
        if (channelId === channel.cId) {
            return true;
        }
    }
    return false;
}
// return false if authUserId is not valid 
function isValidUserId(authUserId) {
    const data = getData();
    for (let user of data.users) {
        if (authUserId === user.uId) {
            return true;
        }
    }
    return false;
}
export { channelInviteV1, channelMessagesV1, channelDetailsV1, channelJoinV1 }