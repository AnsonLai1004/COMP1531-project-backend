/**
 * Test file for auth routes endpoints and status codes.
 */
import {
  reqChannelInvite, reqChannelDetails, reqChannelJoin, reqChannelLeave, reqChannelAddowner, reqChannelRemoveowner,
  requestClear, requestChannelsCreate, requestAuthRegister, reqChannelMessages, reqMessageSend, reqSendMessageDm, reqDmCreate, reqDmMessages
} from './requests';

beforeEach(() => {
  requestClear();
});
afterEach(() => {
  requestClear();
});

describe('/channel/invite/v3', () => {
// error cases
  test('Invalid tokenId', () => {
    expect(reqChannelInvite('asdasdas', 1, 123)).toStrictEqual(403);
  });
  test('Error case for Invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    // invalid channelid
    const invalid = reqChannelInvite(aMember.token, -999, notMember.authUserId);
    expect(invalid).toStrictEqual(400);
  });

  test('Error case for invalid uId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // invalid uid
    const invalid = reqChannelInvite(aMember.token, newchannel.channelId, -999);
    expect(invalid).toStrictEqual(400);
  });

  test('Error case for adding uid that is already a member of channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // uid refers to a user that is already a member
    const invalid = reqChannelInvite(aMember.token, newchannel.channelId, aMember.authUserId);
    expect(invalid).toStrictEqual(400);
  });

  test('Error case for authorized user who invites is not a member of the group', () => {
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // channelId valid but the authorized user who invites is not a member of the group
    const invalid = reqChannelInvite(notMember.token, newchannel.channelId, notMember.authUserId);
    expect(invalid).toStrictEqual(403);
  });

  // correct input output
  test('Cases for correct return on /channel/invite/v3', () => {
    const owner = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const newchannel = requestChannelsCreate(owner.token, 'crush team', true);
    // valid invite
    expect(reqChannelInvite(owner.token, newchannel.channelId, notMember.authUserId)).toStrictEqual({});

    expect(reqChannelDetails(owner.token, newchannel.channelId)).toMatchObject({
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
    });
  });
});

describe('/channel/messages/v3 and dm/messages/v3', () => {
// cases where error occur
  test('Invalid tokenId', () => {
    expect(reqChannelMessages('asdasdas', 1, 0)).toStrictEqual(403);
  });
  test('Invalid tokenId', () => {
    expect(reqDmMessages('asdasdas', 1, 0)).toStrictEqual(403);
  });
  test('Error for invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    // invalid channelid
    const invalid = reqChannelMessages(aMember.token, -999, 0);
    expect(invalid).toStrictEqual(400);
  });

  test('Error start is greater than total number of messages in channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    const invalid = reqChannelMessages(aMember.token, newchannel.channelId, 51);
    expect(invalid).toStrictEqual(400);
  });

  test('Error user not a member of channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
    // channelid valid, authorised user not a member
    const invalid = reqChannelMessages(notMember.token, newchannel.channelId, 0);
    expect(invalid).toStrictEqual(403);
  });

  test('Error for invalid dmId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    // invalid channelid
    const invalid = reqDmMessages(aMember.token, -999, 0);
    expect(invalid).toStrictEqual(400);
  });

  test('Error start is greater than total number of messages in dm', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const invalid = reqDmMessages(user.token, dm.dmId, 51);
    expect(invalid).toStrictEqual(400);
  });

  test('Error user not a member of dm', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const notMember = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    // channelid valid, authorised user not a member
    const invalid = reqDmMessages(notMember.token, dm.dmId, 0);
    expect(invalid).toStrictEqual(403);
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

  // correct return for channelmessages length more than 50
  test('correct return for array message of length greater than 50', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);

    for (let i = 0; i < 60; i++) {
      reqMessageSend(aMember.token, newchannel.channelId, `hello ${i}`);
    }
    const el = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    const el2 = reqChannelMessages(aMember.token, newchannel.channelId, 50);
    expect(reqChannelMessages(aMember.token, newchannel.channelId, 0)).toStrictEqual({ messages: el.messages, start: 0, end: 50 });
    expect(reqChannelMessages(aMember.token, newchannel.channelId, 50)).toStrictEqual({ messages: el2.messages, start: 50, end: -1 });
  });

  // correct return for dmMessages length more than 50
  test('correct return for array message of length greater than 50', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);

    for (let i = 0; i < 60; i++) {
      reqSendMessageDm(user.token, dm.dmId, `hello ${i}`);
    }
    const el = reqDmMessages(user.token, dm.dmId, 0);
    const el2 = reqDmMessages(user.token, dm.dmId, 50);
    expect(reqDmMessages(user.token, dm.dmId, 0)).toStrictEqual({ messages: el.messages, start: 0, end: 50 });
    expect(reqDmMessages(user.token, dm.dmId, 50)).toStrictEqual({ messages: el2.messages, start: 50, end: -1 });
  });
});

// channelDetails&Join V3 tests
describe('channel/details/v3', () => {
  test('invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelDetails('invalid token', channel.channelId)).toStrictEqual(403);
  });

  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqChannelDetails(user.token, -999)).toStrictEqual(400);
  });

  test('User not a member of channel', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelDetails(notMember.token, channel.channelId)).toStrictEqual(403);
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

describe('channel/join/v3', () => {
  test('invalid token and channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin('invalid token', channel.channelId)).toStrictEqual(403);
    expect(reqChannelJoin(user.token, -999)).toStrictEqual(400);
  });
  test('Authorised user is already a member of the channel, channel is private member is not a global owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    // authorised user is already a member of the channel
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual(400);
    // channel that is private and member is not a global owner
    // assume member is not a global owner
    const privateChannel = requestChannelsCreate(user.token, 'Private', false);
    expect(reqChannelJoin(member.token, privateChannel.channelId)).toStrictEqual(403);
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
describe('channel/leave/v2', () => {
  test('invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelLeave('invalid token', channel.channelId)).toStrictEqual(403);
  });
  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqChannelLeave(user.token, -999)).toStrictEqual(400);
  });
  test('authUserId is not a member', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'teamA', true);
    expect(reqChannelLeave(notMember.token, channel.channelId)).toStrictEqual(400);
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
    expect(reqChannelDetails(user.token, channel.channelId)).toStrictEqual(403);
  });
});

describe('channel/addowner/v2', () => {
  test('invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user2 = requestAuthRegister('valid@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelAddowner('invalid token', channel.channelId, user2.authUserId)).toStrictEqual(403);
  });
  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    expect(reqChannelAddowner(user.token, -999, notMember.authUserId)).toStrictEqual(400);
  });
  test('invalid uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelAddowner(user.token, channel.channelId, -999)).toStrictEqual(400);
  });
  test('uId is not a member', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelAddowner(user.token, channel.channelId, notMember.authUserId)).toStrictEqual(400);
  });
  test('uId is already an owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(owner.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({});
    expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual(400);
  });
  test('authUserId from token does not have owner permissions', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelAddowner(member.token, channel.channelId, member.authUserId)).toStrictEqual(403);
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

describe('channel/removeowner/v2', () => {
  test('invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user2 = requestAuthRegister('valid@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelRemoveowner('invalid token', channel.channelId, user2.authUserId)).toStrictEqual(403);
  });
  test('invalid channelId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    expect(reqChannelRemoveowner(user.token, -999, notMember.authUserId)).toStrictEqual(400);
  });
  test('invalid uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelRemoveowner(user.token, channel.channelId, -999)).toStrictEqual(400);
  });
  test('uId is not an owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelRemoveowner(user.token, channel.channelId, member.authUserId)).toStrictEqual(400);
  });
  test('uId is the only owner', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelRemoveowner(user.token, channel.channelId, user.authUserId)).toStrictEqual(400);
  });
  test('authUserId from token does not have owner permissions', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = requestChannelsCreate(user.token, 'BOOST', true);
    expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelRemoveowner(member.token, channel.channelId, user.authUserId)).toStrictEqual(400);
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
