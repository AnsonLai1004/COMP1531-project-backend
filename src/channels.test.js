import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js'
import { authLoginV1, authRegisterV1 } from './auth.js'
import { channelJoinV1 } from './channel.js'
import { clearV1 } from './other.js'
import { getData, setData } from './dataStore.js'

beforeEach(() => clearV1());

describe("Channels Functions Errors", () => {
    
    test('error channelsCreate', () => {  
        const validAuthUserId = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang').authUserId;
        expect(channelsCreateV1(validAuthUserId, "", true)).toStrictEqual({error: "error"});
        expect(channelsCreateV1(validAuthUserId, "123456890712345678901", true)).toStrictEqual({error: "error"});
        // ASSUMPTION - invalid authUserId returns error
        expect(channelsCreateV1("Invalid ID", "TheoAng", true)).toStrictEqual({error: "error"});
    })
})

let user1, user2, user3, user4, user5, channel1, channel2, channel3;

describe("Correct Input", () => {

    beforeEach(() => {
        user1 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang').authUserId;
        user2 = authRegisterV1('alex@gmail.com', 'samplePass', 'Alex', 'Avery').authUserId;
        user3 = authRegisterV1('bill@gmail.com', 'samplePass', 'Bill', 'Benkins').authUserId;
        user4 = authRegisterV1('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman').authUserId;
        user5 = authRegisterV1('dory@gmail.com', 'samplePass', 'Dory', 'Dean').authUserId;

        channel1 = channelsCreateV1(user1, "BOOST", true).channelId;
        channel2 = channelsCreateV1(user2, "CRUNCHIE", true).channelId;
        channel3 = channelsCreateV1(user1, "EGGS", false).channelId;
    })

    
    test('channelsCreateV1 correct output', () => {

        const data = getData();
        
        expect(new Set(data.channels)).toStrictEqual(
            new Set([
                {
                    channelId: channel1,
                    name: "BOOST",
                    isPublic: true,
                    ownerMember: expect.any(Array),
                    allMembers: expect.any(Array),
                    messages: [],
                },
                {
                    channelId: channel2,
                    name: "CRUNCHIE",
                    isPublic: true,
                    ownerMember: expect.any(Array),
                    allMembers: expect.any(Array),
                    messages: [],
                },
                {
                    channelId: channel3,
                    name: "EGGS",
                    isPublic: false,
                    ownerMember: expect.any(Array),
                    allMembers: expect.any(Array),
                    messages: [],
                },
            ])
        )
    })
})