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
    expect(reqDmCreate(user.body.token, uIds)).toStrictEqual({ error: 'error' });
    expect(reqDmCreate('invalid', [user.body.authUserId])).toStrictEqual({ error: 'error' });
  });
  test('duplicate uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.body.authUserId, user1.body.authUserId];
    expect(reqDmCreate(user.body.token, uIds)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.body.authUserId, user2.body.authUserId];
    const dm = reqDmCreate(user.body.token, uIds);
    expect(reqDmDetails(user2.body.token, dm.dmId)).toMatchObject({
      name: 'alexavery, jakerenzella, theoang',
      members: [
        {
          email: 'theo.ang816@gmail.com',
          handleStr: 'theoang',
          nameFirst: 'Theo',
          nameLast: 'Ang',
          uId: user1.body.authUserId,
        },
        {
          email: 'alex@gmail.com',
          handleStr: 'alexavery',
          nameFirst: 'Alex',
          nameLast: 'Avery',
          uId: user2.body.authUserId,
        },
        {
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          uId: user.body.authUserId,
        },
      ],
    });

    const user3 = requestAuthRegister('bill@gmail.com', 'samplePass', 'Bill', 'Benkins');
    const uIds2 = [user1.body.authUserId];
    const dm2 = reqDmCreate(user3.body.token, uIds2);
    expect(reqDmList(user1.body.token)).toMatchObject({
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
  test('invalid dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqDmDetails(user.body.token, -999)).toStrictEqual({ error: 'error' });
  });
  test('authUserId is invalid or is not a member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.body.authUserId, user2.body.authUserId];
    const dm = reqDmCreate(user.body.token, uIds);
    expect(reqDmDetails(notMember.body.token, dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmDetails('invalid', dm.dmId)).toStrictEqual({ error: 'error' });
  });
  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.body.authUserId, user2.body.authUserId];
    const dm = reqDmCreate(user.body.token, uIds);
    expect(reqDmDetails(user2.body.token, dm.dmId)).toMatchObject({
      name: 'alexavery, jakerenzella, theoang',
      members: [
        {
          email: 'theo.ang816@gmail.com',
          handleStr: 'theoang',
          nameFirst: 'Theo',
          nameLast: 'Ang',
          uId: user1.body.authUserId,
        },
        {
          email: 'alex@gmail.com',
          handleStr: 'alexavery',
          nameFirst: 'Alex',
          nameLast: 'Avery',
          uId: user2.body.authUserId,
        },
        {
          email: 'validemail@gmail.com',
          handleStr: 'jakerenzella',
          nameFirst: 'Jake',
          nameLast: 'Renzella',
          uId: user.body.authUserId,
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

    const uIds = [user1.body.authUserId, user2.body.authUserId];
    const dm = reqDmCreate(user.body.token, uIds);
    const dm1 = reqDmCreate(user1.body.token, []);

    // owner only
    expect(reqDmList(user.body.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // owner and member
    expect(reqDmList(user1.body.token)).toStrictEqual({
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
    expect(reqDmList(user2.body.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // none
    expect(reqDmList(user3.body.token)).toStrictEqual({ dms: [] });
  });
});

describe('dm/remove/v1', () => {
  test('invalid token / dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const dm = reqDmCreate(user.body.token, []);

    expect(reqDmRemove('invalid token', dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmRemove(user.body.token, -1)).toStrictEqual({ error: 'error' });
    expect(reqDmRemove('invalid token', -1)).toStrictEqual({ error: 'error' });
  });

  test('user not owner / member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.body.token, [user1.body.authUserId]);

    expect(reqDmRemove(user2.body.token, dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmRemove(user1.body.token, dm.dmId)).toStrictEqual({ error: 'error' });
  });

  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const dm = reqDmCreate(user.body.token, [user1.body.authUserId]);
    const dm1 = reqDmCreate(user1.body.token, []);

    // BEFORE
    expect(reqDmList(user.body.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'jakerenzella, theoang',
        }
      ]
    });

    expect(reqDmList(user1.body.token)).toStrictEqual({
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

    expect(reqDmRemove(user.body.token, dm.dmId)).toStrictEqual({});

    // AFTER
    expect(reqDmList(user.body.token)).toStrictEqual({ dms: [] });

    expect(reqDmList(user1.body.token)).toStrictEqual({
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
    const dm = reqDmCreate(user.body.token, []);

    expect(reqDmLeave('invalid token', dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmLeave(user.body.token, -1)).toStrictEqual({ error: 'error' });
    expect(reqDmLeave('invalid token', -1)).toStrictEqual({ error: 'error' });
  });

  test('user not member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.body.token, [user1.body.authUserId]);

    expect(reqDmLeave(user2.body.token, dm.dmId)).toStrictEqual({ error: 'error' });
    expect(reqDmLeave(user1.body.token, -1)).toStrictEqual({ error: 'error' });
  });

  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');

    const uIds = [user1.body.authUserId, user2.body.authUserId];
    const dm = reqDmCreate(user.body.token, uIds);
    const dm1 = reqDmCreate(user1.body.token, [user.body.authUserId]);

    // BEFORE
    expect(reqDmList(user.body.token)).toStrictEqual({
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

    expect(reqDmList(user1.body.token)).toStrictEqual({
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

    expect(reqDmList(user2.body.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // OWNER LEAVE
    expect(reqDmLeave(user.body.token, dm.dmId)).toStrictEqual({});
    // MEMBER LEAVE
    expect(reqDmLeave(user.body.token, dm1.dmId)).toStrictEqual({});

    // AFTER
    expect(reqDmList(user.body.token)).toStrictEqual({ dms: [] });

    expect(reqDmList(user1.body.token)).toStrictEqual({
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

    expect(reqDmList(user2.body.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });
  });
});
