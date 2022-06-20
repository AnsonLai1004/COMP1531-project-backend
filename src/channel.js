import { getData, setData } from './dataStore.js'
/**
 * implementation of channel.js
**/


// Sample stub for a function 'channelInviteV1', 
// with arguments named 'authUserId', 'channelId', 'uId'
// Returns empty object if no error
function channelInviteV1(authUserId, channelId, uId) {
    const dataStore = getData();

    // check uid and channel id exist
    const founduid = dataStore.users.some(el => el.uId === uId);
    const foundchannel = dataStore.channels.some(el => el.channelId === channelId);
    if (!foundid) {
        return { error: 'error' };
    }
    if (!foundchannel) {
        return { error: 'error'};
    }

    // check uId already a member in channels or not
    for (const element of dataStore.channels) {
        if (element.channelId === channelId) {
            for (const members of element.allMembers) {
                if (members === uId) {
                    return { error: 'error'};
                }
            }
        }
    }

    // check authorized user who invited the member is not a member of the group
    const checkowners = dataStore.channels.ownerMembers.some(el => el === authUserId);
    const checkmembers = dataStore.channels.allMembers.some(el => el === authUserId);

    if (!checkowners && !checkmembers) {
        return {error: 'error'};
    }
    
    dataStore.channels.allMembers.push(uId);
    setData(dataStore);
    return {};
}

// Sample stub for a function 'channelMessagesV1', 
// with arguments named 'authUserId', 'channelId', 'start'
// Returns object with types 'messages', 'start', 'end' if no error
function channelMessagesV1(authUserId, channelId, start) {
    const dataStore = getData();

    // check uid and channel id exist
    // check authorized user who invited the member is not a member of the group
    const checkowners = dataStore.channels.ownerMembers.some(el => el === authUserId);
    const checkmembers = dataStore.channels.allMembers.some(el => el === authUserId);
    const foundchannel = dataStore.channels.some(el => el.channelId === channelId);

    if (!checkowners && !checkmembers) {
        return {error: 'error'};
    }
    if (!foundchannel) {
        return { error: 'error'};
    }
    
    // find channel get length of messages
    let numofmessages = 0;
    for (const element of dataStore.channels) {
        if (element.channelId === channelId) {
            numofmessages = element.messages.length;
            break;
        }
    }
    if (start > numofmessages) {
        return { error: 'error'};
    }
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
