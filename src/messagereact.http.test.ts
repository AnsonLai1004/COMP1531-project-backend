import {
  reqChannelInvite, reqMessagesSearch,
  requestClear, requestChannelsCreateV3, requestAuthRegister,
  reqMessageSend,
  reqSendMessageDm, reqDmCreate,
  reqMessageReact,
  reqMessageUnreact,
  reqDmMessages, reqChannelMessages, reqGetNotification
} from './requests';

beforeEach(() => {
  requestClear();
});
afterEach(() => {
  requestClear();
});

// message/react
describe('message/react/v1', () => {
  test('invalid token', () => {
    expect(reqMessageReact('random token', 1, 1)).toStrictEqual(403);
  });
  test('invalid reactId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqMessageReact(aMember.token, 1, 3)).toStrictEqual(400);
  });
  test('invalid messageId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqMessageReact(aMember.token, 1000, 1)).toStrictEqual(400);
  });
  test('reactId uId already contain the user trying to react', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual(400);
    expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual(400);
  });
  test('success output', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId);
    reqChannelInvite(aMember.token, newchannel.channelId, user2.authUserId);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageReact(user1.token, 2, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({});
    expect(reqMessageReact(user1.token, 1, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({});
    const messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet).toStrictEqual({
      messages: [
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 1,
          reacts: [{
            isThisUserReacted: false,
            reactId: 1,
            uIds: [
              2,
              1,
            ],
          }],
          timeSent: messagesGet.messages[0].timeSent,
          uId: 1,
        },
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 2,
          reacts: [
            {
              isThisUserReacted: false,
              reactId: 1,
              uIds: [
                2,
                1,
              ],
            },
          ],
          timeSent: messagesGet.messages[1].timeSent,
          uId: 2,
        },
      ],
    });
    // isthisuserreacted should return true as the user accessing the messages reacted
    let el = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    let el2 = reqDmMessages(aMember.token, dm.dmId, 0);
    expect(el.messages[0].reacts[0].isThisUserReacted).toStrictEqual(true);
    expect(el2.messages[0].reacts[0].isThisUserReacted).toStrictEqual(true);
    el = reqChannelMessages(user2.token, newchannel.channelId, 0);
    el2 = reqDmMessages(user2.token, dm.dmId, 0);
    // isthisuserreacted should return false as the user accessing the messages reacted
    expect(el.messages[0].reacts[0].isThisUserReacted).toStrictEqual(false);
    expect(el2.messages[0].reacts[0].isThisUserReacted).toStrictEqual(false);
  });
});

// message/unreact
describe('message/unreact/v1', () => {
  test('invalid token', () => {
    expect(reqMessageUnreact('random token', 1, 1)).toStrictEqual(403);
  });
  test('invalid reactId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqMessageUnreact(aMember.token, 1, 3)).toStrictEqual(400);
  });
  test('invalid messageId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(reqMessageUnreact(aMember.token, 1000, 1)).toStrictEqual(400);
  });
  test('reactId uId already contain the user trying to react', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId);
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageUnreact(user1.token, 2, 1)).toStrictEqual(400);
    expect(reqMessageUnreact(user1.token, 1, 1)).toStrictEqual(400);
    expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({});
    expect(reqMessageUnreact(user1.token, 2, 1)).toStrictEqual(400);
    expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({});
    expect(reqMessageUnreact(user1.token, 1, 1)).toStrictEqual(400);
  });
  test('success output', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageReact(user1.token, 2, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({});
    expect(reqMessageReact(user1.token, 1, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({});
    let messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet).toStrictEqual({
      messages: [
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 1,
          reacts: [{
            isThisUserReacted: false,
            reactId: 1,
            uIds: [
              2,
              1,
            ],
          }],
          timeSent: messagesGet.messages[0].timeSent,
          uId: 1,
        },
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 2,
          reacts: [
            {
              isThisUserReacted: false,
              reactId: 1,
              uIds: [
                2,
                1,
              ],
            },
          ],
          timeSent: messagesGet.messages[1].timeSent,
          uId: 2,
        },
      ],
    });
    expect(reqMessageUnreact(user1.token, 2, 1)).toStrictEqual({});
    // isthisuserreacted should return false as the user accessing the messages unreacted
    let el = reqDmMessages(user1.token, dm.dmId, 0);
    expect(el.messages[0].reacts[0].isThisUserReacted).toStrictEqual(false);

    expect(reqMessageUnreact(aMember.token, 2, 1)).toStrictEqual({});
    expect(reqMessageUnreact(user1.token, 1, 1)).toStrictEqual({});
    el = reqChannelMessages(user1.token, newchannel.channelId, 0);
    expect(el.messages[0].reacts[0].isThisUserReacted).toStrictEqual(false);
    expect(reqMessageUnreact(aMember.token, 1, 1)).toStrictEqual({});
    messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet).toStrictEqual({
      messages: [
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 1,
          reacts: [],
          timeSent: messagesGet.messages[0].timeSent,
          uId: 1,
        },
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 2,
          reacts: [],
          timeSent: messagesGet.messages[1].timeSent,
          uId: 2,
        },
      ],
    });
  });
});

// message/react with checking to notifications
describe('message/react/v1 with notifications', () => {
  test('invalid token', () => {
    expect(reqGetNotification('random token')).toStrictEqual(403);
  });
  test('success output', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId);
    reqChannelInvite(aMember.token, newchannel.channelId, user2.authUserId);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqGetNotification(aMember.token)).toStrictEqual({
      notifications: [],
    });
    expect(reqMessageReact(user1.token, 2, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({});
    expect(reqGetNotification(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: 1,
          notificationMessage: 'jakerenzella reacted to your message in alexavery, jakerenzella, theoang',
        },
        {
          channelId: 1,
          dmId: -1,
          notificationMessage: 'jakerenzella added you to crush team"',
        },
      ],
    });
    expect(reqMessageReact(user1.token, 1, 1)).toStrictEqual({});
    expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({});
    const messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet).toStrictEqual({
      messages: [
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 1,
          reacts: [{
            isThisUserReacted: false,
            reactId: 1,
            uIds: [
              2,
              1,
            ],
          }],
          timeSent: messagesGet.messages[0].timeSent,
          uId: 1,
        },
        {
          isPinned: false,
          message: 'Hello World!',
          messageId: 2,
          reacts: [
            {
              isThisUserReacted: false,
              reactId: 1,
              uIds: [
                2,
                1,
              ],
            },
          ],
          timeSent: messagesGet.messages[1].timeSent,
          uId: 2,
        },
      ],
    });
    // isthisuserreacted should return true as the user accessing the messages reacted
    let el = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    let el2 = reqDmMessages(aMember.token, dm.dmId, 0);
    expect(el.messages[0].reacts[0].isThisUserReacted).toStrictEqual(true);
    expect(el2.messages[0].reacts[0].isThisUserReacted).toStrictEqual(true);
    el = reqChannelMessages(user2.token, newchannel.channelId, 0);
    el2 = reqDmMessages(user2.token, dm.dmId, 0);
    // isthisuserreacted should return false as the user accessing the messages reacted
    expect(el.messages[0].reacts[0].isThisUserReacted).toStrictEqual(false);
    expect(el2.messages[0].reacts[0].isThisUserReacted).toStrictEqual(false);
    reqMessageReact(user2.token, 2, 1);
    expect(reqGetNotification(aMember.token)).toStrictEqual({
      notifications: [
        {
          channelId: 1,
          dmId: -1,
          notificationMessage: 'theoang reacted to your message in crush team',
        }
      ],
    });
    expect(reqGetNotification(user1.token)).toStrictEqual({
      notifications: [
        {
          channelId: -1,
          dmId: 1,
          notificationMessage: 'alexavery reacted to your message in alexavery, jakerenzella, theoang',
        },
        {
          channelId: -1,
          dmId: 1,
          notificationMessage: 'jakerenzella reacted to your message in alexavery, jakerenzella, theoang',
        },
        {
          channelId: 1,
          dmId: -1,
          notificationMessage: 'jakerenzella added you to crush team"',
        }
      ],
    });
    for (let i = 0; i < 21; i++) {
      reqMessageUnreact(user2.token, 2, 1);
      reqMessageReact(user2.token, 2, 1);
    }
    for (let i = 0; i < 21; i++) {
      reqMessageUnreact(user1.token, 1, 1);
      reqMessageReact(user1.token, 1, 1);
    }
    expect(reqGetNotification(user1.token).notifications.length).toStrictEqual(20);
    expect(reqGetNotification(aMember.token).notifications.length).toStrictEqual(20);
  });
});
