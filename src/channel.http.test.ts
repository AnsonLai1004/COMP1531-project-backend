import { reqChannelDetails, reqChannelJoin, reqChannelLeave, reqChannelAddowner, reqChannelRemoveowner, 
  requestClear, requestChannelsCreate, requestAuthRegister } from './requests';

beforeEach(() => {
  requestClear();
});

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
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
      expect(reqChannelAddowner(user.token, channel.channelId, notMember.authUserId)).toStrictEqual({ error: 'error' });
    });
    test('uId is already an owner', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
      expect(reqChannelJoin(owner.token, channel.channelId)).toStrictEqual({});
      expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({});
      expect(reqChannelAddowner(user.token, channel.channelId, owner.authUserId)).toStrictEqual({ error: 'error' });
    });
    test('authUserId from token does not have owner permissions', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
      expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
      expect(reqChannelAddowner(member.token, channel.channelId, member.authUserId)).toStrictEqual({ error: 'error' });
    });
    test('correct return', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
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
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
      expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
      expect(reqChannelRemoveowner(user.token, channel.channelId, member.authUserId)).toStrictEqual({ error: 'error' });
    });
    test('uId is the only owner', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
      expect(reqChannelRemoveowner(user.token, channel.channelId, user.authUserId)).toStrictEqual({ error: 'error' });
    });
    test('authUserId from token does not have owner permissions', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const member = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
      expect(reqChannelJoin(member.token, channel.channelId)).toStrictEqual({});
      expect(reqChannelRemoveowner(member.token, channel.channelId, user.authUserId)).toStrictEqual({ error: 'error' });
    });
    test('correct return', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const owner = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      const channel = requestChannelsCreate(user.authUserId, 'BOOST', true);
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