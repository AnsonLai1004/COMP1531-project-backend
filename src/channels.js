import { getData, setData } from './dataStore.js'

//  Creates a new channel object and appends it to the channels section of the dataStore
// Arguments - 
//  @authUserId (integer)
//  @name (string)
//  @isPublic (boolean)
// Returns -
//  @channelId (integer)
function channelsCreateV1(authUserId, name, isPublic) {

    // INVALID NAME
    if (name.length < 1 || name.length > 20) {
        return {error: "error"};
    }

    // CHECK IF USERID VALID
    const dataStore = getData();
    const validId = checkValidId(authUserId, dataStore);
    
    if (!(validId)) {
        return {error: "error"};
    }

    const channel = {
        channelId: dataStore.lastChannelId + 1,
        name: name,
        isPublic: isPublic,
        ownerMember: [authUserId],
        allMembers: [authUserId],
        messages: [],
    }
    
    dataStore.channels.push(channel);
    dataStore.lastChannelId++;
    setData(dataStore);
    
    return {channelId: channel.channelId};
}

// Sample stub for a function 'channelsListV1', 
// with arguments named 'authUserId'
// Returns object with type 'channels' if no error
function channelsListV1(authUserId) {

    // CHECK IF USERID VALID
    const dataStore = getData();
    const validId = checkValidId(authUserId, dataStore);
    
    if (!(validId)) {
        return {error: "error"};
    }

    const channels = [];
    
    for (const channel of dataStore.channels) {
        for (const member of channel.allMembers) {
            if (member.uId === authUserId) {
                channels.push(channel);
                break;
            }
        }
    }

    return {channels: channels};
}


// Sample stub for a function 'channelsListallV1', 
// with arguments named 'authUserId'
// Returns object with type 'channels' if no error
function channelsListallV1(authUserId) {

    // CHECK IF USERID VALID
    const dataStore = getData();
    const validId = checkValidId(authUserId, dataStore);
    
    if (!(validId)) {
        return {error: "error"};
    }
    
    const channels = [];
    
    for (const channel of dataStore.channels) {
        channels.push(channel);
    }

    return {channels: channels};
}

// Helper function to find out whether the uId is a valid user | returns bool
function checkValidId(authUserId, dataStore) {
    for (const user of dataStore.users) {
        if (user.uId === authUserId) {
            return true;
        }
    }
    return false;
}

export { channelsCreateV1, channelsListV1, channelsListallV1 };
