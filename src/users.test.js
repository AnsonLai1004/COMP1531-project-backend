import { authRegisterV1 } from "./auth.js";
import { userProfileV1 } from "./users.js";
import { clearV1 } from "./other.js";

beforeEach(() => {
    clearV1();
});

describe('Testing userProfile function error cases', () => {
    test('Invalid uId', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const notAnId = registered.authUserId + 99;
        const profile = userProfileV1(registered.authUserId, notAnId);
        expect(profile).toStrictEqual({ error: 'error' });
    });

    test('Invalid authUserId', () => {
        const registered = authRegisterV1('another-valid@gmail.com', 'password', 'Harry', 'Potter');
        const notAnId = registered.authUserId + 99;
        const profile = userProfileV1(notAnId, registered.authUserId);
        expect(profile).toStrictEqual({ error: 'error' });
    });
});

describe('Testing userProfile function valid cases', () => {
    test('Valid return', () => {
        const registered1 = authRegisterV1('yet-another-valid@gmail.com', 'password', 'Harry', 'Potter');
        const registered2 = authRegisterV1('different@gmail.com', 'password', 'Hermione', 'Granger');
        const profile = userProfileV1(registered1.authUserId, registered2.authUserId);
        expect(profile).toStrictEqual({
            user: expect.objectContaining({
                uId: registered2.authUserId,
                email: 'different@gmail.com',
                nameFirst: 'Hermione',
                nameLast: 'Granger',
                handleStr: 'hermionegranger'
            })
        });
    });
});
