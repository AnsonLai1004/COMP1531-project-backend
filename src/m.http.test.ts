import {
  requestClear, requestAuthRegister, requestChannelsCreate, reqDmCreate, reqMessageSend, reqMessageShare
  , reqChannelJoin, reqChannelMessages, reqSendMessageDm, reqDmMessages
} from './requests';
beforeEach(() => {
  requestClear();
});
// message/share/v1
describe('message/share/v1', () => {
  test('Invalid cases', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const channel = requestChannelsCreate(user.token, 'crush team', true);
    const channel2 = requestChannelsCreate(user2.token, 'team', true);
    const dm = reqDmCreate(user.token, [user1.authUserId]);
    const message = reqMessageSend(user.token, channel.channelId, 'Hello World!');
    expect(message).toStrictEqual({ messageId: 1 });
    expect(reqMessageShare(user.token, message.messageId, '1', -999, -1)).toStrictEqual(400);
    expect(reqMessageShare(user.token, message.messageId, '2', -1, -999)).toStrictEqual(400);
    expect(reqMessageShare(user.token, message.messageId, '3', channel.channelId, dm.dmId)).toStrictEqual(400);
    expect(reqMessageShare(user.token, -999, '4', channel.channelId, -1)).toStrictEqual(400);
    // user1 not in channel
    // expect(reqMessageShare(user1.token, message.messageId,'5', -1, dm.dmId)).toStrictEqual(400);
    expect(reqMessageShare(user.token, message.messageId, '6'.repeat(1001), -1, dm.dmId)).toStrictEqual(400);

    expect(reqMessageShare(user.token, message.messageId, '7', channel2.channelId, -1)).toStrictEqual(403);
    expect(reqMessageShare('Invalid', message.messageId, '8', channel.channelId, -1)).toStrictEqual(403);
  });

  test('share message to a channel', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    // const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const channel = requestChannelsCreate(user.token, 'crush team', true);
    const channel2 = requestChannelsCreate(user2.token, 'team', true);
    const message = reqMessageSend(user.token, channel.channelId, 'abc');
    expect(reqChannelJoin(user.token, channel2.channelId));
    expect(reqMessageShare(user.token, message.messageId, 'abc', channel2.channelId, -1)).toStrictEqual({ sharedMessageId: 2 });
    const channelmessages = reqChannelMessages(user.token, channel2.channelId, 0);
    expect(channelmessages.messages[0].message).toStrictEqual('abcabc');
  });
  test('share message to a dm', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const dm = reqDmCreate(user.token, [user1.authUserId]);
    const dm2 = reqDmCreate(user.token, [user1.authUserId, user2.authUserId]);
    expect(reqSendMessageDm(user.token, dm.dmId, 'abc')).toStrictEqual({ messageId: 1 });
    expect(reqMessageShare(user.token, 1, 'abc', -1, dm2.dmId)).toStrictEqual({ sharedMessageId: 2 });
    const dmMessages = reqDmMessages(user.token, dm2.dmId, 0);
    expect(dmMessages.messages[0].message).toStrictEqual('abcabc');
  });
});
