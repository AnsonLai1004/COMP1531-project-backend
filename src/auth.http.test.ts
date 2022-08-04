/**
 * Test file for auth routes endpoints and status codes.
 */

import { requestAuthRegister, requestAuthLogin, requestAuthLogout, requestUserProfile, requestClear } from './requests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('auth/register/v2 error cases', () => {
  test('Invalid email', () => {
    const registered = requestAuthRegister('not-an-email', 'password', 'Harry', 'Potter');
    expect(registered).toStrictEqual(400);
  });

  test('Same email as another user', () => {
    requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const registered = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
    expect(registered).toStrictEqual(400);
  });

  test('Password has five characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'npass', 'Harry', 'Potter');
    expect(registered).toStrictEqual(400);
  });

  test('Empty first name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '', 'Potter');
    expect(registered).toStrictEqual(400);
  });

  test('Empty last name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', '');
    expect(registered).toStrictEqual(400);
  });

  test('51 character first name', () => {
    const char = 'a';
    const registered = requestAuthRegister('valid@gmail.com', 'password', char.repeat(51), 'Potter');
    expect(registered).toStrictEqual(400);
  });

  test('51 character last name', () => {
    const char = 'a';
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', char.repeat(51));
    expect(registered).toStrictEqual(400);
  });
});

describe('auth/register/v2 function valid cases', () => {
  test('Single user', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    expect(registered).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
  test('Two users, check tokens and ids are different', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('different@gmail.com', 'password', 'Hermione', 'Granger');
    expect(registered1.token !== registered2.token);
    expect(registered1.authUserId !== registered2.authUserId);
  });
});

describe('auth/login/v2 function error cases', () => {
  test('Email does not belong to a user', () => {
    const login = requestAuthLogin('invalid@gmail.com', 'password');
    expect(login).toStrictEqual(400);
  });

  test('Wrong password', () => {
    requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login = requestAuthLogin('valid@gmail.com', 'wrongpassword');
    expect(login).toStrictEqual(400);
  });
});

describe('auth/login/v2 function valid cases', () => {
  test('Valid login', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login1 = requestAuthLogin('valid@gmail.com', 'password');
    expect(login1).toStrictEqual({
      token: expect.any(String),
      authUserId: registered1.authUserId
    });
    const registered2 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const login2 = requestAuthLogin('another-valid@gmail.com', 'password');
    expect(login2).toStrictEqual({
      token: expect.any(String),
      authUserId: registered2.authUserId
    });
  });
  test('Same user can create unique sessions', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login1 = requestAuthLogin('valid@gmail.com', 'password');
    const login2 = requestAuthLogin('valid@gmail.com', 'password');
    expect(login1).toStrictEqual({
      token: expect.any(String),
      authUserId: registered.authUserId
    });
    expect(login2).toStrictEqual({
      token: expect.any(String),
      authUserId: registered.authUserId
    });
    expect(login1.token).not.toEqual(login2.token);
    expect(login1.authUserId).toEqual(login2.authUserId);
  });
});

describe('auth/logout/v1 function valid cases', () => {
  test('Check with user/profile functionality', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const expectDetails = {
      uId: registered.authUserId,
      email: 'valid@gmail.com',
      nameFirst: 'Harry',
      nameLast: 'Potter',
      handleStr: 'harrypotter',
      profileImgUrl: "http://localhost:34054/img/default.jpg",
    };
    const login = requestAuthLogin('valid@gmail.com', 'password');
    expect(requestUserProfile(registered.token, registered.authUserId)).toEqual({ user: expectDetails });
    expect(requestUserProfile(login.token, registered.authUserId)).toEqual({ user: expectDetails });

    const logout1 = requestAuthLogout(login.token);
    expect(logout1).toStrictEqual({});
    expect(requestUserProfile(registered.token, registered.authUserId)).toEqual({ user: expectDetails });
    expect(requestUserProfile(login.token, registered.authUserId)).toEqual(403);

    const logout2 = requestAuthLogout(registered.token);
    expect(logout2).toStrictEqual({});
    expect(requestUserProfile(registered.token, registered.authUserId)).toEqual(403);
    expect(requestUserProfile(login.token, registered.authUserId)).toEqual(403);
  });
});

describe('Testing auth/register handle generation with user/profile', () => {
  test('Three users with same name, check that id appends numbers', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered3 = requestAuthRegister('different-valid@gmail.com', 'password', 'Harry', 'Potter');

    const profile1 = requestUserProfile(registered1.token, registered1.authUserId);
    const profile2 = requestUserProfile(registered2.token, registered2.authUserId);
    const profile3 = requestUserProfile(registered3.token, registered3.authUserId);

    expect(profile1.user.handleStr === 'harrypotter');
    expect(profile2.user.handleStr === 'harrypotter0');
    expect(profile3.user.handleStr === 'harrypotter1');
  });
  test('Casting uppercase to lowercase', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'HARRY', 'POTTER');
    const profile = requestUserProfile(registered.token, registered.authUserId);
    expect(profile.user.handleStr === 'harrypotter');
  });
  test('Removing non-alphanumeric characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'harry#@*)(#', 'potter_+_#@');
    const profile = requestUserProfile(registered.token, registered.authUserId);
    expect(profile.user.handleStr === 'harrypotter');
  });
  test('Keeping numbers passed into name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '123Harry', '456Potter');
    const profile = requestUserProfile(registered.token, registered.authUserId);
    expect(profile.user.handleStr === '123harry456potter');
  });
  test('Cut off 21 character name to 20 characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '1234567890', '12345678901');
    const profile = requestUserProfile(registered.token, registered.authUserId);
    expect(profile.user.handleStr === '12345678901234567890');
  });
  test('Handle may exceed 20 characters when appending numbers', () => {
    const registered1 = requestAuthRegister('valid@gmail.com', 'password', '1234567890', '12345678901');
    const registered2 = requestAuthRegister('another-valid@gmail.com', 'password', '1234567890', '12345678901');
    const profile1 = requestUserProfile(registered1.token, registered1.authUserId);
    const profile2 = requestUserProfile(registered2.token, registered2.authUserId);
    expect(profile1.user.handleStr === '12345678901234567890');
    expect(profile2.user.handleStr === '123456789012345678900');
  });
});
