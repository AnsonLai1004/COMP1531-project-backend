import { channelInviteV1, channelMessagesV1, channelDetailsV1, channelJoinV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';

describe('channelInviteV1', () => {
    beforeEach(() => clearV1());
    // error cases
    test('Cases for error on channelInviteV1', () => {  
        const aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
        const newchannel = channelsCreateV1(aMember.authUserId, 'secret candy crush team', true);
        // invalid channelid
        expect(channelInviteV1(aMember, -999, notMember.uId)).toStrictEqual({ error: 'error' });
        // invalid uid
        expect(channelInviteV1(aMember, newchannel, -999)).toStrictEqual({ error: 'error' });  
        // uid refers to a user that is already a member
        expect(channelInviteV1(aMember, newchannel, aMember.uId)).toStrictEqual({ error: 'error' }); 
        // channelId valid but the authorized user who invites is not a member of the group
        expect(channelInviteV1(notMember, newchannel, notMember.uId)).toStrictEqual({error: 'error'});
    });
    // correct input output
    test('Cases for correct return on channelInviteV1', () => {  
        const owner = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
        const newchannel = channelsCreateV1(aMember.authUserId, 'secret candy crush team', true);
        // valid invite
        expect(channelInviteV1(owner, newchannel, notMember.uId)).toStrictEqual({});
        expect(channelDetailsV1(owner, newchannel)).toMatchObject({ 
            name: 'secret candy crush team', 
            isPublic: true,
            ownerMembers: [ owner ],
            allMembers: [ owner, notMember ],
        }); 
    });
})

describe('channelMessagesV1', () => {

    beforeEach(() => clearV1());

    // cases where error occur
    test('Cases for error on channelMessagesV1', () => {  
        const aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
        const newchannel = channelsCreateV1(aMember.authUserId, 'secret candy crush team', true);
        // invalid channelid
        expect(channelMessagesV1(aMember, -999, 0)).toStrictEqual({ error: 'error' });
        // start is greater than total number of messages in the channel
        expect(channelMessagesV1(member, newchannel, 51)).toStrictEqual({ error: 'error'});
        // channelid valid, authorised user not a member
        expect(channelMessagesV1(notMember, newchannel, 0)).toStrictEqual({ error: 'error' });
    });

    // cases where return is correct
    test('Cases for correct return on channelMessagesV1', () => {  
        const aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        const newchannel = channelsCreateV1(aMember.authUserId, 'secret candy crush team', true);
        // valid arguments assuming messages exist with 99 messages
        // messages is an array of messages from newchannel
        // return messages from newchannel
        expect(channelMessagesV1(aMember, newchannel, 0)).toStrictEqual(messages, 0, 50);
        expect(channelMessagesV1(aMember, newchannel, 50)).toStrictEqual(messages, 50, -1);
    });
});
