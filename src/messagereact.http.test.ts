import {
    reqChannelInvite, reqMessagesSearch, reqMessagePin, reqMessageUnpin,
    requestClear, requestChannelsCreateV3, requestAuthRegister,
    reqChannelMessages, reqMessageSend, reqMessageEdit,
    reqMessageRemove, reqSendMessageDm, reqDmMessages, reqDmCreate,
    reqMessageReact,
    reqMessageUnreact
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
        expect(reqMessageReact("random token", 1, 1)).toStrictEqual(403)
    })
    test('invalid reactId', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqMessageReact(aMember.token, 1, 3)).toStrictEqual(400)
    })
    test('invalid messageId', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqMessageReact(aMember.token, 1000, 1)).toStrictEqual(400)
    })
    test('reactId uId already contain the user trying to react', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
        const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
        const uIds = [user1.authUserId, user2.authUserId];
        const dm = reqDmCreate(aMember.token, uIds);
        expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
        expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
        expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({})
        expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({})
        expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual(400)
        expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual(400)
    })
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
        reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId)
        expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
        expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
        expect(reqMessageReact(user1.token, 2, 1)).toStrictEqual({})
        expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({})
        expect(reqMessageReact(user1.token, 1, 1)).toStrictEqual({})
        expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({})
        let messagesGet = reqMessagesSearch(aMember.token, 'World');
        expect(messagesGet).toStrictEqual({
                "messages": [
                {
                    "isPinned": false,
                    "message": "Hello World!",
                    "messageId": 1,
                    "reacts": [{
                        "isThisUserReacted": false,
                        "reactId": 1,
                        "uIds": [
                            2,
                            1,
                        ],
                        },],
                    "timeSent": messagesGet.messages[0].timeSent,
                    "uId": 1,
                },
                {
                "isPinned": false,
                "message": "Hello World!",
                "messageId": 2,
                "reacts": [
                    {
                    "isThisUserReacted": false,
                    "reactId": 1,
                    "uIds": [
                        2,
                        1,
                    ],
                    },
                ],
                "timeSent": messagesGet.messages[1].timeSent,
                "uId": 2,
                },
            ],
        })
    })
})

// message/unreact
describe('message/unreact/v1', () => {
    test('invalid token', () => {
        expect(reqMessageUnreact("random token", 1, 1)).toStrictEqual(403)
    })
    test('invalid reactId', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqMessageUnreact(aMember.token, 1, 3)).toStrictEqual(400)
    })
    test('invalid messageId', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqMessageUnreact(aMember.token, 1000, 1)).toStrictEqual(400)
    })
    test('reactId uId already contain the user trying to react', () => {
        const aMember = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = requestChannelsCreateV3(aMember.token, 'crush team', true);
        const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
        reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId)
        const uIds = [user1.authUserId, user2.authUserId];
        const dm = reqDmCreate(aMember.token, uIds);
        expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
        expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
        expect(reqMessageUnreact(user1.token, 2, 1)).toStrictEqual(400)
        expect(reqMessageUnreact(user1.token, 1, 1)).toStrictEqual(400)
        expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({})
        expect(reqMessageUnreact(user1.token, 2, 1)).toStrictEqual(400)
        expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({})
        expect(reqMessageUnreact(user1.token, 1, 1)).toStrictEqual(400)
    })
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
        reqChannelInvite(aMember.token, newchannel.channelId, user1.authUserId)
        expect(reqMessageSend(aMember.token, newchannel.channelId, 'Hello World!')).toStrictEqual({ messageId: 1 });
        expect(reqSendMessageDm(user1.token, dm.dmId, 'Hello World!')).toStrictEqual({ messageId: 2 });
        expect(reqMessageReact(user1.token, 2, 1)).toStrictEqual({})
        expect(reqMessageReact(aMember.token, 2, 1)).toStrictEqual({})
        expect(reqMessageReact(user1.token, 1, 1)).toStrictEqual({})
        expect(reqMessageReact(aMember.token, 1, 1)).toStrictEqual({})
        let messagesGet = reqMessagesSearch(aMember.token, 'World');
        expect(messagesGet).toStrictEqual({
                "messages": [
                {
                    "isPinned": false,
                    "message": "Hello World!",
                    "messageId": 1,
                    "reacts": [{
                        "isThisUserReacted": false,
                        "reactId": 1,
                        "uIds": [
                            2,
                            1,
                        ],
                        },],
                    "timeSent": messagesGet.messages[0].timeSent,
                    "uId": 1,
                },
                {
                "isPinned": false,
                "message": "Hello World!",
                "messageId": 2,
                "reacts": [
                    {
                    "isThisUserReacted": false,
                    "reactId": 1,
                    "uIds": [
                        2,
                        1,
                    ],
                    },
                ],
                "timeSent": messagesGet.messages[1].timeSent,
                "uId": 2,
                },
            ],
        })
        expect(reqMessageUnreact(user1.token, 2, 1)).toStrictEqual({})
        expect(reqMessageUnreact(aMember.token, 2, 1)).toStrictEqual({})
        expect(reqMessageUnreact(user1.token, 1, 1)).toStrictEqual({})
        expect(reqMessageUnreact(aMember.token, 1, 1)).toStrictEqual({})
        messagesGet = reqMessagesSearch(aMember.token, 'World');
        expect(messagesGet).toStrictEqual({
                "messages": [
                {
                    "isPinned": false,
                    "message": "Hello World!",
                    "messageId": 1,
                    "reacts": [],
                    "timeSent": messagesGet.messages[0].timeSent,
                    "uId": 1,
                },
                {
                "isPinned": false,
                "message": "Hello World!",
                "messageId": 2,
                "reacts": [],
                "timeSent": messagesGet.messages[1].timeSent,
                "uId": 2,
                },
            ],
        })
    })
})