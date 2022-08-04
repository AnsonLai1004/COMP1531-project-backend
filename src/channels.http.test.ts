import { requestChannelsCreateV3, requestChannelsListV3, requestChannelsListallV3, requestAuthRegister, requestClear } from './requests';

/// //////////////// EXTRA INTERFACE /////////////////////////
interface authRegisterRet {
    token: string,
    authUserId: number,
}

/// /////////////// TESTING //////////////////////////////////
beforeEach(() => requestClear());
afterAll(() => requestClear());

describe('Channels Functions Errors', () => {
  test('error channelsCreate', () => {
    const validToken = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang').token;
    let invalid = requestChannelsCreateV3(validToken, '', true);
    expect(invalid).toStrictEqual(400);
    invalid = requestChannelsCreateV3(validToken, '123456890712345678901', true);
    expect(invalid).toStrictEqual(400);
    // ASSUMPTION - invalid token returns error
    invalid = requestChannelsCreateV3('invalid token', 'TheoAng', true);
    expect(invalid).toStrictEqual(403);
  });

  // ASSUMPTION - invalid token returns error
  test('invalid ID channelsListV1 channelsListallV1', () => {
    let invalid = requestChannelsListV3('invalid token');
    expect(invalid).toStrictEqual(403);
    invalid = requestChannelsListallV3('invalid token');
    expect(invalid).toStrictEqual(403);
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

    channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true).channelId;

    channel2 = requestChannelsCreateV3(user2.token, 'CRUNCHIE', true).channelId;

    channel3 = requestChannelsCreateV3(user1.token, 'EGGS', true).channelId;

    channel4 = requestChannelsCreateV3(user3.token, 'AERO', false).channelId;
  });

  test('channelsListV1 users 1-5', () => {
    const list1 = requestChannelsListV3(user1.token);
    expect(list1).toStrictEqual({
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

    const list2 = requestChannelsListV3(user2.token);
    expect(list2).toStrictEqual({
      channels:
                [
                  {
                    channelId: channel2,
                    name: 'CRUNCHIE',
                  },
                ]
    });

    const list3 = requestChannelsListV3(user3.token);
    expect(list3).toStrictEqual({
      channels:
                [
                  {
                    channelId: channel4,
                    name: 'AERO',
                  },
                ]
    });

    const list4 = requestChannelsListV3(user4.token);
    expect(list4).toStrictEqual({
      channels: []
    });

    const list5 = requestChannelsListV3(user5.token);
    expect(list5).toStrictEqual({ channels: [] });
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

    const list1 = requestChannelsListallV3(user1.token);
    expect(list1).toStrictEqual(listAll);
    const list2 = requestChannelsListallV3(user1.token);
    expect(list2).toStrictEqual(listAll);
    const list3 = requestChannelsListallV3(user1.token);
    expect(list3).toStrictEqual(listAll);
    const list4 = requestChannelsListallV3(user1.token);
    expect(list4).toStrictEqual(listAll);
    const list5 = requestChannelsListallV3(user1.token);
    expect(list5).toStrictEqual(listAll);
  });
});
