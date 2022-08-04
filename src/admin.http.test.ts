import {
  requestClear, requestAuthRegister, requestUserProfile,
  reqAdminUserRemove, reqAdminUPChange,
  requestChannelsCreateV3, reqChannelJoin, reqChannelMessages, reqMessageSend,
  reqDmCreate, reqDmMessages, reqSendMessageDm, reqUserStats, requestUserAll
} from './requests';
beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('admin/user/remove/v1', () => {
  test('error cases', () => {
    const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const user = requestAuthRegister('bruh@gmail.com', 'password', 'Hermione', 'Granger');
    const user2 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqAdminUserRemove(user.token, user2.authUserId)).toStrictEqual(403);
    expect(reqAdminUserRemove(globalOwner.token, -999)).toStrictEqual(400);
    expect(reqAdminUserRemove(globalOwner.token, globalOwner.authUserId)).toStrictEqual(400);
  });
  test('tests - channels, Dms, users/all/v2, treat owner can remove other owners', () => {
    const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const channelOwner = requestAuthRegister('bruhh@gmail.com', 'password', 'Hermione', 'Granger');
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreateV3(channelOwner.token, 'BOOST', true);
    const channel2 = requestChannelsCreateV3(channelOwner.token, 'second', true);
    const dm = reqDmCreate(channelOwner.token, [globalOwner.authUserId, user.authUserId]);
    const dm2 = reqDmCreate(channelOwner.token, [globalOwner.authUserId, user.authUserId]);
    expect(reqChannelJoin(user.token, channel.channelId)).toStrictEqual({});
    expect(reqChannelJoin(user.token, channel2.channelId)).toStrictEqual({});
    // user - numChannelJoined = 2, numDmJoined = 2
    // TODO: user/stats/v1 return userStats to get numChannelsJoined, numDmsJoined
    /*expect(reqUserStats(user.token)).toMatchObject({
      channelsJoined: [{2, any }],
      
    })*/
    // dont think we need this, expect(reqChannelJoin(globalOwner.token, channel.channelId)).toStrictEqual({});
    // removed from all channels/DMS
    expect(reqAdminUserRemove(globalOwner.token, user.authUserId)).toStrictEqual({});//FIXME:
    // TODO: user/stats/v1 return userStats to get numChannelsJoined, numDmsJoined0

    // not be included in user array returned by users/all
    // TODO: request users/all/v2
    expect(reqUserAll(user.token)).toMatchObject([
        {
            uId: globalOwner.authUserId,
            nameFirst: 'Harry',
            nameLast: 'Potter',
            handleStr: 'harrypotter',
        },
        {
            uId: channelOwner.authUserId,
            nameFirst: 'Hermione',
            nameLast: 'Granger',
            handleStr: 'hermionegranger',
        },
    ]);
    // treats owners can remove other threats owners(including the original first owner)
    const newGO = requestAuthRegister('abs@gmail.com', 'password', 'Jordan', 'Potter');
    expect(reqAdminUPChange(globalOwner.token, newGO.authUserId, 1)).toStrictEqual({});
    expect(reqAdminUserRemove(newGO.token, globalOwner.authUserId)).toStrictEqual({});
  });
  test('test - messages', () => {
    // contents of the messages they sent - replaced by 'Removed user'
    // channel
    const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const channelOwner = requestAuthRegister('okk@gmail.com', 'password', 'Hermione', 'Granger');
    const user3 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = requestChannelsCreateV3(channelOwner.token, 'first', true);
    expect(reqChannelJoin(user3.token, channel.channelId)).toStrictEqual({});
    expect(reqMessageSend(user3.token, channel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqAdminUserRemove(globalOwner.token, user3.authUserId)).toStrictEqual({});
    const channelmessages = reqChannelMessages(channelOwner.token, channel.channelId, 0);
    expect(channelmessages.messages[0].message).toStrictEqual('Removed user');
    // dm
    const user2 = requestAuthRegister('dfsffdsfsd@gmail.com', '123abc!@#', 'Carson', 'abc');
    const dm = reqDmCreate(channelOwner.token, [user2.authUserId]);
    expect(reqSendMessageDm(user2.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqAdminUserRemove(globalOwner.token, user2.authUserId)).toStrictEqual({});
    const dmMessages = reqDmMessages(channelOwner.token, dm.dmId, 0);
    expect(dmMessages.messages[0].message).toStrictEqual('Removed user');
  });
  test('test - user/profile', () => {
    // profile still be retrievable with user/profile
    // but nameFirst - Removed, nameLast - user
    // user's email and handle should be reusable
    const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    // const user = requestAuthRegister('fddfdf@gmail.com', 'password', 'Hermione', 'Granger');
    const user2 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqAdminUserRemove(globalOwner.token, user2.authUserId)).toStrictEqual({});
    expect(requestUserProfile(globalOwner.token, user2.authUserId)).toMatchObject({
      user: {
        uId: user2.authUserId,
        email: 'validemail@gmail.com',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: 'jakerenzella',
      }
    });
  });
});

// user permission id 1 - Owners
// id 2 - members
describe('admin/userpermission/change/v1', () => {
  test('error cases', () => {
    const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const user = requestAuthRegister('fdfs@gmail.com', 'password', 'Hermione', 'Granger');
    expect(reqAdminUPChange(globalOwner.token, -999, 1)).toStrictEqual(400);
    expect(reqAdminUPChange(globalOwner.token, globalOwner.authUserId, 2)).toStrictEqual(400);
    expect(reqAdminUPChange(globalOwner.token, user.authUserId, 3)).toStrictEqual(400);
    expect(reqAdminUPChange(globalOwner.token, user.authUserId, 2)).toStrictEqual(400);
    expect(reqAdminUPChange(globalOwner.token, globalOwner.authUserId, 2)).toStrictEqual(400);
    expect(reqAdminUPChange(user.token, globalOwner.authUserId, 1)).toStrictEqual(403);
  });
  test('correct return', () => {
    const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const user = requestAuthRegister('sfdf@gmail.com', 'password', 'Hermione', 'Granger');
    const channelOwner = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const privateChannel = requestChannelsCreateV3(channelOwner.token, 'privateChannel', false);
    expect(reqChannelJoin(globalOwner.token, privateChannel.channelId)).toStrictEqual({});
    expect(reqChannelJoin(user.token, privateChannel.channelId)).toStrictEqual(403);

    expect(reqAdminUPChange(globalOwner.token, user.authUserId, 1)).toStrictEqual({});
    expect(reqChannelJoin(user.token, privateChannel.channelId)).toStrictEqual({});

    expect(reqAdminUPChange(globalOwner.token, user.authUserId, 2)).toStrictEqual({});
    const privateChannel2 = requestChannelsCreateV3(channelOwner.token, 'privateChannel2', false);
    expect(reqChannelJoin(user.token, privateChannel2.channelId)).toStrictEqual(403);
  });
});
