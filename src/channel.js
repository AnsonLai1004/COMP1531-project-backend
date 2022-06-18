/**
 * implementation of channel.js
**/


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
    return {
        name: 'secret candy crush team', 
        isPublic: true,
        ownerMembers: [],
        allMembers: [],
    };
    
}

// Sample stub for a function 'channelJoinV1', 
// with arguments named 'authUserId', 'channelId'
// Returns empty object if no error
function channelJoinV1(authUserId, channelId) {
    return {};
}
