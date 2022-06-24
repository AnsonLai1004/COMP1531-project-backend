import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1, channelsListallV1 } from './channels.js';
import { userProfileV1 } from './users.js';

test('clearV1 test', () => {
    const userA = authRegisterV1('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
    const channelA = channelsCreateV1(userA.authUserId, 'BOOST', true);   
    expect(userProfileV1(userA.authUserId, userA.authUserId)).toMatchObject({
        user: {
            uId: userA.authUserId, 
            email: 'hayhay123@gmail.com',
            nameFirst: 'Hayden',
            nameLast: 'Smith',
            handleStr: 'haydensmith',
        }
    });
    console.log(channelsListallV1(userA.authUserId))
    expect(channelsListallV1(userA.authUserId)).toMatchObject({
        channels:[
            {
                name: "BOOST",
                channelId: 1,
            }
        ],
    });
    clearV1();
    expect(userProfileV1(userA.authUserId, userA.authUserId)).toMatchObject({ error: 'error' });
    expect(channelsListallV1(userA.authUserId)).toMatchObject({ error: 'error' });
  });
