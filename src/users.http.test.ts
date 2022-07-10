import { requestAuthRegister, requestUserProfile, requestUsersAll, requestClear } from './requests';

beforeEach(() => {
  requestClear();
});

describe('Testing user/profile/v2 error cases', () => {
  test('Invalid uId', () => {
    const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAnId = registered.authUserId + 99;
    const profile = requestUserProfile(registered.token, notAnId);
    expect(profile).toStrictEqual({ error: 'error' });
  });

  test('Invalid token', () => {
    const registered = requestAuthRegister('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAToken = registered.token + 'extra characters';
    const profile = requestUserProfile(notAToken, registered.authUserId);
    expect(profile).toStrictEqual({ error: 'error' });
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
    expect(users).toStrictEqual({ error: 'error' });
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
      users: [
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
      ]
    });
  });
});
