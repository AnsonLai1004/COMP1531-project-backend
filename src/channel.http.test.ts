/**
 * Test file for auth routes endpoints and status codes.
 */
import {
    reqChannelInvite, reqChannelDetails, reqChannelJoin, reqChannelLeave, reqChannelAddowner, reqChannelRemoveowner,
    requestClear, requestChannelsCreate, requestAuthRegister, reqChannelMessages
  } from './requests';
  
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

    /** expect(channelDetailsV1(owner.token, newchannel.channelId)).toMatchObject({
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

// channelDetails&Join V2 tests
describe('channel/details/v2', () => {
  test('invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelDetails('invalid token', channel.channelId)).toStrictEqual({ error: 'error' });
  });

  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqChannelDetails(user.token, -999)).toStrictEqual({ error: 'error' });
  });

  test('User not a member of channel', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelDetails(notMember.token, channel.channelId)).toStrictEqual({ error: 'error' });
  });

  test('correct return', () => {
    const user = requestAuthRegister('abc@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelDetails(user.token, channel.channelId)).toMatchObject({
      name: 'BOOST',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'abc@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
      ],
      allMembers: [
        {
          uId: 1,
          email: 'abc@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
      ],
    });
  });
});

describe('channel/join/v2', () => {
  test('invalid token and channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin('invalid token', channel.channelId)).toStrictEqual({ error: 'error' });
    expect(reqChannelJoin(user.token, -999)).toStrictEqual({ error: 'error' });
  });
  test('Authorised user is already a member of the channel, channel is private member is not a global owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    // authorised user is already a member of the channel
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({ error: 'error' });
    // channel that is private and member is not a global owner
    // assume member is not a global owner
    const privateChannel = requestChannelsCreate(user.token, 'Private', false);
    expect(reqChannelJoin(member.token, privateChannel.channelId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelDetails(user.token, channel.channelId)).toMatchObject({
      name: 'BOOST',
      isPublic: true,
      ownerMembers: [
        {
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          uId: user.authUserId,
        }
      ],
      allMembers: [
        {
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          uId: user.authUserId,
        },
        {
          email: 'Bob@gmail.com',
          handleStr: 'bobrenzella',
          nameFirst: 'Bob',
          nameLast: 'Renzella',
          uId: member.authUserId,
        }
      ],
    });
  });
});

// channel /leave /addowner /removeowner V1 tests
describe('channel/leave/v1', () => {
  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqChannelLeave(user.token, -999)).toStrictEqual({ error: 'error' });
  });
  test('authUserId is not a member', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'teamA', true);
    expect(reqChannelLeave(notMember.token, channel.channelId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelLeave(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelDetails(user.token, channel.channelId)).toMatchObject({
      name: 'BOOST',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
      ],
    });
    expect(reqChannelLeave(user.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelDetails(user.token, channel.channelId)).toStrictEqual({ error: 'error' });
  });
});

describe('channel/addowner/v1', () => {
  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    expect(reqChannelAddowner(user.token, -999, notMember.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('invalid uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelAddowner(user.token, channel.channelId, -999)).toStrictEqual({ error: 'error' });
  });
  test('uId is not a member', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelAddowner(user.token, channel.channelId, notMember.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('uId is already an owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(owner.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({});
    expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('authUserId from token does not have owner permissions', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelAddowner(member.token, channel.channelId, member.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(owner.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({});
    expect(reqChannelDetails(user.token, channel.channelId)).toMatchObject({
      name: 'BOOST',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
        {
          uId: owner.authUserId,
          email: 'Bob@gmail.com',
          handleStr: 'bobrenzella',
          nameFirst: 'Bob',
          nameLast: 'Renzella',
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
        {
          uId: owner.authUserId,
          email: 'Bob@gmail.com',
          handleStr: 'bobrenzella',
          nameFirst: 'Bob',
          nameLast: 'Renzella',
        },
      ],
    });
  });
});

describe('channel/removeowner/v1', () => {
  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    expect(reqChannelRemoveowner(user.token, -999, notMember.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('invalid uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelRemoveowner(user.token, channel.channelId, -999)).toStrictEqual({ error: 'error' });
  });
  test('uId is not an owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelRemoveowner(user.token, channel.channelId, member.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('uId is the only owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelRemoveowner(user.token, channel.channelId, user.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('authUserId from token does not have owner permissions', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelRemoveowner(member.token, channel.channelId, user.authUserId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(owner.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({});
    expect(reqChannelRemoveowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({});
    expect(reqChannelDetails(user.token, channel.channelId)).toMatchObject({
      name: 'BOOST',
      isPublic: true,
      ownerMembers: [
        {
          uId: user.authUserId,
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
      ],
      allMembers: [
        {
          uId: user.authUserId,
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
        },
        {
          uId: owner.authUserId,
          email: 'Bob@gmail.com',
          handleStr: 'bobrenzella',
          nameFirst: 'Bob',
          nameLast: 'Renzella',
        },
      ],
    });
  });
});
