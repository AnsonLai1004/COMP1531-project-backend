import { reqAdminUserRemove, reqAdminUPChange, requestChannelsCreateV3, reqChannelJoin } from './requests';
beforeEach(() => {
    requestClear();
  });

describe('admin/user/remove/v1', () => {
    test('error cases', () => {
        const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
        const user = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
        const user2 = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        expect(reqAdminUserRemove(user.token, user2.authUserId)).toStrictEqual(403);
        expect(reqAdminUserRemove(globalOwner.token, -999)).toStrictEqual(400);
        expect(reqAdminUserRemove(globalOwner.token, globalOwner.authUserId)).toStrictEqual(400);
    });
    test('correct return', () => {
        // removed from all channels/DMS

        // not be included in user array returned by users/all

        // treats owners can remove other threats owners(including the original first owner)

        // contents of the messages they sent - replaced by 'Removed user'

        // profile still be retrievable with user/profile
        // but nameFirst - Removed, nameLast - user
        // user's email and handle should be reusable 

    }); 
    test('', () => {
    });
});

// user permission id 1 - Owners
// id 2 - members
describe('admin/userpermission/change/v1', () => {
    test('error cases', () => {
        const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
        const user = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
        expect(reqAdminUPChange(globalOwner.token, -999, 1)).toStrictEqual(400);
        expect(reqAdminUPChange(globalOwner.token, globalOwner.authUserId, 2)).toStrictEqual(400);
        expect(reqAdminUPChange(globalOwner.token, user.authUserId, 3)).toStrictEqual(400);
        expect(reqAdminUPChange(globalOwner.token, user.authUserId, 2)).toStrictEqual(400);
        expect(reqAdminUPChange(globalOwner.token, globalOwner.authUserId, 2)).toStrictEqual(400);
        expect(reqAdminUPChange(user.token, globalOwner.authUserId, 1)).toStrictEqual(400);       
    });
    test('correct return', () => {
        const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
        const user = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
        const channelOwner = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const private = requestChannelsCreateV3(channelOwner.token, 'private', false);
        expect(reqChannelJoin(globalOwner.token, private.channelId)).toStrictEqual({});
        expect(reqChannelJoin(user.token, private.channelId)).toStrictEqual(403);

        expect(reqAdminUPChange(globalOwner.token, user.authUserId, 1)).toStrictEqual({});
        expect(reqChannelJoin(user.token, private.channelId)).toStrictEqual({});

        expect(reqAdminUPChange(globalOwner.token, user.authUserId, 2)).toStrictEqual({});
        const private = requestChannelsCreateV3(channelOwner.token, 'private2', false);
        expect(reqChannelJoin(user.token, private.channelId)).toStrictEqual(403);
    }); 
});



