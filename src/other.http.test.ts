import { requestAuthRegister, requestChannelsCreateV3, requestChannelsListV3, requestUserProfile, requestClear } from './requests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

test('clearV1 test: can reuse email', () => {
  const userA = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userA).toStrictEqual({
    token: expect.any(String),
    authUserId: expect.any(Number)
  });
  const userB = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userB).toStrictEqual(400);
  requestClear();
  const userC = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userC).toStrictEqual({
    token: expect.any(String),
    authUserId: expect.any(Number)
  });
});

test('clearV1 test: viewing details', () => {
  const userA = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  const channelA = requestChannelsCreateV3(userA.token, 'BOOST', true);
  expect(requestUserProfile(userA.token, userA.authUserId)).toMatchObject({
    user: {
      uId: userA.authUserId,
      email: 'hayhay123@gmail.com',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      handleStr: 'haydensmith',
    }
  });
  expect(requestChannelsListV3(userA.token)).toMatchObject({
    channels: [
      {
        name: 'BOOST',
        channelId: channelA.channelId,
      }
    ],
  });
  requestClear();
  expect(requestUserProfile(userA.token, userA.authUserId)).toEqual(403);
  expect(requestChannelsListV3(userA.token)).toEqual(403);
});
