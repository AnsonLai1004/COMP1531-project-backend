import { reqDmListV3, reqDmRemoveV3, reqDmLeaveV3, reqDmDetails, reqDmCreate, requestClear, requestAuthRegister } from './requests';

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
    expect(reqDmCreate(user.token, uIds)).toStrictEqual(403);
    expect(reqDmCreate('invalid', [user.authUserId])).toStrictEqual(400);
  });
  test('duplicate uId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId, user1.authUserId];
    expect(reqDmCreate(user.token, uIds)).toStrictEqual(400);
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
    expect(reqDmListV3(user1.token)).toMatchObject({
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
    // const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqDmDetails('invalid', -999)).toStrictEqual(400);
  });
  test('invalid dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqDmDetails(user.token, -999)).toStrictEqual(400);
  });
  test('authUserId is invalid or is not a member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = requestAuthRegister('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    expect(reqDmDetails(notMember.token, dm.dmId)).toStrictEqual(403);
    expect(reqDmDetails('invalid', dm.dmId)).toStrictEqual(400);
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

describe('dm/list/v2', () => {
  test('invalid token', () => {
    const invalid = reqDmListV3('invalid token');
    expect(invalid).toStrictEqual(400);
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
    const list = reqDmListV3(user.token);
    expect(list).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // owner and member
    const list1 = reqDmListV3(user1.token);
    expect(list1).toStrictEqual({
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
    const list2 = reqDmListV3(user2.token);
    expect(list2).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // none
    const list3 = reqDmListV3(user3.token);
    expect(list3).toStrictEqual({ dms: [] });
  });
});

describe('dm/remove/v2', () => {
  test('invalid token / dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const dm = reqDmCreate(user.token, []);

    let invalid = reqDmRemoveV3('invalid token', dm.dmId);
    expect(invalid).toStrictEqual(400);

    invalid = reqDmRemoveV3(user.token, -1);
    expect(invalid).toStrictEqual(400);
  });

  test('user not owner / member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.token, [user1.authUserId]);

    let invalid = reqDmRemoveV3(user2.token, dm.dmId);
    expect(invalid).toStrictEqual(403);

    invalid = reqDmRemoveV3(user1.token, dm.dmId);
    expect(invalid).toStrictEqual(403);
  });

  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const dm = reqDmCreate(user.token, [user1.authUserId]);
    const dm1 = reqDmCreate(user1.token, []);

    // BEFORE
    expect(reqDmListV3(user.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'jakerenzella, theoang',
        }
      ]
    });

    expect(reqDmListV3(user1.token)).toStrictEqual({
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

    const remove = reqDmRemoveV3(user.token, dm.dmId);
    expect(remove).toStrictEqual({});

    // AFTER
    expect(reqDmListV3(user.token)).toStrictEqual({ dms: [] });

    expect(reqDmListV3(user1.token)).toStrictEqual({
      dms: [
        {
          dmId: dm1.dmId,
          name: 'theoang',
        },
      ]
    });
  });
});

describe('dm/leave/v2', () => {
  test('invalid token + dmId', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const dm = reqDmCreate(user.token, []);

    expect(reqDmLeaveV3('invalid token', dm.dmId)).toStrictEqual(400);
    expect(reqDmLeaveV3(user.token, -1)).toStrictEqual(400);
    expect(reqDmLeaveV3('invalid token', -1)).toStrictEqual(400);
  });

  test('user not member of DM', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.token, [user1.authUserId]);
    expect(reqDmLeaveV3(user2.token, dm.dmId)).toStrictEqual(403);
    expect(reqDmLeaveV3(user1.token, -1)).toStrictEqual(400);
  });

  test('correct return', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');

    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm1 = reqDmCreate(user1.token, [user.authUserId]);

    // BEFORE
    expect(reqDmListV3(user.token)).toStrictEqual({
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

    expect(reqDmListV3(user1.token)).toStrictEqual({
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

    expect(reqDmListV3(user2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });

    // OWNER LEAVE
    expect(reqDmLeaveV3(user.token, dm.dmId)).toStrictEqual({});
    // MEMBER LEAVE
    expect(reqDmLeaveV3(user.token, dm1.dmId)).toStrictEqual({});

    // AFTER
    expect(reqDmListV3(user.token)).toStrictEqual({ dms: [] });

    expect(reqDmListV3(user1.token)).toStrictEqual({
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

    expect(reqDmListV3(user2.token)).toStrictEqual({
      dms: [
        {
          dmId: dm.dmId,
          name: 'alexavery, jakerenzella, theoang',
        }
      ]
    });
  });
});
