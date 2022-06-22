import { clearV1 } from './other.js';
import { authRegisterV1 } from './auth.js';
import { channelsCreateV1 } from './channels.js';
import { getData } from './dataStore.js';

test('clearV1 test', () => {
    const userA = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const userB = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channelA = channelsCreateV1(userA.authUserId, 'secret candy crush team', true);
    const channelB = channelsCreateV1(userB.authUserId, 'another channel', true);
    const data = getData();
    console.log(data);
    /*expect(data).toMatchObject({
        users:[

        ],
        channels:[],
    });*/
    result = echo('abc');
    expect(result).toBe('abc');
  });