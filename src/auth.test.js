import { authLoginV1, authRegisterV1 } from "./auth.js";
import { clearV1 } from "./other.js";
import { userProfileV1 } from "./users.js";

beforeEach(() => {
    clearV1();
});


describe('Testing authRegister function error cases', () => {
    test('Invalid email', () => {
        const registered = authRegisterV1('not-an-email', 'password', 'Harry', 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Same email as another user', () => {
        authRegisterV1('same@gmail.com', 'password', 'Harry', 'Potter');
        const registered = authRegisterV1('same@gmail.com', 'password', 'Hermione', 'Granger');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Password has five characters', () => {
        const registered = authRegisterV1('valid@gmail.com', 'npass', 'Harry', 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Empty first name', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', '', 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Empty last name', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', '');
        expect(registered).toStrictEqual({ error: 'error' });
    });
    
    test('51 character first name', () => {
        const char = 'a';
        const registered = authRegisterV1('valid@gmail.com', 'password', char.repeat(51), 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('51 character last name', () => {
        const char = 'a';
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', char.repeat(51));
        expect(registered).toStrictEqual({ error: 'error' });
    });

});

describe('Testing authRegister function valid cases', () => {
    test('Single user', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        expect(registered).toStrictEqual( 
            expect.objectContaining({
                authUserId: expect.any(Number)
          })
        );
    });
    test('Two users, check ids are different', () => {
        const registered1 = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const registered2 = authRegisterV1('different@gmail.com', 'password', 'Hermione', 'Granger');
        expect(registered1.authUserId !== registered2.authUserId);
    });
});

describe('Testing authLogin function error cases', () => {
    test('Email does not belong to a user', () => {
        const login = authLoginV1('invalid@gmail.com', 'password');
        expect(login).toStrictEqual({ error: 'error' });
    });

    test('Wrong password', () => {
        authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const login = authLoginV1('valid@gmail.com', 'wrongpassword');
        expect(login).toStrictEqual({ error: 'error' });
    });
});

describe('Testing authLogin function valid cases', () => {
    test('Valid login', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const login = authLoginV1('valid@gmail.com', 'password');
        expect(login).toStrictEqual( 
            expect.objectContaining({
                authUserId: registered.authUserId
          })
        );
    });
});

describe('Testing authRegister handle generation', () => {
    test('Single user base case', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'harry', 'potter');
        const profile = userProfileV1(registered.authUserId, registered.authUserId);
        expect(profile.user.handleStr === 'harrypotter');
    });
    test('Three users with same name, check that id appends numbers', () => {
        const registered1 = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
        const registered2 = authRegisterV1('another-valid@gmail.com', 'password', 'Harry', 'Potter');
        const registered3 = authRegisterV1('different-valid@gmail.com', 'password', 'Harry', 'Potter');

        const profile1 = userProfileV1(registered1.authUserId, registered1.authUserId);
        const profile2 = userProfileV1(registered2.authUserId, registered2.authUserId);
        const profile3 = userProfileV1(registered3.authUserId, registered3.authUserId);

        expect(profile1.user.handleStr === 'harrypotter');
        expect(profile2.user.handleStr === 'harrypotter0');
        expect(profile3.user.handleStr === 'harrypotter1');
    });
    test('Casting uppercase to lowercase', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'HARRY', 'POTTER');
        const profile = userProfileV1(registered.authUserId, registered.authUserId);
        expect(profile.user.handleStr === 'harrypotter');
    });
    test('Removing non-alphanumeric characters', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', 'harry#@*)(#', 'potter_+_#@');
        const profile = userProfileV1(registered.authUserId, registered.authUserId);
        expect(profile.user.handleStr === 'harrypotter');
    });
    test('Keeping numbers passed into name', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', '123Harry', '456Potter');
        const profile = userProfileV1(registered.authUserId, registered.authUserId);
        expect(profile.user.handleStr === '123harry456potter');
    });
    test('Cut off 21 character name to 20 characters', () => {
        const registered = authRegisterV1('valid@gmail.com', 'password', '1234567890', '12345678901');
        const profile = userProfileV1(registered.authUserId, registered.authUserId);
        expect(profile.user.handleStr === '12345678901234567890');
    });
    test('Handle may exceed 20 characters when appending numbers', () => {
        const registered1 = authRegisterV1('valid@gmail.com', 'password', '1234567890', '12345678901');
        const registered2 = authRegisterV1('another-valid@gmail.com', 'password', '1234567890', '12345678901');
        const profile1 = userProfileV1(registered1.authUserId, registered1.authUserId);
        const profile2 = userProfileV1(registered2.authUserId, registered2.authUserId);
        expect(profile1.user.handleStr === '12345678901234567890');
        expect(profile2.user.handleStr === '123456789012345678900');
    });
});