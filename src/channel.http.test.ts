import { reqChannelDetails, reqChannelJoin, requestClear } from './requests';

beforeEach(() => {
    requestClear();
});

describe('channel/details/v2', () => {
    test('invalid userId', () => {
        const registered = requestAuthRegister('valid@gmail.com', 'password', 'Harry', 'Potter');
        expect(reqChannelDetails(-999, ))
    });
});