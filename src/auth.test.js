import { authLoginV1, authRegisterV1 } from "./auth.js";

describe('Testing authRegister function error cases', () => {
    test('Invalid email', () => {
        const registered = authRegisterV1('not-an-email', 'password', 'Harry', 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Same email as another user', () => {
        authRegisterV1('same.email@gmail.com', 'password', 'Harry', 'Potter');
        const registered = authRegisterV1('same.email@gmail.com', 'password', 'Hermione', 'Granger');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Password has five characters', () => {
        const registered = authRegisterV1('valid.email@gmail.com', 'npass', 'Harry', 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Empty first name', () => {
        const registered = authRegisterV1('valid.email@gmail.com', 'password', '', 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Empty last name', () => {
        const registered = authRegisterV1('valid.email@gmail.com', 'password', 'Harry', '');
        expect(registered).toStrictEqual({ error: 'error' });
    });
    
    test('51 character first name', () => {
        const char = a;
        const registered = authRegisterV1('valid.email@gmail.com', 'password', char.repeat(51), 'Potter');
        expect(registered).toStrictEqual({ error: 'error' });
    });

    test('Empty last name', () => {
        const char = a;
        const registered = authRegisterV1('valid.email@gmail.com', 'password', 'Harry', char.repeat(51));
        expect(registered).toStrictEqual({ error: 'error' });
    });

});

describe('Testing authRegister function valid cases', () => {
    test('Single user', () => {
        const registered = authRegisterV1('valid.email@gmail.com', 'password', 'Harry', 'Potter');
        expect(registered).toStrictEqual( 
            expect.objectContaining({
                authUserId: expect.any(Number),
          })
        );
    });
});

describe('Testing authLogin function', () => {
    // none yet
});

