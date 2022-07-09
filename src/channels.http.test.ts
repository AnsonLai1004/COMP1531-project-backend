import { requestChannelsCreate, requestChannelsList, requestChannelsListall, requestAuthRegister, requestClear } from './requests';

/// //////////////// EXTRA INTERFACE /////////////////////////
interface authRegisterRet {
    token: string,
    authUserId: number,
}

/// /////////////// TESTING //////////////////////////////////
beforeEach(() => requestClear());

describe('Channels Functions Errors', () => {
  test('error channelsCreate', () => {
    const validToken = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang').token;
    expect(requestChannelsCreate(validToken, '', true)).toStrictEqual({ error: 'error' });
    expect(requestChannelsCreate(validToken, '123456890712345678901', true)).toStrictEqual({ error: 'error' });
    // ASSUMPTION - invalid token returns error
    expect(requestChannelsCreate('invalid token', 'TheoAng', true)).toStrictEqual({ error: 'error' });
  });

  // ASSUMPTION - invalid token returns error
  test('invalid ID channelsListV1 channelsListallV1', () => {
    expect(requestChannelsList('invalid token')).toStrictEqual({ error: 'error' });
    expect(requestChannelsListall('invalid token')).toStrictEqual({ error: 'error' });
  });
});

let user1: authRegisterRet;
let user2: authRegisterRet;
let user3: authRegisterRet;
let user4: authRegisterRet;
let user5: authRegisterRet;
let channel1: number;
let channel2: number;
let channel3: number;
let channel4: number;

describe('Correct Input', () => {
  beforeEach(() => {
    // DATA
    user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    user3 = requestAuthRegister('bill@gmail.com', 'samplePass', 'Bill', 'Benkins');
    user4 = requestAuthRegister('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman');
    user5 = requestAuthRegister('dory@gmail.com', 'samplePass', 'Dory', 'Dean');

    channel1 = requestChannelsCreate(user1.token, 'BOOST', true).channelId;

    channel2 = requestChannelsCreate(user2.token, 'CRUNCHIE', true).channelId;

    channel3 = requestChannelsCreate(user1.token, 'EGGS', true).channelId;

    channel4 = requestChannelsCreate(user3.token, 'AERO', false).channelId;
  });

  test('channelsListV1 users 1-5', () => {
    expect(requestChannelsList(user1.token)).toStrictEqual({
      channels:
                [
                  {
                    channelId: channel1,
                    name: 'BOOST',
                  },
                  {
                    channelId: channel3,
                    name: 'EGGS',
                  },
                ]
    });

    expect(requestChannelsList(user2.token)).toStrictEqual({
      channels:
                [
                  {
                    channelId: channel2,
                    name: 'CRUNCHIE',
                  },
                ]
    });

    expect(requestChannelsList(user3.token)).toStrictEqual({
      channels:
                [
                  {
                    channelId: channel4,
                    name: 'AERO',
                  },
                ]
    });

    expect(requestChannelsList(user4.token)).toStrictEqual({
      channels:
                [
                ]
    });

    expect(requestChannelsList(user5.token)).toStrictEqual({ channels: [] });
  });

  test('channelsListallV1 users 1-5', () => {
    const listAll = {
      channels:
                [
                  {
                    channelId: channel1,
                    name: 'BOOST',
                  },
                  {
                    channelId: channel2,
                    name: 'CRUNCHIE',
                  },
                  {
                    channelId: channel3,
                    name: 'EGGS',
                  },
                  {
                    channelId: channel4,
                    name: 'AERO',
                  },
                ]
    };

    expect(requestChannelsListall(user1.token)).toStrictEqual(listAll);
    expect(requestChannelsListall(user1.token)).toStrictEqual(listAll);
    expect(requestChannelsListall(user1.token)).toStrictEqual(listAll);
    expect(requestChannelsListall(user1.token)).toStrictEqual(listAll);
    expect(requestChannelsListall(user1.token)).toStrictEqual(listAll);
  });
});
