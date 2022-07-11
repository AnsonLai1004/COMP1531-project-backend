import { reqDmList, reqDmDetails, reqDmCreate, requestClear, requestAuthRegister } from './requests';

beforeEach(() => {
  requestClear();
});

afterEach(() => {
  requestClear();
});

describe('dm/create/v1', () => {
  test('invalid uId in uIds, invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const uIds = [-999, -1000];
    expect(reqDmCreate(user.token, uIds)).toStrictEqual({ error: 'error' });
    expect(reqDmCreate('invalid', uIds)).toStrictEqual({ error: 'error' });
  });
  test('duplicate uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId, user1.authUserId];
    expect(reqDmCreate(user.token, uIds)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    expect(reqDmDetails(user2.token, dm.dmId)).toMatchObject({
      name: 'alexavery, jakerenzella, theoang',
      members: [
        {
          email: 'theo.ang816@gmail.com',
          handleStr: 'theoang',
          nameFirst: 'Theo',
          nameLast: 'Ang',
          uId: user1.authUserId,
        },
        {
          email: 'alex@gmail.com',
          handleStr: 'alexavery',
          nameFirst: 'Alex',
          nameLast: 'Avery',
          uId: user2.authUserId,
        },
      ],
    });
    /*
    const user3 = requestAuthRegister('bill@gmail.com', 'samplePass', 'Bill', 'Benkins');
    const uIds2 = [user1.authUserId];
    const dm2 = reqDmCreate(user3.token, uIds2);
    expect(reqDmList(user1.token)).toMatchObject([
      {
        dmId: dm.dmId,
        name: 'alexavery, jakerenzella, theoang',
      },
      {
        dmId: dm2.dmId,
        name: 'billbenkins, theoang',
      },
    ]);
    */
  });
});

describe('dm/details/v1', () => {
  test('invalid dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqDmDetails(user.token, -999)).toStrictEqual({ error: 'error' });
  });
  test('authUserId is invalid or is not a member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    expect(reqDmDetails(notMember.token, dm.dmId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    expect(reqDmDetails(user2.token, dm.dmId)).toMatchObject({
      name: 'alexavery, jakerenzella, theoang',
      members: [
        {
          email: 'theo.ang816@gmail.com',
          handleStr: 'theoang',
          nameFirst: 'Theo',
          nameLast: 'Ang',
          uId: user1.authUserId,
        },
        {
          email: 'alex@gmail.com',
          handleStr: 'alexavery',
          nameFirst: 'Alex',
          nameLast: 'Avery',
          uId: user2.authUserId,
        },
      ],
    });
  });
});

describe('dm/list/v1', () => {

  test('invalid token', () => {
    expect(reqDmList('invalid token')).toStrictEqual({ error: 'error' });
  });
  
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const user3 = requestAuthRegister('bill@gmail.com', 'samplePass', 'Bill', 'Benkins');

    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm1 = reqDmCreate(user1.token, []);

    // owner only
    expect(reqDmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    })

    // owner and member
    expect(reqDmList(user1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }, 
        {
          dmId: dm1.dmId,
          name: 'theoang',
        },
      ]
    })

    // member only
    expect(reqDmList(user2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    })

    // none
    expect(reqDmList(user3.token)).toStrictEqual({ dms: [] })
  });
});