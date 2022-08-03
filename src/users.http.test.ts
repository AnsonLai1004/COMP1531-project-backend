import { requestAuthRegister, requestUserProfile, requestUsersAll, requestClear } from './requests';
import { requestUserSetEmail, requestUserSetHandle, requestUserSetName } from './requests';

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});

describe('Testing user/profile/v2 error cases', () => {
  test('Invalid uId', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAnId = registered.authUserId + 99;
    const profile = requestUserProfile(registered.token, notAnId);
    expect(profile).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAToken = registered.token + 'extra characters';
    const profile = requestUserProfile(notAToken, registered.authUserId);
    expect(profile).toStrictEqual(403);
  });
});

describe('Testing user/profile/v2 valid cases', () => {
  test('Viewing another user\'s information', () => {
    const registered1 = requestAuthRegister('yet-another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('different@gmail.com', 'password', 'Hermione', 'Granger');
    const profile = requestUserProfile(registered1.token, registered2.authUserId);
    expect(profile).toStrictEqual({
      user: expect.objectContaining({
        uId: registered2.authUserId,
        email: 'different@gmail.com',
        nameFirst: 'Hermione',
        nameLast: 'Granger',
        handleStr: 'hermionegranger'
      })
    });
  });

  test('Viewing own information', () => {
    const registered = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    const profile = requestUserProfile(registered.token, registered.authUserId);
    expect(profile).toStrictEqual({
      user: expect.objectContaining({
        uId: registered.authUserId,
        email: 'chosen-one@gmail.com',
        nameFirst: 'Harry',
        nameLast: 'Potter',
        handleStr: 'harrypotter'
      })
    });
  });
});

describe('Testing users/all/v1 error cases', () => {
  test('Invalid token', () => {
    const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAToken = registered.token + 'extra characters';
    const users = requestUsersAll(notAToken);
    expect(users).toStrictEqual(403);
  });
});

describe('Testing users/all/v1 valid cases', () => {
  test('Only one user', () => {
    const registered = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    const users = requestUsersAll(registered.token);
    expect(users).toStrictEqual({
      users: [{
        uId: registered.authUserId,
        email: 'chosen-one@gmail.com',
        nameFirst: 'Harry',
        nameLast: 'Potter',
        handleStr: 'harrypotter'
      }]
    });
  });

  test('Multiple users information', () => {
    const registered1 = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('different@gmail.com', 'password', 'Hermione', 'Granger');
    const registered3 = requestAuthRegister('golden-trio@gmail.com', 'password', 'Ron', 'Weasley');
    const users = requestUsersAll(registered1.token);
    expect(users).toStrictEqual({
      users: expect.arrayContaining([
        {
          uId: registered1.authUserId,
          email: 'chosen-one@gmail.com',
          nameFirst: 'Harry',
          nameLast: 'Potter',
          handleStr: 'harrypotter'
        },
        {
          uId: registered2.authUserId,
          email: 'different@gmail.com',
          nameFirst: 'Hermione',
          nameLast: 'Granger',
          handleStr: 'hermionegranger'
        },
        {
          uId: registered3.authUserId,
          email: 'golden-trio@gmail.com',
          nameFirst: 'Ron',
          nameLast: 'Weasley',
          handleStr: 'ronweasley'
        }
      ])
    });
  });
});

describe('Testing user/profile/set**/v1 error cases', () => {
  test('Invalid token', () => {
    const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAToken = registered.token + 'extra characters';
    expect(requestUserSetName(notAToken, 'First', 'Last')).toStrictEqual(403);
    expect(requestUserSetEmail(notAToken, 'email@gmail.com')).toStrictEqual(403);
    expect(requestUserSetHandle(notAToken, 'newhandle')).toStrictEqual(403);
  });
  describe('/setname/v1 specific error cases', () => {
    test('Names are empty', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetName(registered.token, '', 'Last')).toStrictEqual(400);
      expect(requestUserSetName(registered.token, 'First', '')).toStrictEqual(400);
    });
    test('Names are 51 characters', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      const char = 'a';
      expect(requestUserSetName(registered.token, char.repeat(51), 'Last')).toStrictEqual(400);
      expect(requestUserSetName(registered.token, 'First', char.repeat(51))).toStrictEqual(400);
    });
  });
  describe('/setemail/v1 specific error cases', () => {
    test('Invalid email', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetEmail(registered.token, 'notAnEmail')).toStrictEqual(400);
    });
    test('Email used by another user', () => {
      const registered1 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      requestAuthRegister('already-used@gmail.com', 'password', 'Hermione', 'Granger');
      expect(requestUserSetEmail(registered1.token, 'already-used@gmail.com')).toStrictEqual(400);
    });
  });
  describe('/sethandle/v1 specific error cases', () => {
    test('Handle is less than 3 chars or more than 20', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      const char = 'a';
      expect(requestUserSetHandle(registered.token, char.repeat(2))).toStrictEqual(400);
      expect(requestUserSetHandle(registered.token, char.repeat(21))).toStrictEqual(400);
    });
    test('Handle uses non alphanumeric characters', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetHandle(registered.token, '!@#$%^&*()_+-=')).toStrictEqual(400);
      expect(requestUserSetHandle(registered.token, 'notquitevalid!')).toStrictEqual(400);
    });
    test('Handle used by another user', () => {
      const registered1 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      requestAuthRegister('already-used@gmail.com', 'password', 'Hermione', 'Granger');
      expect(requestUserSetHandle(registered1.token, 'hermionegranger')).toStrictEqual(400);
    });
  });
});

describe('Testing user/profile/set**/v1 valid cases', () => {
  test('All changes', () => {
    requestAuthRegister('not-to-edit@gmail.com', 'password', 'Different', 'Person');
    const registered = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    expect(requestUserSetName(registered.token, 'First', 'Last')).toStrictEqual({});
    expect(requestUserProfile(registered.token, registered.authUserId)).toStrictEqual({
      user: {
        uId: registered.authUserId,
        email: 'chosen-one@gmail.com',
        nameFirst: 'First',
        nameLast: 'Last',
        handleStr: 'harrypotter'
      }
    });
    expect(requestUserSetEmail(registered.token, 'new-email@gmail.com')).toStrictEqual({});
    expect(requestUserProfile(registered.token, registered.authUserId)).toStrictEqual({
      user: {
        uId: registered.authUserId,
        email: 'new-email@gmail.com',
        nameFirst: 'First',
        nameLast: 'Last',
        handleStr: 'harrypotter'
      }
    });
    expect(requestUserSetHandle(registered.token, 'newhandle')).toStrictEqual({});
    expect(requestUserProfile(registered.token, registered.authUserId)).toStrictEqual({
      user: {
        uId: registered.authUserId,
        email: 'new-email@gmail.com',
        nameFirst: 'First',
        nameLast: 'Last',
        handleStr: 'newhandle'
      }
    });
  });
});
