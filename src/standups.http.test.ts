import { requestAuthRegister, reqChannelMessages, reqChannelInvite, requestChannelsCreateV3, requestStandupStartV3, requestStandupSendV3, requestStandupActiveV3, requestClear } from './requests';

function sleep(s: number) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

beforeEach(() => requestClear());
afterAll(() => requestClear());

describe('Channels Functions Errors', () => {
  test('error standup functions', async () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true).channelId;
    expect(requestStandupStartV3('invalid token', channel1, 5)).toStrictEqual(403);
    expect(requestStandupStartV3(user1.token, -1, 5)).toStrictEqual(400);
    expect(requestStandupStartV3(user2.token, channel1, 5)).toStrictEqual(403);
    expect(requestStandupStartV3(user1.token, channel1, -1)).toStrictEqual(400);

    // starts standup should be for 2s
    requestStandupStartV3(user1.token, channel1, 2);
    expect(requestStandupStartV3(user1.token, channel1, 5)).toStrictEqual(400);

    expect(requestStandupActiveV3('invalid token', channel1)).toStrictEqual(403);
    expect(requestStandupActiveV3(user1.token, -1)).toStrictEqual(400);
    expect(requestStandupActiveV3(user2.token, channel1)).toStrictEqual(403);

    expect(requestStandupSendV3('invalid token', channel1, 'a')).toStrictEqual(403);
    expect(requestStandupSendV3(user1.token, -1, 'a')).toStrictEqual(400);
    expect(requestStandupSendV3(user2.token, channel1, 'a')).toStrictEqual(403);
    expect(requestStandupSendV3(user1.token, channel1, 'a'.repeat(1001))).toStrictEqual(400);

    // end standup
    await sleep(2);
    expect(requestStandupSendV3(user1.token, channel1, 'a')).toStrictEqual(400);
  });

  test('correct return', async () => {
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true).channelId;
    reqChannelInvite(user1.token, channel1, user2.authUserId);

    const timeFinish = Math.floor((new Date()).getTime() / 1000) + 2;
    const timeFinReturned = requestStandupStartV3(user1.token, channel1, 2).timeFinish;

    // account for minute time change
    expect(timeFinReturned).toBeGreaterThanOrEqual(timeFinish);
    expect(timeFinReturned).toBeLessThanOrEqual(timeFinish + 1);
    expect(requestStandupActiveV3(user1.token, channel1)).toStrictEqual({
      isActive: true,
      timeFinish: timeFinReturned
    });
    expect(requestStandupSendV3(user1.token, channel1, 'Hello')).toStrictEqual({});
    expect(requestStandupSendV3(user2.token, channel1, 'World!')).toStrictEqual({});

    // wait for standup to end
    await sleep(2);
    expect(reqChannelMessages(user1.token, channel1, 0)).toStrictEqual({
      messages: [{
        messageId: 1,
        uId: user1.authUserId,
        message: 'theoang: Hello\nalexavery: World!',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }],
      start: 0,
      end: -1
    });

    const timeSent = reqChannelMessages(user1.token, channel1, 0).messages[0].timeSent;
    expect(timeSent).toBeGreaterThanOrEqual(timeFinReturned);
    expect(timeSent).toBeLessThanOrEqual(timeFinReturned + 1);
  });
});
