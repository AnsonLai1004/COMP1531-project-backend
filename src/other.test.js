import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { getData } from './dataStore.js';

test('clearV1 test', () => {
    const userA = authRegisterV1('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
    const channelA = channelsCreateV1(userA.authUserId, 'BOOST', true);   
    const data = getData();
    expect(data).toMatchObject({
        users:[
            {
                uId: 1,
                nameFirst: 'Hayden',
                nameLast: 'Smith',
                email: 'hayhay123@gmail.com',
                password: '8743b52063cd84097a65d1633f5c74f5',
                handleStr: 'haydensmith',
                profilePicUrl: '/path/to/image',
                isOnline: true,
                isOwner: true,
            }
        ],
        channels:[
            {
                name: "BOOST",
                isPublic: true,
                channelId: 1,
                ownerMembers: [ userA.authUserId ],
                allMembers: [ userA.authUserId ],
                messages: [],
            }
        ],
        lastAuthUserId: data.users.length,
        lastChannelId: data.channels.length,
    });
    clearV1();
    const dataA = getData();
    expect(dataA).toMatchObject({
        users:[],
        channels:[],
        lastAuthUserId: 0,
        lastChannelId: 0,
    })
    
  });