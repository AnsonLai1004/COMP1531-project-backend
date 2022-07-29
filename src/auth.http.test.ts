/**
 * Test file for auth routes endpoints and status codes.
 */

import { requestAuthRegister, requestAuthLogin, requestAuthLogout, requestUserProfile, requestClear } from './requests';

beforeEach(() => {
  requestClear();
});

describe('auth/register/v2 error cases', () => {
  test('Invalid email', () => {
    const registered = requestAuthRegister('not-an-email', 'password', 'Harry', 'Potter');
    expect(registered.statusCode).toStrictEqual(400);
  });

  test('Same email as another user', () => {
    requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const registered = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
    expect(registered.statusCode).toStrictEqual(400);
  });

  test('Password has five characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'npass', 'Harry', 'Potter');
    expect(registered.statusCode).toStrictEqual(400);
  });

  test('Empty first name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '', 'Potter');
    expect(registered.statusCode).toStrictEqual(400);
  });

  test('Empty last name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', '');
    expect(registered.statusCode).toStrictEqual(400);
  });

  test('51 character first name', () => {
    const char = 'a';
    const registered = requestAuthRegister('valid@gmail.com', 'password', char.repeat(51), 'Potter');
    expect(registered.statusCode).toStrictEqual(400);
  });

  test('51 character last name', () => {
    const char = 'a';
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', char.repeat(51));
    expect(registered.statusCode).toStrictEqual(400);
  });
});

describe('auth/register/v2 function valid cases', () => {
  test('Single user', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    expect(registered.body).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
  test('Two users, check tokens and ids are different', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('different@gmail.com', 'password', 'Hermione', 'Granger');
    expect(registered1.body.token !== registered2.body.token);
    expect(registered1.body.authUserId !== registered2.body.authUserId);
  });
});

describe('auth/login/v2 function error cases', () => {
  test('Email does not belong to a user', () => {
    const login = requestAuthLogin('invalid@gmail.com', 'password');
    expect(login.statusCode).toStrictEqual(400);
  });

  test('Wrong password', () => {
    requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login = requestAuthLogin('valid@gmail.com', 'wrongpassword');
    expect(login.statusCode).toStrictEqual(400);
  });
});

describe('auth/login/v2 function valid cases', () => {
  test('Valid login', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login1 = requestAuthLogin('valid@gmail.com', 'password');
    expect(login1.body).toStrictEqual({
      token: expect.any(String),
      authUserId: registered1.body.authUserId
    });
    const registered2 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const login2 = requestAuthLogin('another-valid@gmail.com', 'password');
    expect(login2.body).toStrictEqual({
      token: expect.any(String),
      authUserId: registered2.body.authUserId
    });
  });
  test('Same user can create unique sessions', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login1 = requestAuthLogin('valid@gmail.com', 'password');
    const login2 = requestAuthLogin('valid@gmail.com', 'password');
    expect(login1.body).toStrictEqual({
      token: expect.any(String),
      authUserId: registered.body.authUserId
    });
    expect(login2.body).toStrictEqual({
      token: expect.any(String),
      authUserId: registered.body.authUserId
    });
    expect(login1.body.token).not.toEqual(login2.body.token);
    expect(login1.body.authUserId).toEqual(login2.body.authUserId);
  });
});

describe('auth/logout/v1 function valid cases', () => {
  test('Check with user/profile functionality', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const expectDetails = {
      uId: registered.body.authUserId,
      email: 'valid@gmail.com',
      nameFirst: 'Harry',
      nameLast: 'Potter',
      handleStr: 'harrypotter'
    };
    const login = requestAuthLogin('valid@gmail.com', 'password');
    expect(requestUserProfile(registered.body.token, registered.body.authUserId).body).toEqual({ user: expectDetails });
    expect(requestUserProfile(login.body.token, registered.body.authUserId).body).toEqual({ user: expectDetails });

    const logout1 = requestAuthLogout(login.body.token);
    expect(logout1.body).toStrictEqual({});
    expect(requestUserProfile(registered.body.token, registered.body.authUserId).body).toEqual({ user: expectDetails });
    expect(requestUserProfile(login.body.token, registered.body.authUserId).statusCode).toEqual(403);

    const logout2 = requestAuthLogout(registered.body.token);
    expect(logout2.body).toStrictEqual({});
    expect(requestUserProfile(registered.body.token, registered.body.authUserId).statusCode).toEqual(403);
    expect(requestUserProfile(login.body.token, registered.body.authUserId).statusCode).toEqual(403);
  });
});

describe('Testing auth/register handle generation with user/profile', () => {
  test('Three users with same name, check that id appends numbers', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered3 = requestAuthRegister('different-valid@gmail.com', 'password', 'Harry', 'Potter');

    const profile1 = requestUserProfile(registered1.body.token, registered1.body.authUserId);
    const profile2 = requestUserProfile(registered2.body.token, registered2.body.authUserId);
    const profile3 = requestUserProfile(registered3.body.token, registered3.body.authUserId);

    expect(profile1.body.user.handleStr === 'harrypotter');
    expect(profile2.body.user.handleStr === 'harrypotter0');
    expect(profile3.body.user.handleStr === 'harrypotter1');
  });
  test('Casting uppercase to lowercase', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'HARRY', 'POTTER');
    const profile = requestUserProfile(registered.body.token, registered.body.authUserId);
    expect(profile.body.user.handleStr === 'harrypotter');
  });
  test('Removing non-alphanumeric characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'harry#@*)(#', 'potter_+_#@');
    const profile = requestUserProfile(registered.body.token, registered.body.authUserId);
    expect(profile.body.user.handleStr === 'harrypotter');
  });
  test('Keeping numbers passed into name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '123Harry', '456Potter');
    const profile = requestUserProfile(registered.body.token, registered.body.authUserId);
    expect(profile.body.user.handleStr === '123harry456potter');
  });
  test('Cut off 21 character name to 20 characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '1234567890', '12345678901');
    const profile = requestUserProfile(registered.body.token, registered.body.authUserId);
    expect(profile.body.user.handleStr === '12345678901234567890');
  });
  test('Handle may exceed 20 characters when appending numbers', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', '1234567890', '12345678901');
    const registered2 = requestAuthRegister('another-valid@gmail.com', 'password', '1234567890', '12345678901');
    const profile1 = requestUserProfile(registered1.body.token, registered1.body.authUserId);
    const profile2 = requestUserProfile(registered2.body.token, registered2.body.authUserId);
    expect(profile1.body.user.handleStr === '12345678901234567890');
    expect(profile2.body.user.handleStr === '123456789012345678900');
  });
});
