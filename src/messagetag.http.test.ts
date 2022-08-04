import {
  reqChannelInvite,
  requestClear, requestChannelsCreateV3, requestAuthRegister,
  reqMessageSend,
  reqSendMessageDm, reqDmCreate,
  reqGetNotification,
  reqMessageEdit
} from './requests';

beforeEach(() => {
  requestClear();
});
afterAll(() => {
  requestClear();
});

describe('invalid tags', () => {
  test.each([
    { message: '@harry potter with space' },
    { message: '@harrypotteralphanumericafter' },
    { message: '@HARRYPOTTER' },
    { message: 'harrypotter' },
    { message: '@harrypotter1' },
  ])('$message', ({ message }) => {
    const user1 = requestAuthRegister('email@email.com', 'password', 'Sherlock', 'Holmes');
    const user2 = requestAuthRegister('mail@email.com', 'password', 'Harry', 'Potter');
    const channel = requestChannelsCreateV3(user1.token, 'Gryffindor Common', true);
    const dm = reqDmCreate(user1.token, [user2.authUserId]);
    reqMessageSend(user1.token, channel.channelId, message);
    reqSendMessageDm(user1.token, dm.dmId, message);
    expect(reqGetNotification(user2.token)).toEqual({
      notifications: [
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'sherlockholmes added you to harrypotter, sherlockholmes' }
      ]
    });
  });
  test('not in channel or dm', () => {
    const user1 = requestAuthRegister('email@email.com', 'password', 'Sherlock', 'Holmes');
    const user2 = requestAuthRegister('diff@email.com', 'password', 'John', 'Watson');
    const user3 = requestAuthRegister('mail@email.com', 'password', 'Harry', 'Potter');
    const channel = requestChannelsCreateV3(user1.token, '221B Baker St', true);
    reqChannelInvite(user1.token, channel.channelId, user2.authUserId);
    const dm = reqDmCreate(user1.token, [user2.authUserId]);
    reqMessageSend(user1.token, channel.channelId, '@harrypotter');
    reqSendMessageDm(user1.token, dm.dmId, '@harrypotter');
    expect(reqGetNotification(user3.token)).toEqual({
      notifications: []
    });
  });
});

describe('valid single tagging', () => {
  test.each([
    { message: '@harrypotter', notificationMessage: '@harrypotter' },
    { message: '@harrypotter is a wizard', notificationMessage: '@harrypotter is a wi' },
    { message: 'Go @harrypotter!', notificationMessage: 'Go @harrypotter!' },
    { message: '@harrypotter@sherlockholmes', notificationMessage: '@harrypotter@sherloc' },
    { message: '@harrypotter @harrypotter', notificationMessage: '@harrypotter @harryp' },
  ])('$message', ({ message, notificationMessage }) => {
    const user1 = requestAuthRegister('email@email.com', 'password', 'Sherlock', 'Holmes');
    const user2 = requestAuthRegister('mail@email.com', 'password', 'Harry', 'Potter');
    const channel = requestChannelsCreateV3(user1.token, 'Gryffindor Common', true);
    reqChannelInvite(user1.token, channel.channelId, user2.authUserId);
    const dm = reqDmCreate(user1.token, [user2.authUserId]);
    reqMessageSend(user1.token, channel.channelId, message);
    reqSendMessageDm(user1.token, dm.dmId, message);
    expect(reqGetNotification(user2.token)).toEqual({
      notifications: [
        { channelId: -1, dmId: dm.dmId, notificationMessage: `sherlockholmes tagged you in harrypotter, sherlockholmes: ${notificationMessage}` },
        { channelId: channel.channelId, dmId: -1, notificationMessage: `sherlockholmes tagged you in Gryffindor Common: ${notificationMessage}` },
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'sherlockholmes added you to harrypotter, sherlockholmes' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'sherlockholmes added you to Gryffindor Common' },
      ]
    });
  });
  test('can tag self', () => {
    const user1 = requestAuthRegister('email@email.com', 'password', 'Sherlock', 'Holmes');
    const user2 = requestAuthRegister('diff@email.com', 'password', 'John', 'Watson');
    const channel = requestChannelsCreateV3(user1.token, '221B Baker St', true);
    reqChannelInvite(user1.token, channel.channelId, user2.authUserId);
    const dm = reqDmCreate(user1.token, [user2.authUserId]);
    reqMessageSend(user1.token, channel.channelId, '@sherlockholmes');
    reqSendMessageDm(user1.token, dm.dmId, '@sherlockholmes');
    expect(reqGetNotification(user1.token)).toEqual({
      notifications: [
        { channelId: -1, dmId: dm.dmId, notificationMessage: `sherlockholmes tagged you in johnwatson, sherlockholmes: @sherlockholmes` },
        { channelId: channel.channelId, dmId: -1, notificationMessage: `sherlockholmes tagged you in 221B Baker St: @sherlockholmes` },
      ]
    });
  });
  test('edit to tag, edit does not remove notif', () => {
    const user1 = requestAuthRegister('email@email.com', 'password', 'Sherlock', 'Holmes');
    const user2 = requestAuthRegister('diff@email.com', 'password', 'John', 'Watson');
    const channel = requestChannelsCreateV3(user1.token, '221B Baker St', true);
    reqChannelInvite(user1.token, channel.channelId, user2.authUserId);
    const dm = reqDmCreate(user1.token, [user2.authUserId]);
    const message = reqMessageSend(user1.token, channel.channelId, 'john i\'m home');
    const messageDm = reqSendMessageDm(user1.token, dm.dmId, 'john come downstairs');

    reqMessageEdit(user1.token, message.messageId, "@johnwatson i'm home");
    reqMessageEdit(user1.token, messageDm.messageId, "@johnwatson come downstairs");

    expect(reqGetNotification(user2.token)).toEqual({
      notifications: [
        { channelId: -1, dmId: dm.dmId, notificationMessage: `sherlockholmes tagged you in johnwatson, sherlockholmes: @johnwatson come dow` },
        { channelId: channel.channelId, dmId: -1, notificationMessage: `sherlockholmes tagged you in 221B Baker St: @johnwatson i'm home` },
        { channelId: -1, dmId: dm.dmId, notificationMessage: 'sherlockholmes added you to johnwatson, sherlockholmes' },
        { channelId: channel.channelId, dmId: -1, notificationMessage: 'sherlockholmes added you to 221B Baker St' },
      ]
    });

    reqMessageEdit(user1.token, message.messageId, "fine i won't ping you");
    reqMessageEdit(user1.token, messageDm.messageId, "but hurry up already will you");

    expect(reqGetNotification(user2.token)).toEqual({
        notifications: [
          { channelId: -1, dmId: dm.dmId, notificationMessage: `sherlockholmes tagged you in johnwatson, sherlockholmes: @johnwatson come dow` },
          { channelId: channel.channelId, dmId: -1, notificationMessage: `sherlockholmes tagged you in 221B Baker St: @johnwatson i'm home` },
          { channelId: -1, dmId: dm.dmId, notificationMessage: 'sherlockholmes added you to johnwatson, sherlockholmes' },
          { channelId: channel.channelId, dmId: -1, notificationMessage: 'sherlockholmes added you to 221B Baker St' },
        ]
    });
  });
  // more tests...
  // tag in sendlater and sendlater dm
  // message editing
  // message sharing
  // truncate message at 20 chars
});
