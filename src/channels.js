import { getData, setData } from './dataStore.js'

// Sample stub for a function 'channelsCreateV1', 
// with arguments named 'authUserId', 'name', 'isPublic'
// Returns object with type 'channelId' if no error
function channelsCreateV1(authUserId, name, isPublic) {

    const dataStore = getData();

    const channel = {
        channelId: dataStore.lastChannelId,
        name: name,
        isPublic: isPublic,
        ownerMember: [userProfileV1(authUserId)],
        allMembers: [userProfileV1(authUserId)],
        messages: []
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
    
    for (channel of dataStore.channels) {
        for (member of channel.allMembers) {
            if (member.authUserId === authUserId) {
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

    for (user of dataStore.users) {
        if (user.authUserId === authUserId) {
            validId = true;
            break;
        }
    }

    if (!(validId)) {
        return {channels: []};
    }
    
    for (channel of dataStore.channels) {
        channels.push(channel);
    }

    return {channels: channels};
}
