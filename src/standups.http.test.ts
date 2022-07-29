import { reqChannelMessages, reqChannelInvite, requestChannelsCreateV3, requestStandupStartV3, requestStandupSendV3, requestStandupActiveV3, requestClear } from './requests'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeEach(() => requestClear());
afterEach(() => requestClear());

describe('Channels Functions Errors', () => {
  test('error standup functions', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true).channelId;
    expect(requestStandupStartV3('invalid token', channel1, 5)).toStrictEqual(403);
    expect(requestStandupStartV3(user1.token, 'invalid channel', 5)).toStrictEqual(400);
    expect(requestStandupStartV3(user2.token, channel1, 5)).toStrictEqual(403);
    expect(requestStandupStartV3(user1.token, channel1, -1)).toStrictEqual(400);

    // starts standup should be
    requestStandupStartV3(user2.token, channel1, 5);
    expect(requestStandupStartV3(user2.token, channel1, 5)).toStrictEqual(400);
    
    expect(requestStandupActiveV3('invalid token', channel1)).toStrictEqual(403);
    expect(requestStandupActiveV3(user1.token, 'invalid channel')).toStrictEqual(400);
    expect(requestStandupActiveV3(user2.token, channel1)).toStrictEqual(403);

    expect(requestStandupSendV3('invalid token', channel1, 'a')).toStrictEqual(403);
    expect(requestStandupSendV3(user1.token, 'invalid channel', 'a')).toStrictEqual(400);
    expect(requestStandupSendV3(user2.token, channel1)).toStrictEqual(403);
    expect(requestStandupSendV3(user1.token, channel1, 'a'.repeat(1001))).toStrictEqual(400);

    // end standup
    sleep(3000);
    expect(requestStandupSendV3('user1.token', channel1, 'a')).toStrictEqual(400);
  });

  
  test('correct return', () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true).channelId;
    reqChannelInvite(user1.token, channel1, user2.authUserId);
    const timeFinish = Math.floor((new Date()).getTime() / 1000) + 3;
    expect(requestStandupStartV3(user1.token, channel1, 3)).toStrictEqual({ timeFinish: timeFinish});
    expect(requestStandupActiveV3(user1.token, channel1)).toStrictEqual({
        isActive: true,
        timeFinish: timeFinish
    });
    expect(requestStandupSendV3(user1.token, channel1, "Hello")).toStrictEqual({});
    expect(requestStandupSendV3(user2.token, channel1, "World!")).toStrictEqual({});
    expect(reqChannelMessages(user1.token, channel1, 0)).toStrictEqual({
        messages: [{
            messageId: 1,
            uId: user1.authUserId,
            message: 'theoang: Hello\nalexavery: World!',
            timeSent: timeFinish,
        }],
        start: 0,
        end: -1
    }) 
  });
});