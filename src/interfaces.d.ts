/**
 * Declaration file with interfaces for all the object types used for
 * storing data in dataStore.ts and accessed by other files.
 */

export interface Notif {
    channelId: number;
    dmId: number;
    notificationMessage: string;
}

export interface Reacts {
    reactId: number;
    uIds: number[];
    isThisUserReacted: boolean
}

export interface Message {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
    reacts: Reacts[];
    isPinned: boolean;
}

export interface Channel {
    channelId: number;
    name: string;
    ownerMembers: number[];
    allMembers: number[];
    messages: Message[];
    isPublic: boolean;
    standupActive: boolean;
    standupEnd: number | null;
    standupStr: string;
}

export interface DM {
    dmId: number;
    name: string;
    ownerId: number;
    uIds: number[];
    messages: Message[];
}

export interface TokenPair {
    token: string;
    uId: number;
}

interface ChannelsJoined {
    numChannelsJoined: number;
    timeStamp: number;
}

interface DmsJoined {
    numDmsJoined: number;
    timeStamp: number;
}

interface MessagesSent {
    numMessagesSent: number;
    timeStamp: number;
}

export interface ChannelsExist {
    numChannelsExist: number;
    timeStamp: number;
}

export interface DmsExist {
    numDmsExist: number;
    timeStamp: number;
}

export interface MessagesExist {
    numMessagesExist: number;
    timeStamp: number;
}

interface UserStats {
    channelsJoined: ChannelsJoined[];
    dmsJoined: DmsJoined[];
    messagesSent: MessagesSent[];
    involvementRate ?: number;
}

export interface WorkplaceStats {
    channelsExist: ChannelsExist[];
    dmsExist: DmsExist[];
    messagesExist: MessagesExist[];
}

/**
 * User object: contains uId, nameFirst, nameLast, email,
 * password, handleStr, isGlobalOwner
 */
export interface User {
    uId: number;
    nameFirst: string;
    nameLast: string;
    email: string;
    passwordHash: string;
    handleStr: string;
    isGlobalOwner: boolean;
    notification: Notif[];
    stats: UserStats;
    profileImgUrl: string;
}
