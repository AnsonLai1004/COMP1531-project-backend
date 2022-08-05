import { requestAuthRegister, requestAuthLogin, requestUserProfile, requestClear, reqPasswordResetRequest, reqPasswordResetReset } from './requests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

test('Test that user is logged out of all sessions when requesting reset', () => {
  const registered = requestAuthRegister('email@email.com', 'password', 'Harry', 'Potter');
  const login1 = requestAuthLogin('email@email.com', 'password');
  const login2 = requestAuthLogin('email@email.com', 'password');
  const login3 = requestAuthLogin('email@email.com', 'password');

  const request = reqPasswordResetRequest('email@email.com');
  expect(request).toEqual({});

  expect(requestUserProfile(registered.token, registered.uId)).toEqual(403);
  expect(requestUserProfile(login1.token, registered.uId)).toEqual(403);
  expect(requestUserProfile(login2.token, registered.uId)).toEqual(403);
  expect(requestUserProfile(login3.token, registered.uId)).toEqual(403);
});

test('No error raised when requesting for invalid email', () => {
  requestAuthRegister('email@email.com', 'password', 'Harry', 'Potter');
  expect(reqPasswordResetRequest('not-even-email-format')).toEqual({});
  expect(reqPasswordResetRequest('harrypotter')).toEqual({});
});

test('400 error code is not valid', () => {
  requestAuthRegister('email@email.com', 'password', 'Harry', 'Potter');
  expect(reqPasswordResetReset('random string', 'newpassword')).toEqual(400);
  expect(reqPasswordResetReset('random string', 'short')).toEqual(400);
});
