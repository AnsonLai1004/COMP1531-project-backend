/**
 * Declaration file with interfaces for all the object types used for
 * storing data in dataStore.ts and accessed by other files.
 */

/**
 * User object: contains uId, nameFirst, nameLast, email,
 * password, handleStr, isGlobalOwner
 */
export interface User {
    uId: number;
    nameFirst: string;
    nameLast: string;
    email: string;
    password: string;
    handleStr: string;
    isGlobalOwner: boolean;
}

export interface Message {
    messageId: number;
    uId: number;
    message: string;
    timeSent: number;
}

export interface Channel {
    channelId: number;
    name: string;
    ownerMembers: number[];
    allMembers: number[];
    messages: Message[];
    isPublic: boolean;
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