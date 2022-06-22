import { getData, setData } from './dataStore.js'

//  Creates a new channel object and appends it to the channels section of the dataStore
// Arguments - 
//  @authUserId (integer)
//  @name (string)
//  @isPublic (boolean)
// Returns -
//  @channelId (integer)
function channelsCreateV1(authUserId, name, isPublic) {

    if (name.length < 1 || name.length > 20) {
        return {error: "error"};
    }

    const dataStore = getData();

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

export { channelsCreateV1 };