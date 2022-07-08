import { requestAuthRegister, requestClear } from './requests'

beforeEach(() => {
    requestClear();
});

test('clearV1 test: can reuse email', () => {
  const userA = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userA).toStrictEqual({ 
        token: expect.any(String),    
        authUserId: expect.any(Number) 
    });
  const userB = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userB).toStrictEqual({ error: 'error' });
  requestClear();
  const userC = requestAuthRegister('hayhay123@gmail.com', '8743b52063cd84097a65d1633f5c74f5', 'Hayden', 'Smith');
  expect(userC).toStrictEqual({ 
        token: expect.any(String),    
        authUserId: expect.any(Number) 
    });
});
