import { reqUserStats, requestAuthRegister, requestClear, reqDmRemoveV3, reqWorkspaceStats } from './requests';
import { requestChannelsCreateV3, reqMessageSend, reqDmCreate, reqSendMessageDm, reqChannelLeave, reqDmLeaveV3, reqMessageRemove, reqChannelJoin, reqChannelInvite } from './requests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('user/stats/v1', () => {
  test('invalid token', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const invalidStats = reqUserStats(user1.token + 'rubbish extra chars');
    expect(invalidStats).toEqual(403);
  });
  test('check user stats', () => {
    const time1a = Math.floor((new Date()).getTime() / 1000);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');

    // newly registered user
    const stats1a = reqUserStats(user1.token);
    expect(stats1a).toStrictEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 0
      }
    });

    // time check on user registration
    expect(stats1a.userStats.channelsJoined[0].timeStamp).toBeGreaterThanOrEqual(time1a);
    expect(stats1a.userStats.channelsJoined[0].timeStamp).toBeLessThanOrEqual(time1a + 1);
    expect(stats1a.userStats.channelsJoined[0].timeStamp).toEqual(stats1a.userStats.dmsJoined[0].timeStamp);
    expect(stats1a.userStats.channelsJoined[0].timeStamp).toEqual(stats1a.userStats.messagesSent[0].timeStamp);

    const time1b = Math.floor((new Date()).getTime() / 1000);
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true);
    const time1c = Math.floor((new Date()).getTime() / 1000);
    reqMessageSend(user1.token, channel1.channelId, 'message');

    const stats1b = reqUserStats(user1.token);
    expect(stats1b).toEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 1
      }
    });

    expect(stats1b.userStats.channelsJoined[1].timeStamp).toBeGreaterThanOrEqual(time1b);
    expect(stats1b.userStats.channelsJoined[1].timeStamp).toBeLessThanOrEqual(time1b + 1);
    expect(stats1b.userStats.messagesSent[1].timeStamp).toBeGreaterThanOrEqual(time1c);
    expect(stats1b.userStats.messagesSent[1].timeStamp).toBeLessThanOrEqual(time1c + 1);

    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');

    const time2a = Math.floor((new Date()).getTime() / 1000);
    const dm1 = reqDmCreate(user2.token, [user1.authUserId]);

    const time2b = Math.floor((new Date()).getTime() / 1000);
    reqSendMessageDm(user2.token, dm1.dmId, 'dm 1 message');
    reqSendMessageDm(user1.token, dm1.dmId, 'dm 2 message');

    const stats1c = reqUserStats(user1.token);
    expect(stats1c).toEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }, { numMessagesSent: 2, timeStamp: expect.any(Number) }],
        involvementRate: 4 / 5,
      }
    });

    expect(stats1c.userStats.dmsJoined[1].timeStamp).toBeGreaterThanOrEqual(time2a);
    expect(stats1c.userStats.dmsJoined[1].timeStamp).toBeLessThanOrEqual(time2a + 1);

    const stats2a = reqUserStats(user2.token);
    expect(stats2a).toEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }, { numDmsJoined: 1, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }, { numMessagesSent: 1, timeStamp: expect.any(Number) }],
        involvementRate: 2 / 5,
      }
    });

    expect(stats2a.userStats.dmsJoined[1].timeStamp).toBeGreaterThanOrEqual(time2a);
    expect(stats2a.userStats.dmsJoined[1].timeStamp).toBeLessThanOrEqual(time2a + 1);
    expect(stats2a.userStats.messagesSent[1].timeStamp).toBeGreaterThanOrEqual(time2b);
    expect(stats2a.userStats.messagesSent[1].timeStamp).toBeLessThanOrEqual(time2b + 1);
  });
  test('with message/remove, channel/leave, dm/leave', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true);
    const message1 = reqMessageSend(user1.token, channel1.channelId, 'message 1');
    const message2 = reqMessageSend(user1.token, channel1.channelId, 'message 2');
    reqMessageRemove(user1.token, message1.messageId);
    reqMessageRemove(user1.token, message2.messageId);
    reqMessageSend(user1.token, channel1.channelId, 'message 3');

    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm1 = reqDmCreate(user2.token, [user1.authUserId]);
    const messageDm = reqSendMessageDm(user1.token, dm1.dmId, 'dm message');
    reqMessageRemove(user1.token, messageDm);

    reqChannelLeave(user1.token, channel1.channelId);
    const channel2 = requestChannelsCreateV3(user2.token, 'NEW', true);
    reqChannelJoin(user1.token, channel2.channelId);
    const channel3 = requestChannelsCreateV3(user2.token, 'NEW', false);
    reqChannelInvite(user2.token, channel3.channelId, user1.authUserId);

    const dm2 = reqDmCreate(user1.token, [user2.authUserId]);
    reqDmLeaveV3(user1.token, dm1.dmId);
    reqDmRemoveV3(user1.token, dm2.dmId);

    const stats1 = reqUserStats(user1.token);
    expect(stats1).toEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 2, timeStamp: expect.any(Number) },
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 2, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) },
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
          { numMessagesSent: 3, timeStamp: expect.any(Number) },
          { numMessagesSent: 4, timeStamp: expect.any(Number) },
        ],
        involvementRate: 1,
      }
    });
  });
});

describe('users/stats/v1', () => {
  test('invalid token', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const invalidStats = reqWorkspaceStats(user1.token + 'rubbish extra chars');
    expect(invalidStats).toEqual(403);
  });
  test('initial value', () => {
    const timeReg = Math.floor(Date.now() / 1000);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const stats = reqWorkspaceStats(user1.token + '');
    expect(stats).toEqual({
      workplaceStats: {
        channelsExist: [{numChannelsExist: 0, timeStamp: expect.any(Number)}],
        dmsExist: [{numDmsExist: 0, timeStamp: expect.any(Number)}],
        messagesExist: [{numMessagesExist: 0, timeStamp: expect.any(Number)}],
        utilizationRate: 0
      }
    });

    // time check
    expect(stats.workplaceStats.channelsExist[0].timeStamp).toBeGreaterThanOrEqual(timeReg);
    expect(stats.workplaceStats.channelsExist[0].timeStamp).toBeLessThanOrEqual(timeReg + 1);
    expect(stats.workplaceStats.channelsExist[0].timeStamp).toEqual(stats.workplaceStats.dmsExist[0].timeStamp);
    expect(stats.workplaceStats.channelsExist[0].timeStamp).toEqual(stats.workplaceStats.messagesExist[0].timeStamp);
  });
  test('time checks', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('other@gmail.com', 'samplePass', 'Harry', 'Potter');

    const timeChannel = Math.floor(Date.now() / 1000);
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true);

    const timeSent = Math.floor(Date.now() / 1000);
    reqMessageSend(user1.token, channel1.channelId, 'message 1');

    const timeDm = Math.floor(Date.now() / 1000);
    reqDmCreate(user2.token, [user1.authUserId]);

    const stats = reqWorkspaceStats(user1.token);
    expect(stats).toEqual({
      workplaceStats: {
        channelsExist: [{numChannelsExist: 0, timeStamp: expect.any(Number)}, {numChannelsExist: 1, timeStamp: expect.any(Number)}],
        dmsExist: [{numDmsExist: 0, timeStamp: expect.any(Number)}, {numDmsExist: 1, timeStamp: expect.any(Number)}],
        messagesExist: [{numMessagesExist: 0, timeStamp: expect.any(Number)}, {numMessagesExist: 1, timeStamp: expect.any(Number)}],
        utilizationRate: 1
      }
    });

    // time check
    expect(stats.workplaceStats.channelsExist[1].timeStamp).toBeGreaterThanOrEqual(timeChannel);
    expect(stats.workplaceStats.channelsExist[1].timeStamp).toBeLessThanOrEqual(timeChannel + 1);

    expect(stats.workplaceStats.dmsExist[1].timeStamp).toBeGreaterThanOrEqual(timeDm);
    expect(stats.workplaceStats.dmsExist[1].timeStamp).toBeLessThanOrEqual(timeDm + 1);

    expect(stats.workplaceStats.messagesExist[1].timeStamp).toBeGreaterThanOrEqual(timeSent);
    expect(stats.workplaceStats.messagesExist[1].timeStamp).toBeLessThanOrEqual(timeSent + 1);

  });

  test('many interactions', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('other@gmail.com', 'samplePass', 'Harry', 'Potter');
    const user3 = requestAuthRegister('hello@gmail.com', 'samplePass', 'Sherlock', 'Holmes');
    requestAuthRegister('shot@gmail.com', 'samplePass', 'John', 'Watson');

    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true);
    const channel2 = requestChannelsCreateV3(user2.token, 'NEW', true);
    const channel3 = requestChannelsCreateV3(user2.token, 'STARS', false);

    const dm1 = reqDmCreate(user2.token, [user1.authUserId, user3.authUserId]);
    const dm2 = reqDmCreate(user2.token, [user1.authUserId, user3.authUserId]);
    
    const message1 = reqMessageSend(user1.token, channel1.channelId, 'message 1');
    const message2 = reqMessageSend(user1.token, channel2.channelId, 'message 2');
    reqMessageRemove(user1.token, message1.messageId);
    reqMessageRemove(user1.token, message2.messageId);
    reqMessageSend(user3.token, channel3.channelId, 'message 3');

    reqSendMessageDm(user3.token, dm1.dmId, 'GO AWAY');
    reqSendMessageDm(user3.token, dm2.dmId, 'BOTH OF YOU');
    reqDmLeaveV3(user3.token, dm1.dmId);
    reqDmRemoveV3(user2.token, dm2.dmId);

    const stats = reqWorkspaceStats(user1.token);
    expect(stats).toEqual({
      workplaceStats: {
        channelsExist: [
          {numChannelsExist: 0, timeStamp: expect.any(Number)}, 
          {numChannelsExist: 1, timeStamp: expect.any(Number)},
          {numChannelsExist: 2, timeStamp: expect.any(Number)},
          {numChannelsExist: 3, timeStamp: expect.any(Number)},
        ],
        dmsExist: [
          {numDmsExist: 0, timeStamp: expect.any(Number)}, 
          {numDmsExist: 1, timeStamp: expect.any(Number)},
          {numDmsExist: 2, timeStamp: expect.any(Number)},
          {numDmsExist: 1, timeStamp: expect.any(Number)},
        ],
        messagesExist: [
          {numMessagesExist: 0, timeStamp: expect.any(Number)}, 
          {numMessagesExist: 1, timeStamp: expect.any(Number)},
          {numMessagesExist: 2, timeStamp: expect.any(Number)},
          {numMessagesExist: 1, timeStamp: expect.any(Number)},
          {numMessagesExist: 0, timeStamp: expect.any(Number)},
          {numMessagesExist: 1, timeStamp: expect.any(Number)},
          {numMessagesExist: 2, timeStamp: expect.any(Number)},
          {numMessagesExist: 3, timeStamp: expect.any(Number)},
          {numMessagesExist: 2, timeStamp: expect.any(Number)},
        ],
        utilizationRate: 1 / 2
      }
    });
  });
});