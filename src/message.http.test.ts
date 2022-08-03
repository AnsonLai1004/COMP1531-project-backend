import {
  reqChannelInvite, reqMessagesSearch,
  requestClear, requestChannelsCreateV3, requestAuthRegister,
  reqChannelMessages, reqMessageSend, reqMessageEdit,
  reqMessageRemove, reqSendMessageDm, reqDmMessages, reqDmCreate,
  reqMessageSendLater, reqMessageSendLaterDM, reqMessagePin, reqMessageUnpin
} from './requests';

function sleep(s: number) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

beforeEach(() => {
  requestClear();
});
afterEach(() => {
  requestClear();
});

// message/send/v1
describe('message/send/v2', () => {
  test('Invalid tokenId', () => {
    expect(reqMessageSend('asdasdas', -999, 'any string message')).toStrictEqual(403);
  });
  test('Error case for invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const invalid = reqMessageSend(aMember.token, -999, 'any string message');
    expect(invalid).toStrictEqual(400);
  });
  test('Error case for length message empty or more than 1000 in length', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    let invalid = reqMessageSend(aMember.token, newchannel.channelId, '');
    expect(invalid).toStrictEqual(400);
    invalid = reqMessageSend(aMember.token, newchannel.channelId, 'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
    'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
    '2OScLJrg9ykkjmJf3bywy4YWmVqQihxyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
    'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
    'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
    'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
    '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha');
    expect(invalid).toStrictEqual(400);
  });
  test('Error case where user is not authorized in channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const invalid = reqMessageSend(notMember.token, newchannel.channelId, 'Hello World!');
    expect(invalid).toStrictEqual(403);
  });
  // success input output for messagesend
  test('Valid arguments, output success', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    const channelmessages = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    expect(channelmessages.messages[0].uId).toStrictEqual(1);
    expect(channelmessages.messages[0].message).toStrictEqual('Hello World!');
  });
  test('Valid arguments, output success, multiple message, different channels', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);

    // messages are ordered in order from most recent message to oldest
    // first channel, first message
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    const channelmessages = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    expect(channelmessages.messages[0].messageId).toStrictEqual(1);
    expect(channelmessages.messages[0].message).toStrictEqual('Hello World!');
    // second channel, second message
    expect(reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World second!')).toStrictEqual({ messageId: 2 });
    const channelmessages2 = reqChannelMessages(aMember.token, newchannel2.channelId, 0);
    expect(channelmessages2.messages[0].messageId).toStrictEqual(2);
    expect(channelmessages2.messages[0].message).toStrictEqual('Hello World second!');
    // first channel, third message
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World third!')).toStrictEqual({ messageId: 3 });
    const channelmessages3 = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    expect(channelmessages3.messages[0].messageId).toStrictEqual(3);
    expect(channelmessages3.messages[0].message).toStrictEqual('Hello World third!');
    // second channel, fourth message
    expect(reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World second!')).toStrictEqual({ messageId: 4 });
    const channelmessages4 = reqChannelMessages(aMember.token, newchannel2.channelId, 0);
    expect(channelmessages4.messages[0].messageId).toStrictEqual(4);
    expect(channelmessages4.messages[0].message).toStrictEqual('Hello World second!');
  });
});

// message/edit/v1
describe('message/edit/v2', () => {
  test('Invalid tokenId', () => {
    expect(reqMessageEdit('asdasdas', 1, 'any string message')).toStrictEqual(403);
  });
  test('length of message greater than 1000', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageEdit(aMember.token, 1, 'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
    'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
    '2OScLJrg9ykkjmJf3bywy4YWmVqQihxyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
    'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
    'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
    'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
    '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha');
    expect(invalid).toStrictEqual(400);
  });
  test('messageId invalid', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageEdit(aMember.token, 2, 'DS3ho21uGIVZpqsCqDUv879zypAt');
    expect(invalid).toStrictEqual(400);
  });
  test('Person doesnt have owner permissions', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const notowner = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
    reqChannelInvite(aMember.token, newchannel.channelId, notowner.authUserId);
    reqMessageSend(notowner.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageEdit(notowner.token, 1, 'DS3ho21uGIVZpqsCqDUv879zypAt');
    expect(invalid).toStrictEqual(403);
  });
  test('person not the sender of the message', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const notUser = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
    // add notUser to channel and send message
    reqChannelInvite(aMember.token, newchannel.channelId, notUser.authUserId);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageEdit(notUser.token, 1, 'DS3ho21uGIVZpqsCqDUv879zypAt');
    expect(invalid).toStrictEqual(403);
  });
  // error in dm
  test('Person doesnt have owner permissions', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqSendMessageDm(user1.token, dm.dmId, 'Hello World!');
    const invalid = reqMessageEdit(user1.token, 1, 'DS3ho21uGIVZpqsCqDUv879zypAt');
    expect(invalid).toStrictEqual(403);
  });
  test('person not the sender of the message', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqSendMessageDm(user.token, dm.dmId, 'Hello World!');
    const invalid = reqMessageEdit(user1.token, 1, 'DS3ho21uGIVZpqsCqDUv879zypAt');
    expect(invalid).toStrictEqual(403);
  });
  // success edit
  test('edit single message from owner', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    expect(reqMessageEdit(aMember.token, 1, 'DS3ho21uGIVZpqsCqDUv879zypAt')).toStrictEqual({});
  });
  test('edit single message from owner, where new message is empty', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    expect(reqMessageEdit(aMember.token, 1, '')).toStrictEqual({});
  });
  test('edit multiple message from multiple channels', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World2!');
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World3!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World4!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World5!');
    expect(reqMessageEdit(aMember.token, 4, 'edit 1')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 1, 'edit 2')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 3, 'edit 3')).toStrictEqual({});
  });
  test('edit multiple message from different channels, where new message is empty', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World2!');
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World3!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World4!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World5!');
    expect(reqMessageEdit(aMember.token, 4, '')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 1, '')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 3, '')).toStrictEqual({});
  });
});

// message/remove/v1
describe('message/remove/v2', () => {
  test('Invalid tokenId', () => {
    expect(reqMessageRemove('asdasdas', 1)).toStrictEqual(403);
  });
  test('messageId invalid', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageRemove(aMember.token, 2);
    expect(invalid).toStrictEqual(400);
  });
  test('Person doesnt have owner permissions', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const notowner = requestAuthRegister('asd@gmail.com', '123abc!asd@#', 'Jak', 'asd');
    reqChannelInvite(aMember.token, newchannel.channelId, notowner.authUserId);
    reqMessageSend(notowner.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageRemove(notowner.token, 1);
    expect(invalid).toStrictEqual(403);
  });
  test('person not the sender of the message in channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const notUser = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
    // add notUser to channel and send message
    reqChannelInvite(aMember.token, newchannel.channelId, notUser.authUserId);
    reqMessageSend(notUser.token, newchannel.channelId, 'Hello World!');
    const invalid = reqMessageRemove(aMember.token, 1);
    expect(invalid).toStrictEqual(403);
  });
  // test in dm
  test('Person doesnt have owner permissions in dm', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqSendMessageDm(user1.token, dm.dmId, 'Hello World!');
    const invalid = reqMessageRemove(user1.token, 1);
    expect(invalid).toStrictEqual(403);
  });
  test('person not the sender of the message', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    // add notUser to channel and send message
    reqSendMessageDm(user1.token, dm.dmId, 'Hello World!');
    const invalid = reqMessageRemove(user.token, 1);
    expect(invalid).toStrictEqual(403);
  });
  // success edit
  test('remove single message from owner', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    expect(reqMessageRemove(aMember.token, 1)).toStrictEqual({});
  });
  test('remove multiple message from multiple channels', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World2!');
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World3!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World4!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World5!');
    expect(reqMessageRemove(aMember.token, 4)).toStrictEqual({});
    expect(reqMessageRemove(aMember.token, 1)).toStrictEqual({});
    expect(reqMessageRemove(aMember.token, 3)).toStrictEqual({});
  });
});

describe('/message/senddm/v2', () => {
  test('Invalid tokenId', () => {
    expect(reqSendMessageDm('asdasdas', 1, 'any string message')).toStrictEqual(403);
  });
  test('Error case for invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const invalid = reqSendMessageDm(aMember.token, -999, 'any string message');
    expect(invalid).toStrictEqual(400);
  });
  test('Error case for length message empty or more than 1000 in length', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    let invalid = reqSendMessageDm(user.token, dm.dmId, '');
    expect(invalid).toStrictEqual(400);
    invalid = reqSendMessageDm(user.token, dm.dmId, 'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
    'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
    '2OScLJrg9ykkjmJf3bywy4YWmVqQihxasdyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
    'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
    'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
    'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
    '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHsKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha');
    expect(invalid).toStrictEqual(400);
  });
  test('Error case where user is not authorized in channel', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const invalid = reqSendMessageDm(user2.token, dm.dmId, 'Hello World!');
    expect(invalid).toStrictEqual(403);
  });
  // success input output for messagesend
  test('Valid arguments, output success', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    const dmMessages = reqDmMessages(user.token, dm.dmId, 0);
    expect(dmMessages.messages[0].uId).toStrictEqual(1);
    expect(dmMessages.messages[0].message).toStrictEqual('Hello World!');
  });
  test('Valid arguments, output success, multiple message, different channels', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm2 = reqDmCreate(user.token, uIds2);
    // first dm, first message
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    const dmMessages = reqDmMessages(user.token, dm.dmId, 0);
    expect(dmMessages.messages[0].messageId).toStrictEqual(1);
    expect(dmMessages.messages[0].message).toStrictEqual('Hello World!');
    // first dm, second message
    expect(reqSendMessageDm(user2.token, dm.dmId, 'Hello World second!')).toStrictEqual({ messageId: 2 });
    const dmMessages2 = reqDmMessages(user1.token, dm.dmId, 0);
    expect(dmMessages2.messages[0].messageId).toStrictEqual(2);
    expect(dmMessages2.messages[0].message).toStrictEqual('Hello World second!');
    // first dm, third message
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World third!')).toStrictEqual({ messageId: 3 });
    const dmMessages3 = reqDmMessages(user.token, dm.dmId, 0);
    expect(dmMessages3.messages[0].messageId).toStrictEqual(3);
    expect(dmMessages3.messages[0].message).toStrictEqual('Hello World third!');
    // first dm, fourth message
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World second!')).toStrictEqual({ messageId: 4 });
    const dmMessages4 = reqDmMessages(user.token, dm.dmId, 0);
    expect(dmMessages4.messages[0].messageId).toStrictEqual(4);
    expect(dmMessages4.messages[0].message).toStrictEqual('Hello World second!');
    // second dm, fourth message
    expect(reqSendMessageDm(user1.token, dm2.dmId, 'Hello World second!')).toStrictEqual({ messageId: 5 });
    const dmMessages5 = reqDmMessages(user.token, dm2.dmId, 0);
    expect(dmMessages5.messages[0].messageId).toStrictEqual(5);
    expect(dmMessages5.messages[0].message).toStrictEqual('Hello World second!');
  });
});

// message/edit/v1 success test on dm and channels
describe('message/edit/v2 on dm and channels', () => {
  test('remove multiple message from multiple channels', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const user = requestAuthRegister('b@gmail.com', '123abc!@#', 'c', 'd');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm2 = reqDmCreate(user.token, uIds2);

    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World2!');
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World3!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World4!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World5!');
    reqSendMessageDm(user.token, dm.dmId, 'Hello World in dm!');
    reqSendMessageDm(user1.token, dm.dmId, 'Hello World2 in dm!');
    reqSendMessageDm(user.token, dm2.dmId, 'Hello World3! in dm');
    expect(reqMessageEdit(user.token, 8, 'edit on dm')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 4, 'edit 1')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 1, 'edit 2')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 3, 'edit 3')).toStrictEqual({});
  });

  test('remove multiple message from different channels, where new message is empty', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm2 = reqDmCreate(user.token, uIds2);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World2!');
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World3!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World4!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World5!');
    reqSendMessageDm(user.token, dm.dmId, 'Hello World in dm!');
    reqSendMessageDm(user1.token, dm.dmId, 'Hello World2 in dm!');
    reqSendMessageDm(user.token, dm2.dmId, 'Hello World3! in dm');
    expect(reqMessageEdit(user.token, 8, '')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 4, '')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 1, '')).toStrictEqual({});
    expect(reqMessageEdit(aMember.token, 3, '')).toStrictEqual({});
  });
});

// message/remove/v1 test on dm and channels
describe('message/remove/v2 on dm and channels', () => {
  test('edit multiple message from multiple channels', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm2 = reqDmCreate(user1.token, uIds2);
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World2!');
    reqMessageSend(aMember.token, newchannel.channelId, 'Hello World3!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World4!');
    reqMessageSend(aMember.token, newchannel2.channelId, 'Hello World5!');
    reqSendMessageDm(user.token, dm.dmId, 'Hello World in dm!');
    reqSendMessageDm(user1.token, dm2.dmId, 'Hello World2 in dm!');
    reqSendMessageDm(user.token, dm2.dmId, 'Hello World3! in dm');
    expect(reqMessageRemove(user1.token, 7)).toStrictEqual({});
    expect(reqMessageRemove(user.token, 6)).toStrictEqual({});
    expect(reqMessageRemove(aMember.token, 1)).toStrictEqual({});
    expect(reqMessageRemove(aMember.token, 3)).toStrictEqual({});
  });
});

describe('search/v1 test', () => {
  test('invalid tokenid', () => {
    expect(reqMessagesSearch('random token', 'any string')).toStrictEqual(403);
  });
  test('invalid queryStr less than 1 or more than 1000', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    let invalid = reqMessagesSearch(user.token, '');
    expect(invalid).toStrictEqual(400);
    invalid = reqMessagesSearch(user.token, 'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
    'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
    '2OScLJrg9ykkjmJf3bywy4YWmVqQihxasdyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
    'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
    'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
    'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
    '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHsKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha');
    expect(invalid).toStrictEqual(400);
  });
  test('success return for single text that match', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    const obtainMessage = reqMessagesSearch(aMember.token, 'world');
    expect(obtainMessage.messages[0].message).toStrictEqual('Hello World!');
  });
  test('success multiple messages returned', () => {
    // channel
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    // dm
    const getmessage = reqMessagesSearch(aMember.token, 'world');
    expect(getmessage.messages[0].message).toStrictEqual('Hello World!');
    const user = requestAuthRegister('randomemail@gmail.com', '123abc!@#', 'new', 'guy');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId, aMember.authUserId];
    const uIds2 = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm2 = reqDmCreate(user.token, uIds2);
    const newchannel2 = requestChannelsCreateV3(user.token, ' new team', true);
    expect(reqSendMessageDm(aMember.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessageSend(user.token, newchannel2.channelId, 'Hello World!')).toStrictEqual({ messageId: 7 });
    expect(reqSendMessageDm(user.token, dm2.dmId, 'Hello World!')).toStrictEqual({ messageId: 8 });
    expect(reqSendMessageDm(user.token, dm2.dmId, 'Hello !')).toStrictEqual({ messageId: 9 });
    expect(reqMessageSend(user.token, newchannel2.channelId, 'Hello World!')).toStrictEqual({ messageId: 10 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello!')).toStrictEqual({ messageId: 11 });
    const messagesGet = reqMessagesSearch(aMember.token, 'world');
    expect(messagesGet.messages[0].message).toStrictEqual('Hello World!');
    expect(messagesGet.messages[1].message).toStrictEqual('Hello World3!');
    expect(messagesGet.messages[2].message).toStrictEqual('Hello World2!');
    expect(messagesGet.messages[3].message).toStrictEqual('Hello World!');
  });
});

// message/sendlater/v1
describe('message/sendlater/v1', () => {
  test('Invalid tokenId', () => {
    expect(reqMessageSendLater('asdasdas', -999, 'any string message', 2659505371)).toStrictEqual(403);
  });
  test('Error case for invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const invalid = reqMessageSendLater(aMember.token, -999, 'any string message', 2659505371);
    expect(invalid).toStrictEqual(400);
  });
  test('Error case for length message empty or more than 1000 in length', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    let invalid = reqMessageSendLater(aMember.token, newchannel.channelId, '', 2659505371);
    expect(invalid).toStrictEqual(400);
    invalid = reqMessageSendLater(aMember.token, newchannel.channelId, 'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
    'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
    '2OScLJrg9ykkjmJf3bywy4YWmVqQihxyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
    'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
    'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
    'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
    '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha', 2659505371);
    expect(invalid).toStrictEqual(400);
  });
  test('Error case for past time sent', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const invalid = reqMessageSendLater(aMember.token, newchannel.channelId, 'Hello World', 1659505371);
    expect(invalid).toStrictEqual(400);
  });
  test('Error case where user is not authorized in channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const invalid = reqMessageSendLater(notMember.token, newchannel.channelId, 'Hello World!', 2659505371);
    expect(invalid).toStrictEqual(403);
  });
  // success input output for messagesend
  test('Valid arguments, output success', async () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const curTime = Math.floor((new Date()).getTime() / 1000);
    expect(reqMessageSendLater(aMember.token, newchannel.channelId, 'Hello World!', curTime + 3)).toStrictEqual({ messageId: 1 });
    let channelmessages = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    // check still empty
    expect(channelmessages.messages.length).toStrictEqual(0);
    // wait for message to send;
    await sleep(3.3);
    channelmessages = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    expect(channelmessages.messages[0].uId).toStrictEqual(1);
    expect(channelmessages.messages[0].message).toStrictEqual('Hello World!');
  });
  test('Valid arguments, output success, multiple message, different channels', async () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const newchannel2 = requestChannelsCreateV3(aMember.token, 'crush team', true);
    const curTime = Math.floor((new Date()).getTime() / 1000);

    // messages are ordered in order from most recent message to oldest
    // first channel, first message, slowest in channel
    expect(reqMessageSendLater(aMember.token, newchannel.channelId, 'Hello World!', curTime + 3)).toStrictEqual({ messageId: 1 });
    // second channel, second message, same time in channel
    expect(reqMessageSendLater(aMember.token, newchannel2.channelId, 'Hello World!', curTime + 2)).toStrictEqual({ messageId: 2 });
    // first channel, third message, fastest in channel
    expect(reqMessageSendLater(aMember.token, newchannel.channelId, 'Hello World second!', curTime + 2)).toStrictEqual({ messageId: 3 });
    // second channel, fourth message, same time in channel
    expect(reqMessageSendLater(aMember.token, newchannel2.channelId, 'Hello World second!', curTime + 2)).toStrictEqual({ messageId: 4 });

    await sleep(3.3);
    const channelmessages1 = reqChannelMessages(aMember.token, newchannel.channelId, 0);
    const channelmessages2 = reqChannelMessages(aMember.token, newchannel2.channelId, 0);

    expect(channelmessages1.messages[0].messageId).toStrictEqual(1);
    expect(channelmessages1.messages[0].message).toStrictEqual('Hello World!');
    expect(channelmessages1.messages[1].messageId).toStrictEqual(3);
    expect(channelmessages1.messages[1].message).toStrictEqual('Hello World second!');

    expect(channelmessages2.messages[0].messageId).toStrictEqual(4);
    expect(channelmessages2.messages[0].message).toStrictEqual('Hello World second!');
    expect(channelmessages2.messages[1].messageId).toStrictEqual(2);
    expect(channelmessages2.messages[1].message).toStrictEqual('Hello World!');
  });
});

// message/sendlaterdm/v1
describe('/message/sendlaterdm/v1', () => {
  test('Invalid tokenId', () => {
    expect(reqMessageSendLaterDM('asdasdas', 1, 'any string message', 2659505371)).toStrictEqual(403);
  });
  test('Error case for invalid channelId', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const invalid = reqMessageSendLaterDM(aMember.token, -999, 'any string message', 2659505371);
    expect(invalid).toStrictEqual(400);
  });
  test('Error case for length message empty or more than 1000 in length', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    let invalid = reqMessageSendLaterDM(user.token, dm.dmId, '', 2659505371);
    expect(invalid).toStrictEqual(400);
    invalid = reqMessageSendLaterDM(user.token, dm.dmId, 'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
    'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
    '2OScLJrg9ykkjmJf3bywy4YWmVqQihxasdyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
    'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
    'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
    'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
    '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHsKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha', 2659505371);
    expect(invalid).toStrictEqual(400);
  });
  test('Error case for past time sent', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const invalid = reqMessageSendLaterDM(aMember.token, dm.dmId, 'Hello World', 1659505371);
    expect(invalid).toStrictEqual(400);
  });
  test('Error case where user is not authorized in dm', () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const invalid = reqMessageSendLaterDM(user2.token, dm.dmId, 'Hello World!', 2659505371);
    expect(invalid).toStrictEqual(403);
  });
  // success input output for messagesend
  test('Valid arguments, output success', async () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const curTime = Math.floor((new Date()).getTime() / 1000);

    expect(reqMessageSendLaterDM(user.token, dm.dmId, 'Hello World!', curTime + 2)).toStrictEqual({ messageId: 1 });
    // check empty first
    let dmMessages = reqDmMessages(user.token, dm.dmId, 0);
    expect(dmMessages.messages.length).toStrictEqual(0);

    await sleep(3.3);
    dmMessages = reqDmMessages(user.token, dm.dmId, 0);
    expect(dmMessages.messages[0].uId).toStrictEqual(1);
    expect(dmMessages.messages[0].message).toStrictEqual('Hello World!');
  });
  test('Valid arguments, output success, multiple message, different channels', async () => {
    const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user1.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    const dm2 = reqDmCreate(user.token, uIds2);
    const curTime = Math.floor((new Date()).getTime() / 1000);

    // messages are ordered in order from most recent message to oldest
    // first channel, first message, slowest in channel
    expect(reqMessageSendLaterDM(user.token, dm.dmId, 'Hello World!', curTime + 3)).toStrictEqual({ messageId: 1 });
    // second channel, second message, same time in channel
    expect(reqMessageSendLaterDM(user.token, dm2.dmId, 'Hello World!', curTime + 2)).toStrictEqual({ messageId: 2 });
    // first channel, third message, fastest in channel
    expect(reqMessageSendLaterDM(user.token, dm.dmId, 'Hello World second!', curTime + 2)).toStrictEqual({ messageId: 3 });
    // second channel, fourth message, same time in channel
    expect(reqMessageSendLaterDM(user.token, dm2.dmId, 'Hello World second!', curTime + 2)).toStrictEqual({ messageId: 4 });

    await sleep(3.3);
    const dmmessages1 = reqDmMessages(user.token, dm.dmId, 0);
    const dmmessages2 = reqDmMessages(user.token, dm2.dmId, 0);

    expect(dmmessages1.messages[0].messageId).toStrictEqual(1);
    expect(dmmessages1.messages[0].message).toStrictEqual('Hello World!');
    expect(dmmessages1.messages[1].messageId).toStrictEqual(3);
    expect(dmmessages1.messages[1].message).toStrictEqual('Hello World second!');

    expect(dmmessages2.messages[0].messageId).toStrictEqual(4);
    expect(dmmessages2.messages[0].message).toStrictEqual('Hello World second!');
    expect(dmmessages2.messages[1].messageId).toStrictEqual(2);
    expect(dmmessages2.messages[1].message).toStrictEqual('Hello World!');
  });
});

describe('/message/pin/v1', () => {
  test('invalid token', () => {
    reqMessagePin('any random', 1);
  });
  test('the message is already pinned in dm or channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    expect(reqMessagePin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 1)).toStrictEqual(400);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessagePin(user.token, 5)).toStrictEqual({});
    expect(reqMessagePin(user.token, 5)).toStrictEqual(400);
  });
  test('no owner permissions in dm & channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqChannelInvite(aMember.token, newchannel.channelId, user.authUserId);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    expect(reqMessagePin(user.token, 1)).toStrictEqual(403);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessagePin(user1.token, 5)).toStrictEqual(403);
  });
  test('message not found in dm nor channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqChannelInvite(aMember.token, newchannel.channelId, user.authUserId);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    expect(reqMessagePin(user.token, 21)).toStrictEqual(400);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessagePin(user1.token, 35)).toStrictEqual(400);
  });
  test('success output for single message in dm or channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqMessagePin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 2)).toStrictEqual({});
    const messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[0].isPinned).toStrictEqual(true);
    expect(messagesGet.messages[1].isPinned).toStrictEqual(true);
  });
  test('success out for multiple messages in dm or channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 3 });
    expect(reqSendMessageDm(user2.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 5 });
    expect(reqMessagePin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 2)).toStrictEqual({});
    let messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[0].isPinned).toStrictEqual(true);
    expect(messagesGet.messages[1].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[2].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[3].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[4].isPinned).toStrictEqual(true);
    expect(reqMessagePin(aMember.token, 3)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 4)).toStrictEqual({});
    messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[3].isPinned).toStrictEqual(true);
    expect(messagesGet.messages[2].isPinned).toStrictEqual(true);
  });
});

describe('/message/unpin/v1', () => {
  test('invalid token', () => {
    reqMessageUnpin('any random', 1);
  });
  test('the message is already pinned in dm or channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    expect(reqMessageUnpin(aMember.token, 1)).toStrictEqual(400);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessageUnpin(user.token, 5)).toStrictEqual(400);
  });
  test('no owner permissions in dm & channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqChannelInvite(aMember.token, newchannel.channelId, user.authUserId);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    expect(reqMessageUnpin(user.token, 1)).toStrictEqual(403);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessageUnpin(user1.token, 5)).toStrictEqual(403);
  });
  test('message not found in dm nor channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user = requestAuthRegister('a@gmail.com', '123abc!@#', 'b', 'c');
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(user.token, uIds);
    reqChannelInvite(aMember.token, newchannel.channelId, user.authUserId);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor!')).toStrictEqual({ messageId: 2 });
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello Wor2!')).toStrictEqual({ messageId: 3 });
    expect(reqMessageUnpin(user.token, 21)).toStrictEqual(400);
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 5 });
    expect(reqSendMessageDm(user.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 6 });
    expect(reqMessageUnpin(user1.token, 35)).toStrictEqual(400);
  });
  test('success output for single message in dm or channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqMessagePin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 2)).toStrictEqual({});
    const messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[0].isPinned).toStrictEqual(true);
    expect(messagesGet.messages[1].isPinned).toStrictEqual(true);
    expect(reqMessageUnpin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessageUnpin(aMember.token, 2)).toStrictEqual({});
    const messagesGet2 = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet2.messages[0].isPinned).toStrictEqual(false);
    expect(messagesGet2.messages[1].isPinned).toStrictEqual(false);
  });
  test('success out for multiple messages in dm or channel', () => {
    const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
    requestChannelsCreateV3(aMember.token, 'crush teamasd', true);
    const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const uIds = [user1.authUserId, user2.authUserId];
    const uIds2 = [user2.authUserId];
    const dm = reqDmCreate(aMember.token, uIds);
    reqDmCreate(user1.token, uIds2);
    expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 3 });
    expect(reqSendMessageDm(user2.token, dm.dmId, 'Hello World2!')).toStrictEqual({ messageId: 4 });
    expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World3!')).toStrictEqual({ messageId: 5 });
    expect(reqMessagePin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 2)).toStrictEqual({});
    let messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[0].isPinned).toStrictEqual(true);
    expect(messagesGet.messages[1].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[2].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[3].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[4].isPinned).toStrictEqual(true);
    expect(reqMessagePin(aMember.token, 3)).toStrictEqual({});
    expect(reqMessagePin(aMember.token, 4)).toStrictEqual({});
    messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[3].isPinned).toStrictEqual(true);
    expect(messagesGet.messages[2].isPinned).toStrictEqual(true);
    expect(reqMessageUnpin(aMember.token, 1)).toStrictEqual({});
    expect(reqMessageUnpin(aMember.token, 2)).toStrictEqual({});
    expect(reqMessageUnpin(aMember.token, 3)).toStrictEqual({});
    expect(reqMessageUnpin(aMember.token, 4)).toStrictEqual({});
    messagesGet = reqMessagesSearch(aMember.token, 'World');
    expect(messagesGet.messages[0].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[1].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[2].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[3].isPinned).toStrictEqual(false);
    expect(messagesGet.messages[4].isPinned).toStrictEqual(false);
  });
});
