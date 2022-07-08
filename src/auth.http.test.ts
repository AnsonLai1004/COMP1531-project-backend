/**
 * Test file for auth routes endpoints and status codes.
 */

import { requestAuthRegister, requestAuthLogin, requestClear } from './requests';

beforeEach(() => {
  requestClear();
});

describe('auth/register/v2 error cases', () => {
  test('Invalid email', () => {
    const registered = requestAuthRegister('not-an-email', 'password', 'Harry', 'Potter');
    expect(registered).toStrictEqual({ error: 'error' });
  });

  test('Same email as another user', () => {
    requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
    const registered = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
    expect(registered).toStrictEqual({ error: 'error' });
  });

  test('Password has five characters', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'npass', 'Harry', 'Potter');
    expect(registered).toStrictEqual({ error: 'error' });
  });

  test('Empty first name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', '', 'Potter');
    expect(registered).toStrictEqual({ error: 'error' });
  });

  test('Empty last name', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', '');
    expect(registered).toStrictEqual({ error: 'error' });
  });

  test('51 character first name', () => {
    const char = 'a';
    const registered = requestAuthRegister('valid@gmail.com', 'password', char.repeat(51), 'Potter');
    expect(registered).toStrictEqual({ error: 'error' });
  });

  test('51 character last name', () => {
    const char = 'a';
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', char.repeat(51));
    expect(registered).toStrictEqual({ error: 'error' });
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
    expect(login).toStrictEqual({ error: 'error' });
  });

  test('Wrong password', () => {
    requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login = requestAuthLogin('valid@gmail.com', 'wrongpassword');
    expect(login).toStrictEqual({ error: 'error' });
  });
});

describe('auth/login/v2 function valid cases', () => {
  test('Valid login', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const login = requestAuthLogin('valid@gmail.com', 'password');
    expect(login).toStrictEqual({
      token: expect.any(String),
      authUserId: registered.authUserId
    });
  });
});
