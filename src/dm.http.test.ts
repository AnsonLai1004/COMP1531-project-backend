import { reqDmDetails, requestClear } from './requests';

beforeEach(() => {
    requestClear();
});

describe('dm/details/v1', () => {
    test('invalid dmId', () => {
      //const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      //const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
      //expect(channelDetailsV1(-999, channel.channelId)).toStrictEqual({ error: 'error' });
    });
    test('authUserId is invalid or is not a member of DM', () => {
        //const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        //const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
        //const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
        //expect(channelDetailsV1(user.authUserId, -999)).toStrictEqual({ error: 'error' });
        //expect(channelDetailsV1(notMember.authUserId, channel.channelId)).toStrictEqual({ error: 'error' });
    });
    test('correct return', () => {
      
    });
});