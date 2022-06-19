// Sample stub for a function 'channelsCreateV1', 
// with arguments named 'authUserId', 'name', 'isPublic'
// Returns object with type 'channelId' if no error
function channelsCreateV1(authUserId, name, isPublic) {

    new channel = {
        channelId: generate(channelId),
        name: name,
        isPublic: isPublic,
        ownerMember: [... userProfileV1(authUserId)],
        allMembers: [... userProfileV1(authUserId)],
        messages: []
    }
    
    dataStore.channel_list.push (new channel);
    return {channelId: channel.channelId};
}

// Sample stub for a function 'channelsListV1', 
// with arguments named 'authUserId'
// Returns object with type 'channels' if no error
function channelsListV1(authUserId) {

    new channels = []
    
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
    
    new channels = []
    
    for (channel of dataStore.channels) {
        if (member.authUserId === authUserId) {
            channels.push(channel);
            break;
        }
    }

    return {channels: channels};
}
