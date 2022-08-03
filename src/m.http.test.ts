import { requestClear, requestAuthRegister, requestChannelsCreate, reqDmCreate, reqMessageSend, reqMessageShare
} from './requests';
beforeEach(() => {
  requestClear();
});
// message/share/v1
describe('message/share/v1', () => {
    test('Invalid cases', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      //expect(user).toStrictEqual({})
      const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
      const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
      const channel = requestChannelsCreate(user.token, 'crush team', true);
      const channel2 = requestChannelsCreate(user2.token, 'team', true);
      const dm = reqDmCreate(user.token, [user1.authUserId]);
      const message = reqMessageSend(user.token, channel.channelId, 'Hello World!');
      //expect(message).toStrictEqual({ messageId: 1});
      expect(reqMessageShare(user.token, message.messageId,'', -999, -1)).toStrictEqual(400);
      expect(reqMessageShare(user.token, message.messageId,'', -1, -999)).toStrictEqual(400);
      expect(reqMessageShare(user.token, message.messageId,'', channel.channelId, dm.dmId)).toStrictEqual(400);
      expect(reqMessageShare(user.token, -999,'', channel.channelId, -1)).toStrictEqual(400);
      // user1 not in channel
      expect(reqMessageShare(user1.token, message.messageId,'', -1, dm.dmId)).toStrictEqual(400);
      expect(reqMessageShare(user.token, message.messageId,'DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa' +
      'Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b' +
      '2OScLJrg9ykkjmJf3bywy4YWmVqQihxasdyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE' +
      'yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ' +
      'y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk' +
      'eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf' +
      '3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHsKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Hafgdgdgdfgs',
      -1, dm.dmId)).toStrictEqual(400);
      
      expect(reqMessageShare(user.token, message.messageId,'', channel2.channelId, -1)).toStrictEqual(403);
      expect(reqMessageShare('Invalid', message.messageId,'', channel.channelId, -1)).toStrictEqual(403);
    });

    test('share message to a channel', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
      const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
      const channel = requestChannelsCreate(user.token, 'crush team', true);
      const channel2 = requestChannelsCreate(user2.token, 'team', true);
      const message = reqMessageSend(user.token, channel.channelId, 'abc');
      expect(reqChannelJoin(user.token, channel2.channelId));
      expect(reqMessageShare(user.token, message.messageId,'abc', channel2.channelId, -1)).toStrictEqual({ sharedMessageId: 2 });
      const channelmessages = reqChannelMessages(user.token, channel2.channelId, 0);
      expect(channelmessages.messages[0].uId).toStrictEqual(2);
      expect(channelmessages.messages[0].message).toStrictEqual('abc abc');
    });
    test('share message to a dm', () => {
      const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
      const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
      const dm = reqDmCreate(user.token, [user1.authUserId]);
      const dm2 = reqDmCreate(user.token, [user1.authUserId, user2.authUserId]);
      expect(reqSendMessageDm(user.token, dm.dmId, 'abc')).toStrictEqual({ messageId: 1 });
      expect(reqMessageShare(user.token, 1,'abc', -1, dm2.dmId)).toStrictEqual({ sharedMessageId: 2 });
      const dmMessages = reqDmMessages(user.token, dm2.dmId, 0);
      expect(dmMessages.messages[0].uId).toStrictEqual(2);
      expect(dmMessages.messages[0].message).toStrictEqual('abc abc');
    });

  });