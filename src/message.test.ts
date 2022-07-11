import {
    reqChannelInvite, reqChannelDetails, reqChannelJoin, reqChannelLeave, reqChannelAddowner, reqChannelRemoveowner,
    requestClear, requestChannelsCreate, requestAuthRegister, reqChannelMessages, reqMessageSend, reqMessageEdit,
    reqMessageRemove
} from './requests';
import { clearV1 } from './other';
import { memberExpression } from '@babel/types';

beforeEach(() => {
    requestClear();
});

// make dms tesst

// message/send/v1
describe('message/send/v1', () => {
    test('Error case for invalid channelId', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqMessageSend(aMember.token, -999, "any string message")).toStrictEqual({ error: 'error'});
    });
    test("Error case for length message empty or more than 1000 in length", () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        expect(reqMessageSend(aMember.token, newchannel.channelId, "")).toStrictEqual({ error: 'error'});
        expect(reqMessageSend(aMember.token, newchannel.channelId, "DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa"+
        "Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b"+
        "2OScLJrg9ykkjmJf3bywy4YWmVqQihxyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE"+
        "yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ"+
        "y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk"+
        "eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf"+
        "3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha")).toStrictEqual({ error: 'error'});
    });
    test("Error case where user is not authorized in channel", () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const notMember = requestAuthRegister('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
        expect(reqMessageSend(notMember.token, newchannel.channelId, "Hello World!")).toStrictEqual({ error: 'error'});
    })
    // success input output for messagesend
    test("Valid arguments, output success", () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        expect(reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")).toStrictEqual({ messageId: 1 });
        const channelmessages = reqChannelMessages(aMember.token, newchannel.channelId, 0);
        expect(channelmessages.messages[0].uId).toStrictEqual(1);
        expect(channelmessages.messages[0].message).toStrictEqual("Hello World!");
    });
    test("Valid arguments, output success, multiple message, different channels", () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const newchannel2 = requestChannelsCreate(aMember.token, 'crush team', true);
        // first channel, first message
        expect(reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")).toStrictEqual({ messageId: 1 });
        const channelmessages = reqChannelMessages(aMember.token, newchannel.channelId, 0);
        expect(channelmessages.messages[0].messageId).toStrictEqual(1);
        expect(channelmessages.messages[0].message).toStrictEqual("Hello World!");
        // second channel, second message
        expect(reqMessageSend(aMember.token, newchannel2.channelId, "Hello World second!")).toStrictEqual({ messageId: 2 });
        const channelmessages2 = reqChannelMessages(aMember.token, newchannel2.channelId, 0);
        expect(channelmessages2.messages[0].messageId).toStrictEqual(2);
        expect(channelmessages2.messages[0].message).toStrictEqual("Hello World second!");
        // first channel, third message
        expect(reqMessageSend(aMember.token, newchannel.channelId, "Hello World third!")).toStrictEqual({ messageId: 3 });
        const channelmessages3 = reqChannelMessages(aMember.token, newchannel.channelId, 0);
        expect(channelmessages3.messages[1].messageId).toStrictEqual(3);
        expect(channelmessages3.messages[1].message).toStrictEqual("Hello World third!");
        // second channel, fourth message
        expect(reqMessageSend(aMember.token, newchannel2.channelId, "Hello World second!")).toStrictEqual({ messageId: 4 });
        const channelmessages4 = reqChannelMessages(aMember.token, newchannel2.channelId, 0);
        expect(channelmessages4.messages[1].messageId).toStrictEqual(4);
        expect(channelmessages4.messages[1].message).toStrictEqual("Hello World second!");
    })
})

// message/edit/v1
describe('message/edit/v1', () => {
    test('length of message greater than 1000', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageEdit(aMember.token, 1, "DS3ho21uGIVZpqsCqDUv879zypAtNRC8gFrM7YecnTcdwqMCfzvUkyuxBu3zRYxhlRsMBPDJxzfUIh8bhp92owenjm8UXDPvUrI6U17qa"+
        "Z3xc2MBMe2hvhYUbrI5CR6ylYdxGj6UikC9CpdD5CCNLGmqWigm2QkGXjLq3EcBi12nPSxuf7vGlhBWDKCwNjXBuo1KpFdogbdCwD8sEBgEQZs3Uw3vIhVOvYQzm6wkG7sU5BHjLTaXTeLIP19jAmWVFsVYG66Ztg4ZG1b"+
        "2OScLJrg9ykkjmJf3bywy4YWmVqQihxyFL5WfEmTzrDw2SVGelnSfkNCUv9TwVrKmUzPWFR5JBNVGy71r528mDxRNwwJw1uSXhkmF39WuvlkuHHRZyUZweELBtlDKZqsG1CI4qj2M9BEKQo7OJE5ZNRtEoh2cHwzFcxgVE"+
        "yiZ3QXnWviV5q2k6Uchm2X7iuYfC8eQNPXnx8SQzN1xkKV3GyukZPiA4szqbS0llk8q1EBKU4s3ENmroHquWeTfbplOHuRxdr9vPau9OV9Vu5sKWlqwfYQLVjaHvsTqPdMz8XKST2ick1MOtgNMn3vN0yUGJJzbc27gciQ"+
        "y6tK6PxCGZSRhR2TLHXeYHYfVarjGGWDQ3WvsTgBSIyEzcz8cjAcOSlMravYVQtqzQo5gWwJeqvEFXSnhG8n3hnLptr0qC47hsHxS8vFKjivtO3w52yXfaUVJxD48siNyWLZg9lzZ6Qubb6w6hqP3M9ePmtINh02L8UfFk"+
        "eVMyuWjoWudLRMaEtmxERW3WJcnJv6AYvOwFCQkLtjKRiX4GZ67sM1LKjq66aNT7tC5MViUBai8uV7LDs9fxa864GoWrw9tJD95dauiN7BJyfQFmslS3C3WClToayaqGNZjA89GollAaEHxoQGG9b4jtnAsyctv4lNtWLf"+
        "3WF6IiCSUKoiaduaRI1wxMS6Fqpih9qyHKyr72jtS2ficEcTY6Fw3rU1n3a11sx6Ha")).toStrictEqual({ error: 'error'});
    });
    test('messageId invalid', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageEdit(aMember.token, 2, "DS3ho21uGIVZpqsCqDUv879zypAt")).toStrictEqual({ error: 'error'});
    });
    test('Person doesnt have owner permissions', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const notowner = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageEdit(notowner.token, 1, "DS3ho21uGIVZpqsCqDUv879zypAt")).toStrictEqual({ error: 'error'});
    });
    test('person not the sender of the message', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const notUser = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
        // add notUser to channel and send message
        reqChannelInvite(aMember.token, newchannel.channelId, notUser.authUserId);
        reqMessageSend(notUser.token, newchannel.channelId, "Hello World!")
        expect(reqMessageEdit(aMember.token, 1, "DS3ho21uGIVZpqsCqDUv879zypAt")).toStrictEqual({ error: 'error'});
    });
    // success edit
    test('edit single message from owner', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageEdit(aMember.token, 1, "DS3ho21uGIVZpqsCqDUv879zypAt")).toStrictEqual({});
    })
    test('edit single message from owner, where new message is empty', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageEdit(aMember.token, 1, "")).toStrictEqual({});
    })
    test('edit multiple message from multiple channels', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const newchannel2 = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!");
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World2!");
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World3!");
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World4!")
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World5!")
        expect(reqMessageEdit(aMember.token, 4, "edit 1")).toStrictEqual({});
        expect(reqMessageEdit(aMember.token, 1, "edit 2")).toStrictEqual({});
        expect(reqMessageEdit(aMember.token, 3, "edit 3")).toStrictEqual({});
    })
    test('edit multiple message from different channels, where new message is empty', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const newchannel2 = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!");
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World2!");
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World3!");
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World4!")
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World5!")
        expect(reqMessageEdit(aMember.token, 4, "")).toStrictEqual({});
        expect(reqMessageEdit(aMember.token, 1, "")).toStrictEqual({});
        expect(reqMessageEdit(aMember.token, 3, "")).toStrictEqual({});
    })
})

// message/remove/v1
describe('message/remove/v1', () => {
    test('messageId invalid', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageRemove(aMember.token, 2)).toStrictEqual({ error: 'error'});
    });
    test('Person doesnt have owner permissions', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const notowner = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageRemove(notowner.token, 1)).toStrictEqual({ error: 'error'});
    });
    test('person not the sender of the message', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const notUser = requestAuthRegister('asd@gmail.com', '123abc!@#', 'Jak', 'asd');
        // add notUser to channel and send message
        reqChannelInvite(aMember.token, newchannel.channelId, notUser.authUserId);
        reqMessageSend(notUser.token, newchannel.channelId, "Hello World!")
        expect(reqMessageRemove(aMember.token, 1)).toStrictEqual({ error: 'error'});
    });
    // success edit
    test('edit single message from owner', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!")
        expect(reqMessageRemove(aMember.token, 1)).toStrictEqual({});
    })
    test('edit multiple message from multiple channels', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        const newchannel2 = requestChannelsCreate(aMember.token, 'crush team', true);
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World!");
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World2!");
        reqMessageSend(aMember.token, newchannel.channelId, "Hello World3!");
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World4!")
        reqMessageSend(aMember.token, newchannel2.channelId, "Hello World5!")
        expect(reqMessageRemove(aMember.token, 4)).toStrictEqual({});
        expect(reqMessageRemove(aMember.token, 1)).toStrictEqual({});
        expect(reqMessageRemove(aMember.token, 3)).toStrictEqual({});
    })
})