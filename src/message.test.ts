import {
    reqChannelInvite, reqChannelDetails, reqChannelJoin, reqChannelLeave, reqChannelAddowner, reqChannelRemoveowner,
    requestClear, requestChannelsCreate, requestAuthRegister, reqChannelMessages, reqMessageSend
} from './requests';
import { clearV1 } from './other';
import { memberExpression } from '@babel/types';

beforeEach(() => {
    requestClear();
});

describe('message/send/v1', () => {
    test('Error case for invalid channelId', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqMessageSend(aMember.token, -999, "any string message")).toStrictEqual({ error: 'error'});
    });
    test("Error case for length message empty or more than 100 in length", () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreate(aMember.token, 'crush team', true);
        expect(reqMessageSend(aMember.token, newchannel.channelId, "")).toStrictEqual({ error: 'error'});
        expect(reqMessageSend(aMember.token, newchannel.channelId, "Zpiti6tTc7YI62hg2jS8PTDcWo5mywHyNw5qmS6DSE1QAR9lQbzufWWHqPlcoFM9BjG3021W8RCxQ9ksEF1KBGoucWV1xBofZuuJC")).toStrictEqual({ error: 'error'});
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