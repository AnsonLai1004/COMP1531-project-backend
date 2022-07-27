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
    const notAnId = registered.body.authUserId + 99;
    const profile = requestUserProfile(registered.body.token, notAnId);
    expect(profile.statusCode).toStrictEqual(400);
  });

  test('Invalid token', () => {
    const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAToken = registered.body.token + 'extra characters';
    const profile = requestUserProfile(notAToken, registered.body.authUserId);
    expect(profile.statusCode).toStrictEqual(403);
  });
});

describe('Testing user/profile/v2 valid cases', () => {
  test('Viewing another user\'s information', () => {
    const registered1 = requestAuthRegister('yet-another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = requestAuthRegister('different@gmail.com', 'password', 'Hermione', 'Granger');
    const profile = requestUserProfile(registered1.body.token, registered2.body.authUserId);
    expect(profile.body).toStrictEqual({
      user: expect.objectContaining({
        uId: registered2.body.authUserId,
        email: 'different@gmail.com',
        nameFirst: 'Hermione',
        nameLast: 'Granger',
        handleStr: 'hermionegranger'
      })
    });
  });

  test('Viewing own information', () => {
    const registered = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    const profile = requestUserProfile(registered.body.token, registered.body.authUserId);
    expect(profile.body).toStrictEqual({
      user: expect.objectContaining({
        uId: registered.body.authUserId,
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
    const notAToken = registered.body.token + 'extra characters';
    const users = requestUsersAll(notAToken);
    expect(users.statusCode).toStrictEqual(403);
  });
});

describe('Testing users/all/v1 valid cases', () => {
  test('Only one user', () => {
    const registered = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    const users = requestUsersAll(registered.body.token);
    expect(users.body).toStrictEqual({
      users: [{
        uId: registered.body.authUserId,
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
    const users = requestUsersAll(registered1.body.token);
    expect(users.body).toStrictEqual({
      users: expect.arrayContaining([
        {
          uId: registered1.body.authUserId,
          email: 'chosen-one@gmail.com',
          nameFirst: 'Harry',
          nameLast: 'Potter',
          handleStr: 'harrypotter'
        },
        {
          uId: registered2.body.authUserId,
          email: 'different@gmail.com',
          nameFirst: 'Hermione',
          nameLast: 'Granger',
          handleStr: 'hermionegranger'
        },
        {
          uId: registered3.body.authUserId,
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
    const notAToken = registered.body.token + 'extra characters';
    expect(requestUserSetName(notAToken, 'First', 'Last').statusCode).toStrictEqual(403);
    expect(requestUserSetEmail(notAToken, 'email@gmail.com').statusCode).toStrictEqual(403);
    expect(requestUserSetHandle(notAToken, 'newhandle').statusCode).toStrictEqual(403);
  });
  describe('/setname/v1 specific error cases', () => {
    test('Names are empty', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetName(registered.body.token, '', 'Last').statusCode).toStrictEqual(400);
      expect(requestUserSetName(registered.body.token, 'First', '').statusCode).toStrictEqual(400);
    });
    test('Names are 51 characters', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      const char = 'a';
      expect(requestUserSetName(registered.body.token, char.repeat(51), 'Last').statusCode).toStrictEqual(400);
      expect(requestUserSetName(registered.body.token, 'First', char.repeat(51)).statusCode).toStrictEqual(400);
    });
  });
  describe('/setemail/v1 specific error cases', () => {
    test('Invalid email', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetEmail(registered.body.token, 'notAnEmail').statusCode).toStrictEqual(400);
    });
    test('Email used by another user', () => {
      const registered1 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      requestAuthRegister('already-used@gmail.com', 'password', 'Hermione', 'Granger');
      expect(requestUserSetEmail(registered1.body.token, 'already-used@gmail.com').statusCode).toStrictEqual(400);
    });
  });
  describe('/sethandle/v1 specific error cases', () => {
    test('Handle is less than 3 chars or more than 20', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      const char = 'a';
      expect(requestUserSetHandle(registered.body.token, char.repeat(2)).statusCode).toStrictEqual(400);
      expect(requestUserSetHandle(registered.body.token, char.repeat(21)).statusCode).toStrictEqual(400);
    });
    test('Handle uses non alphanumeric characters', () => {
      const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetHandle(registered.body.token, '!@#$%^&*()_+-=').statusCode).toStrictEqual(400);
      expect(requestUserSetHandle(registered.body.token, 'notquitevalid!').statusCode).toStrictEqual(400);
    });
    test('Handle used by another user', () => {
      const registered1 = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
      requestAuthRegister('already-used@gmail.com', 'password', 'Hermione', 'Granger');
      expect(requestUserSetHandle(registered1.body.token, 'hermionegranger').statusCode).toStrictEqual(400);
    });
  });
});

describe('Testing user/profile/set**/v1 valid cases', () => {
  test('All changes', () => {
    requestAuthRegister('not-to-edit@gmail.com', 'password', 'Different', 'Person');
    const registered = requestAuthRegister('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    expect(requestUserSetName(registered.body.token, 'First', 'Last').body).toStrictEqual({});
    expect(requestUserProfile(registered.body.token, registered.body.authUserId).body).toStrictEqual({
      user: {
        uId: registered.body.authUserId,
        email: 'chosen-one@gmail.com',
        nameFirst: 'First',
        nameLast: 'Last',
        handleStr: 'harrypotter'
      }
    });
    expect(requestUserSetEmail(registered.body.token, 'new-email@gmail.com').body).toStrictEqual({});
    expect(requestUserProfile(registered.body.token, registered.body.authUserId).body).toStrictEqual({
      user: {
        uId: registered.body.authUserId,
        email: 'new-email@gmail.com',
        nameFirst: 'First',
        nameLast: 'Last',
        handleStr: 'harrypotter'
      }
    });
    expect(requestUserSetHandle(registered.body.token, 'newhandle').body).toStrictEqual({});
    expect(requestUserProfile(registered.body.token, registered.body.authUserId).body).toStrictEqual({
      user: {
        uId: registered.body.authUserId,
        email: 'new-email@gmail.com',
        nameFirst: 'First',
        nameLast: 'Last',
        handleStr: 'newhandle'
      }
    });
  });
});
