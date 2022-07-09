/**
 * Test file for auth routes endpoints and status codes.
 */

import { requestChannelsCreate, reqChannelInvite, reqChannelMessages, requestAuthRegister, requestAuthLogin, requestAuthLogout, requestClear } from './requests';

beforeEach(() => {
    requestClear();
});

 
describe('channelInviteV1', () => {
// error cases
test('Error case for Invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    // invalid channelid
    expect(reqChannelInvite(aMember.token, -999, notMember.token)).toStrictEqual({ error: 'error' });
});

test('Error case for invalid uId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // invalid uid
    expect(reqChannelInvite(aMember.token, newchannel.channelId, -999)).toStrictEqual({ error: 'error' });
});

test('Error case for adding uid that is already a member of channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // uid refers to a user that is already a member
    expect(reqChannelInvite(aMember.token, newchannel.channelId, aMember.token)).toStrictEqual({ error: 'error' });
});

test('Error case for authorized user who invites is not a member of the group', () => {
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // channelId valid but the authorized user who invites is not a member of the group
    expect(reqChannelInvite(notMember.token, newchannel.channelId, notMember.token)).toStrictEqual({ error: 'error' });
});

// correct input output
test('Cases for correct return on channelInviteV1', () => {
    const owner = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const newchannel = requestChannelsCreate(owner.token, 'crush team', true);
    // valid invite
    expect(reqChannelInvite(owner.token, newchannel.channelId, notMember.authUserId)).toStrictEqual({});

    /**expect(channelDetailsV1(owner.token, newchannel.channelId)).toMatchObject({
    name: 'crush team',
    isPublic: true,
    ownerMembers: [
        {
        email: 'validemail@gmail.com',
        handleStr: 'jakerenzella',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        uId: 1,
        }
    ],
    allMembers: [
        {
        email: 'validemail@gmail.com',
        handleStr: 'jakerenzella',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        uId: 1,
        },
        {
        email: 'Bob@gmail.com',
        handleStr: 'bobrenzella',
        nameFirst: 'Bob',
        nameLast: 'Renzella',
        uId: 2,
        }
    ],
    });**/
});
});

describe('channelMessagesV1', () => {
// cases where error occur
test('Error for invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    // invalid channelid
    expect(reqChannelMessages(aMember.token, -999, 0)).toStrictEqual({ error: 'error' });
});

test('Error start is greater than total number of messages in channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    expect(reqChannelMessages(aMember.token, newchannel.channelId, 51)).toStrictEqual({ error: 'error' });
});

test('Error user not a member of channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // channelid valid, authorised user not a member
    expect(reqChannelMessages(notMember.token, newchannel.channelId, 0)).toStrictEqual({ error: 'error' });
});

// correct return for channelmessages
test('correct return for empty array message', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);

    // messages is an array of messages from newchannel
    // return messages from newchannel
    // valid arguments assuming messages is empty
    expect(reqChannelMessages(aMember.token, newchannel.channelId, 0)).toStrictEqual({ messages: [], start: 0, end: -1 });
});
});