import { channelsCreateV1, channelsListV1, channelsListallV1 } from './channels.js'
import { authLoginV1, authRegisterV1 } from './auth.js'
import { channelJoinV1 } from './channel.js'
import { clearV1 } from './other.js'
import { getData, setData } from './dataStore.js'

describe("Channels Functions Errors", () => {
    
    test('error channelsCreate', () => {  
        const validAuthUserId = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        expect(channelsCreateV1(validAuthUserId, "", true)).toStrictEqual({error: "error"});
        expect(channelsCreateV1(validAuthUserId, "123456890712345678901", true)).toStrictEqual({error: "error"});
        // ASSUMPTION - invalid authUserId returns error
        expect(channelsCreateV1("Invalid ID", "TheoAng", true)).toStrictEqual({error: "error"});
    })
})

describe("Correct Input", () => {

    clearV1();
    // DATA
    const user1 = authRegisterV1('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
    const user2 = authRegisterV1('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
    const user3 = authRegisterV1('bill@gmail.com', 'samplePass', 'Bill', 'Benkins');
    const user4 = authRegisterV1('charlie@gmail.com', 'samplePass', 'Charlie', 'Capman');
    const user5 = authRegisterV1('dory@gmail.com', 'samplePass', 'Dory', 'Dean');

    const channel1 = channelsCreateV1(user1.authUserId, "BOOST", true);
    const channel2 = channelsCreateV1(user2.authUserId, "CRUNCHIE", true);
    const channel3 = channelsCreateV1(user1.authUserId, "EGGS", false);
    
    test('channelsCreateV1 correct output', () => {

        const data = getData();

        expect(new Set(data.channels)).toStrictEqual(
            new Set([
                {
                    channelId: expect.any(Number),
                    name: "BOOST",
                    isPublic: true,
                    ownerMember: expect.any(Array),
                    allMembers: expect.any(Array),
                    messages: [],
                },
                {
                    channelId: expect.any(Number),
                    name: "CRUNCHIE",
                    isPublic: true,
                    ownerMember: expect.any(Array),
                    allMembers: expect.any(Array),
                    messages: [],
                },
                {
                    channelId: expect.any(Number),
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