import { reqDmLeave, reqDmRemove, reqDmList, reqDmDetails, reqDmCreate, requestClear, requestAuthRegister } from './requests';

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
        {
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          uId: user.authUserId,
        },
      ],
    });

    const user3 = requestAuthRegister('bill@gmail.com', 'samplePass', 'Bill', 'Benkins');
    const uIds2 = [user1.authUserId];
    const dm2 = reqDmCreate(user3.token, uIds2);
    expect(reqDmList(user1.token)).toMatchObject({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        },
        {
          dmId: dm2.dmId,
          name: 'billbenkins, theoang',
        },
      ]
    });
  });
});

describe('dm/details/v1', () => {
  test('invalid token', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqDmDetails('invalid', -999)).toStrictEqual({ error: 'error' });
  });
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
        {
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          uId: user.authUserId,
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
    });

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
    });

    // member only
    expect(reqDmList(user2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // none
    expect(reqDmList(user3.token)).toStrictEqual({ dms: [] });
  });
});

describe('dm/remove/v1', () => {
  test('invalid token / dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const dm = reqDmCreate(user.token, []);

    expect(reqDmRemove('invalid token', dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmRemove(user.token, -1)).toStrictEqual({ error: 'error' });
    expect(reqDmRemove('invalid token', -1)).toStrictEqual({ error: 'error' });
  });

  test('user not owner / member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.token, [user1.authUserId]);

    expect(reqDmRemove(user2.token, dm.dmId)).toStrictEqual({ error: 'error' });
  });

  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const dm = reqDmCreate(user.token, [user1.authUserId]);
    const dm1 = reqDmCreate(user1.token, []);

    // BEFORE
    expect(reqDmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'jakerenzella, theoang',
        }
      ]
    });

    expect(reqDmList(user1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'jakerenzella, theoang',
        },
        {
          dmId: dm1.dmId,
          name: 'theoang',
        },
      ]
    });

    expect(reqDmRemove(user.token, dm.dmId)).toStrictEqual({});

    // AFTER
    expect(reqDmList(user.token)).toStrictEqual({ dms: [] });

    expect(reqDmList(user1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'theoang',
        },
      ]
    });
  });
});

describe('dm/leave/v1', () => {
  test('invalid token + dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const dm = reqDmCreate(user.token, []);

    expect(reqDmLeave('invalid token', dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmLeave(user.token, -1)).toStrictEqual({ error: 'error' });
    expect(reqDmLeave('invalid token', -1)).toStrictEqual({ error: 'error' });
  });

  test('user not member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.token, [user1.authUserId]);

    expect(reqDmRemove(user2.token, dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmRemove(user1.token, -1)).toStrictEqual({ error: 'error' });
  });

  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');

    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm1 = reqDmCreate(user1.token, [user.authUserId]);

    // BEFORE
    expect(reqDmList(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        },
        {
          dmId: dm1.dmId,
          name: 'jakerenzella, theoang',
        },
      ]
    });

    expect(reqDmList(user1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        },
        {
          dmId: dm1.dmId,
          name: 'jakerenzella, theoang',
        },
      ]
    });

    expect(reqDmList(user2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // OWNER LEAVE
    expect(reqDmLeave(user.token, dm.dmId)).toStrictEqual({});
    // MEMBER LEAVE
    expect(reqDmLeave(user.token, dm1.dmId)).toStrictEqual({});

    // AFTER
    expect(reqDmList(user.token)).toStrictEqual({ dms: [] });

    expect(reqDmList(user1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        },
        {
          dmId: dm1.dmId,
          name: 'jakerenzella, theoang',
        },
      ]
    });

    expect(reqDmList(user2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });
  });
});
