import { requestAuthRegister, requestChannelsCreate, requestChannelsList, requestUserProfile, requestClear } from './requests';

beforeEach(() => {
  requestClear();
});

test('clearV1 test: can reuse email', () => {
  const userA = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userA.body).toStrictEqual({
    token: expect.any(String),
    authUserId: expect.any(Number)
  });
  const userB = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userB.statusCode).toStrictEqual(400);
  const clear = requestClear();
  expect(clear.body).toEqual({});
  const userC = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userC.body).toStrictEqual({
    token: expect.any(String),
    authUserId: expect.any(Number)
  });
});

test('clearV1 test: viewing details', () => {
  const userA = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  const channelA = requestChannelsCreate(userA.body.token, 'BOOST', true);
  expect(requestUserProfile(userA.body.token, userA.body.authUserId).body).toMatchObject({
    user: {
      uId: userA.body.authUserId,
      email: 'hayhay123@gmail.com',
      nameFirst: 'Hayden',
      nameLast: 'Smith',
      handleStr: 'haydensmith',
    }
  });
  expect(requestChannelsList(userA.body.token)).toMatchObject({
    channels: [
      {
        name: 'BOOST',
        channelId: channelA.channelId,
      }
    ],
  });
  requestClear();
  expect(requestUserProfile(userA.body.token, userA.body.authUserId).statusCode).toEqual(403);
  expect(requestChannelsList(userA.body.token)).toMatchObject({ error: 'error' });
});
