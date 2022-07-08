import { authRegisterV1 } from './auth';
import { userProfileV1 } from './users';
import { clearV1 } from './other';

beforeEach(() => {
  clearV1();
});

describe('Testing userProfile function error cases', () => {
  test('Invalid uId', () => {
    const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAnId = registered.authUserId + 99;
    const profile = userProfileV1(registered.authUserId, notAnId);
    expect(profile).toStrictEqual({ error: 'error' });
  });

  test('Invalid authUserId', () => {
    const registered = authRegisterV1('another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const notAnId = registered.authUserId + 99;
    const profile = userProfileV1(notAnId, registered.authUserId);
    expect(profile).toStrictEqual({ error: 'error' });
  });
});

describe('Testing userProfile function valid cases', () => {
  test('Viewing another user\'s information', () => {
    const registered1 = authRegisterV1('yet-another-valid@gmail.com', 'password', 'Harry', 'Potter');
    const registered2 = authRegisterV1('different@gmail.com', 'password', 'Hermione', 'Granger');
    const profile = userProfileV1(registered1.authUserId, registered2.authUserId);
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
    const registered = authRegisterV1('chosen-one@gmail.com', 'password', 'Harry', 'Potter');
    const profile = userProfileV1(registered.authUserId, registered.authUserId);
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
