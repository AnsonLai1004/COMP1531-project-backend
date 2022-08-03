import { reqUserStats, requestAuthRegister, requestClear } from './requests';
import { requestChannelsCreateV3, reqMessageSend, reqDmCreate, reqSendMessageDm, reqChannelLeave, reqDmLeaveV3 } from './requests'

beforeEach(() => {
  requestClear();
});

afterAll(() => {
  requestClear();
});
describe('user/stats/v1', () => {
    test('invalid token', () => {
        const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        const invalidStats = reqUserStats(user1.token + 'rubbish extra chars');
        expect(invalidStats).toEqual(403);
    });
    test('check user stats', () => {
        const time1a = Math.floor((new Date()).getTime() / 1000);
        const user1 = requestAuthRegister('theo.ang816@gmail.com', 'samplePass', 'Theo', 'Ang');
        
        // newly registered user
        const stats1a = reqUserStats(user1.token);
        expect(stats1a).toEqual({ userStats: {
            channelsJoined:[{numChannelsJoined: 0, timeStamp: expect.any(Number)}],
            dmsJoined:[{numDmsJoined: 0, timeStamp: expect.any(Number)}],
            messagesSent:[{numMessagesSent: 0, timeStamp: expect.any(Number)}],
            involvementRate: 0
        }});

        // time check on user registration
        expect(stats1a.channelsJoined[0].timeStamp).toBeGreaterThanOrEqual(time1a);
        expect(stats1a.channelsJoined[0].timeStamp).toBeLessThanOrEqual(time1a + 1);
        expect(stats1a.channelsJoined[0].timeStamp).toEqual(stats1a.dmsJoined[0].timeStamp);
        expect(stats1a.channelsJoined[0].timeStamp).toEqual(stats1a.messagesSent[0].timeStamp);

        const time1b  = Math.floor((new Date()).getTime() / 1000);
        const channel1 = requestChannelsCreateV3(user1.token, 'BOOST', true).channelId;
        const time1c = Math.floor((new Date()).getTime() / 1000);
        reqMessageSend(user1.token, channel1.channelId, 'message');

        const stats1b = reqUserStats(user1.token);
        expect(stats1b).toEqual({ userStats: {
            channelsJoined:[{numChannelsJoined: 0, timeStamp: expect.any(Number)}, {numChannelsJoined: 1, timeStamp: expect.any(Number)}],
            dmsJoined:[{numDmsJoined: 0, timeStamp: expect.any(Number)}],
            messagesSent:[{numMessagesSent: 0, timeStamp: expect.any(Number)}, {numMessagesSent: 1, timeStamp: expect.any(Number)}],
            involvementRate: 1
        }});

        expect(stats1b.channelsJoined[1].timeStamp).toBeGreaterThanOrEqual(time1b);
        expect(stats1b.channelsJoined[1].timeStamp).toBeLessThanOrEqual(time1b + 1);
        expect(stats1b.messagesSent[1].timeStamp).toBeGreaterThanOrEqual(time1c);
        expect(stats1b.messagesSent[1].timeStamp).toBeLessThanOrEqual(time1c + 1);

        const user2 = requestAuthRegister('alex@gmail.com', 'samplePass', 'Alex', 'Avery');
        
        const time2a = Math.floor((new Date()).getTime() / 1000);
        const dm1 = reqDmCreate(user2.token, [user1.authUserId]);

        const time2b = Math.floor((new Date()).getTime() / 1000);
        reqSendMessageDm(user2.token, dm1.dmId, "dm 1 message");
        reqSendMessageDm(user1.token, dm1.dmId, "dm 2 message");

        const stats1c = reqUserStats(user1.token);
        expect(stats1c).toEqual({ userStats: {
          channelsJoined:[{numChannelsJoined: 0, timeStamp: expect.any(Number)}, {numChannelsJoined: 1, timeStamp: expect.any(Number)}],
          dmsJoined:[{numDmsJoined: 0, timeStamp: expect.any(Number)}, {numDmsJoined: 1, timeStamp: expect.any(Number)}],
          messagesSent:[{numMessagesSent: 0, timeStamp: expect.any(Number)}, {numMessagesSent: 1, timeStamp: expect.any(Number)}, {numDmsJoined: 2, timeStamp: expect.any(Number)}],
          involvementRate: 1
        }});

    });
});
  