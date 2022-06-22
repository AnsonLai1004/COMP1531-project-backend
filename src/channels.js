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

    const dataStore = getData();

    // CHECK IF USERID VALID
    let validId = false;

    for (const user of dataStore.users) {
        if (user.uId === authUserId) {
            validId = true;
            break;
        }
    }
    
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
    
    dataStore.channels.push (channel);
    dataStore.lastChannelId++;
    setData(dataStore);
    
    return {channelId: channel.channelId};
}



// Sample stub for a function 'channelsListV1', 
// with arguments named 'authUserId'
// Returns object with type 'channels' if no error
function channelsListV1(authUserId) {

    const channels = [];
    const dataStore = getData();
    
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
    
    const channels = [];
    let validId = false;
    const dataStore = getData();

    for (const user of dataStore.users) {
        if (user.authUserId === authUserId) {
            validId = true;
            break;
        }
    }

    if (!(validId)) {
        return {channels: []};
    }
    
    for (const channel of dataStore.channels) {
        channels.push(channel);
    }

    return {channels: channels};
}

export { channelsCreateV1, channelsListV1, channelsListallV1 }
