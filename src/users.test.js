import { userProfileV1 } from "./users.js";

describe('Testing authRegister function error cases', () => {
    test('Invalid uId', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const notAnId = registered.authUserId + 99;
        const profile = userProfileV1(registered.authUserId, notAnId);
        expect(profile).toStrictEqual({ error: 'error' });
    });

    test('Invalid authUserId', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const notAnId = registered.authUserId + 99;
        const profile = userProfileV1(notAnId, registered.authUserId);
        expect(profile).toStrictEqual({ error: 'error' });
    });
});
