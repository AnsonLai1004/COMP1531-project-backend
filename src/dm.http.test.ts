import { reqDmDetails, reqDmCreate, requestClear, requestAuthRegister } from './requests';

beforeEach(() => {
  requestClear();
  const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
  const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
  const uIds = [user1.authUserId, user2.authUserId];
});

describe('dm/details/v1', () => {
  test('invalid dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqDmDetails(user.token, -999)).toStrictEqual({ error: 'error' });
    expect(reqDmDetails(user2.token, -999)).toStrictEqual({ error: 'error' });
  });
  test('authUserId is invalid or is not a member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');  
    const notMember = requestAuthRegister('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman');
    const dm = reqDmCreate(user.token, uIds);
    expect(reqDmDetails(notMember.token, dm.dmId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');  
    const dm = reqDmCreate(user.token, uIds);
    expect(reqDmDetails(user2.token, dm.dmId)).toMatchObject({
      name: 'alexavery, jakerenzella, theoang',
      members: uIds,
    });
  });
});
