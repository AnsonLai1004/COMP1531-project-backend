import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js'
import { authLoginV1, authRegisterV1 } from './auth.js'
import { channelJoinV1 } from './channel.js'

describe("Channels Functions", () => {

    beforeEach(() => clearV1())

    test('error channelsCreate', () => {  
        const validAuthUserId = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        expect(channelsCreateV1(validAuthUserId, "", true)).toStrictEqual({error: "error"});
        expect(channelsCreateV1(validAuthUserId, "123456890712345678901", true)).toStrictEqual({error: "error"});
        expect(channelsListV1(user5)).toStrictEqual({channels: []});
    })

    test('error channelsListV1 channelsListallV1', () => {  
        expect(channelsListV1("Not valid ID")).toStrictEqual({channels: []});
        expect(channelsListallV1("Not valid ID")).toStrictEqual({channels: []});
    })

    test('channelsListV1 and channelsListallV1 for different users', () => {
        const user1 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const user2 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const user3 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const user4 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const user5 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');

        const channel1 = channelsCreateV1(user1, "BOOST", true);
        channelJoin(user2, channel1);
        channelJoin(user3, channel1);
        channelJoin(user4, channel1);

        const channel2 = channelsCreateV1(user2, "CRUNCHIE", true);
        channelJoin(user3, channel1);
        channelJoin(user4, channel1);

        const channel3 = channelsCreateV1(user1, "EGGS", true);
        channelJoin(user2, channel1);

        // expected

        // user1 - 1 and 3
        // user2 - all
        // user3 and 4 - 1 and 2
        // user5 - none

        expect(channelsListV1(user1)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        })

        expect(channelsListV1(user2)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        });

        expect(channelsListV1(user3)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                ]
        });

        expect(channelsListV1(user4)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                ]
        });

        expect(channelsListV1(user5)).toStrictEqual({channels: []});

        expect(channelsListallV1(user1)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        });

        expect(channelsListallV1(user2)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        });

        expect(channelsListallV1(user3)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        });

        expect(channelsListallV1(user4)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        });

        expect(channelsListallV1(user5)).toStrictEqual({
            channels: 
                [
                    {
                        channelId: channel1,
                        name: "BOOST",
                    },
                    {
                        channelId: channel2,
                        name: "CRUNCHIE",
                    },
                    {
                        channelId: channel3,
                        name: "EGGS",
                    },
                ]
        });
    })
})