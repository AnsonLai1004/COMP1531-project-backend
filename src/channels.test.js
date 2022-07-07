import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js'
import { authLoginV1, authRegisterV1 } from './auth.js'
import { channelJoinV1, channelDetailsV1 } from './channel.js'
import { clearV1 } from './other.js'
import { userProfileV1 } from './users.js'

beforeEach(() => clearV1());

describe("Channels Functions Errors", () => {
    
    test('error channelsCreate', () => {  
        const validAuthUserId = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang').authUserId;
        expect(channelsCreateV1(validAuthUserId, "", true)).toStrictEqual({error: "error"});
        expect(channelsCreateV1(validAuthUserId, "123456890712345678901", true)).toStrictEqual({error: "error"});
        // ASSUMPTION - invalid authUserId returns error
        expect(channelsCreateV1("Invalid ID", "TheoAng", true)).toStrictEqual({error: "error"});
    })

    // ASSUMPTION - invalid authUserId returns error
    test('invalid ID channelsListV1 channelsListallV1', () => {  
        expect(channelsListV1("Invalid ID")).toStrictEqual({error: "error"});
        expect(channelsListallV1("Invalid ID")).toStrictEqual({error: "error"});
    })
})

let user1, user2, user3, user4, user5, channel1, channel2, channel3, channel4;

describe("Correct Input", () => {

    beforeEach(() => {
        // DATA
        user1 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang').authUserId;
        user2 = authRegisterV1('alex@gmail.com', 'samplePass', 'Alex', 'Avery').authUserId;
        user3 = authRegisterV1('bill@gmail.com', 'samplePass', 'Bill', 'Benkins').authUserId;
        user4 = authRegisterV1('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman').authUserId;
        user5 = authRegisterV1('dory@gmail.com', 'samplePass', 'Dory', 'Dean').authUserId;

        channel1 = channelsCreateV1(user1, "BOOST", true).channelId;
        channelJoinV1(user2, channel1);
        channelJoinV1(user3, channel1);
        channelJoinV1(user4, channel1);

        channel2 = channelsCreateV1(user2, "CRUNCHIE", true).channelId;
        channelJoinV1(user3, channel2);
        channelJoinV1(user4, channel2);

        channel3 = channelsCreateV1(user1, "EGGS", true).channelId;
        channelJoinV1(user2, channel3);

        channel4 = channelsCreateV1(user3, "AERO", false).channelId;
    })

    
    test('channelsCreateV1 correct output', () => {

        const user1Profile = userProfileV1(user1, user1).user;
        const user2Profile = userProfileV1(user2, user2).user;
        const user3Profile = userProfileV1(user3, user3).user;
        const user4Profile = userProfileV1(user4, user4).user;
        const user5Profile = userProfileV1(user5, user5).user;

        const channel1Details = channelDetailsV1(user1, channel1);
        channel1Details.allMembers = new Set(channel1Details.allMembers);

        const channel2Details = channelDetailsV1(user2, channel2);
        channel2Details.allMembers = new Set(channel2Details.allMembers);

        const channel3Details = channelDetailsV1(user1, channel3);
        channel3Details.allMembers = new Set(channel3Details.allMembers);

        const channel4Details = channelDetailsV1(user3, channel4);
        channel4Details.allMembers = new Set(channel4Details.allMembers);
        
        expect(channel1Details).toStrictEqual({
            name: "BOOST",
            isPublic: true,
            ownerMembers: [user1Profile],
            allMembers: new Set([user1Profile, user2Profile, user3Profile, user4Profile]),
        })

        expect(channel2Details).toStrictEqual({
            name: "CRUNCHIE",
            isPublic: true,
            ownerMembers: [user2Profile],
            allMembers: new Set([user2Profile, user3Profile, user4Profile]),
        })

        expect(channel3Details).toStrictEqual({
            name: "EGGS",
            isPublic: true,
            ownerMembers: [user1Profile],
            allMembers: new Set([user1Profile, user2Profile]),
        })

        expect(channel4Details).toStrictEqual({
            name: "AERO",
            isPublic: false,
            ownerMembers: [user3Profile],
            allMembers: new Set([user3Profile]),
        })
    })

    test('channelsListV1 users 1-5', () => {
        
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
                    {
                        channelId: channel4,
                        name: "AERO",
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
    })

    test('channelsListallV1 users 1-5', () => {
        
        const listAll = {
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
                    {
                        channelId: channel4,
                        name: "AERO",
                    },
                ]
        }

        expect(channelsListallV1(user1)).toStrictEqual(listAll);
        expect(channelsListallV1(user2)).toStrictEqual(listAll);
        expect(channelsListallV1(user3)).toStrictEqual(listAll);
        expect(channelsListallV1(user4)).toStrictEqual(listAll);
        expect(channelsListallV1(user5)).toStrictEqual(listAll);
    })
})
