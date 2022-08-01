import { reqAdminUserRemove, reqAdminUPChange, requestChannelsCreateV3, reqChannelJoin, reqDmCreate } from './requests';
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
    test('tests - channels, Dms, users/all/v2, treat owner can remove other owners', () => {
        const globalOwner = requestAuthRegister('same@gmail.com', 'password', 'Harry', 'Potter');
        const channelOwner = requestAuthRegister('same@gmail.com', 'password', 'Hermione', 'Granger');
        const user = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const channel = requestChannelsCreateV3(channelOwner.token, 'first', true);
        const channel2 = requestChannelsCreateV3(channelOwner.token, 'second', true);
        const dm = reqDmCreate(channelOwner.token, [globalOwner.authUserId, user.authUserId]);
        const dm2 = reqDmCreate(channelOwner.token, [globalOwner.authUserId, user.authUserId]);
        // removed from all channels/DMS

        // TODO: user/stats/v1 return userStats to get numChannelsJoined, numDmsJoined
        expect(reqChannelJoin(globalOwner.token, channel.channelId));
        expect(reqChannelJoin(user.token, channel.channelId)).toStrictEqual({});
        expect(reqChannelJoin(user.token, channel2.channelId)).toStrictEqual({});
        expect(reqChannelJoin(globalOwner.token, channel.channelId)).toStrictEqual({});
        expect(reqAdminUserRemove(globalOwner.token, user.authUserId)).toStrictEqual({});
        // TODO: user/stats/v1 return userStats to get numChannelsJoined, numDmsJoined0
        /* users: [{
            uId,email,nameFirst,nameLast,handleStr,
        }]*/
        // not be included in user array returned by users/all
        // TODO: request users/all/v2 
        expect(/*users/all/v2*/).toMatchObject([
            {
                uId: globalOwner.authUserId,
                nameFirst: 'Harry',
                nameLast: 'Potter',
                handleStr: 'harrypotter',
            },
            {
                uId: channelOwner.authUserId,
                nameFirst: 'Hermione',
                nameLast: 'Granger',
                handleStr: 'hermionegranger',
            },
        ]);
        // treats owners can remove other threats owners(including the original first owner)
        const newGO = requestAuthRegister('same@gmail.com', 'password', 'Jordan', 'Potter');
        expect(reqAdminUPChange(globalOwner.token, newGO.authUserId, 1)).toStrictEqual({});
        expect(reqAdminUserRemove(newGO.token, globalOwner.authUserId)).toStrictEqual({});   
    }); 
    
    test('test - messages', () => {
        // contents of the messages they sent - replaced by 'Removed user'



        // profile still be retrievable with user/profile
        // but nameFirst - Removed, nameLast - user
        // user's email and handle should be reusable 

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



