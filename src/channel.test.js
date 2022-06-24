import { channelInviteV1, channelMessagesV1, channelDetailsV1, channelJoinV1 } from './channel.js';
import { channelsCreateV1 } from './channels.js';
import { authRegisterV1 } from './auth.js';
import { clearV1 } from './other.js';
import { getData } from './dataStore.js';

beforeEach(() => {
    clearV1();
});

describe('channelInviteV1', () => {
    // error cases
		test('Error case for Invalid channelId', () => {
      let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      let notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      // invalid channelid
      expect(channelInviteV1(aMember.authUserId, -999, notMember)).toStrictEqual({ error: 'error' });
    });
    
    test('Error case for invalid uId', () => {
			let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      let newchannel = channelsCreateV1(aMember.authUserId, 'crush team', true);
      // invalid uid
      expect(channelInviteV1(aMember.authUserId, newchannel.channelId, -999)).toStrictEqual({ error: 'error' });  
    });

    test('Error case for adding uid that is already a member of channel', () => {
      let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      let newchannel = channelsCreateV1(aMember.authUserId, 'crush team', true);
      // uid refers to a user that is already a member
      expect(channelInviteV1(aMember.authUserId, newchannel.channelId, aMember.authUserId)).toStrictEqual({ error: 'error' }); 
    });

    test('Error case for authorized user who invites is not a member of the group', () => {
      let notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
      let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
      let newchannel = channelsCreateV1(aMember.authUserId, 'crush team', true);
      // channelId valid but the authorized user who invites is not a member of the group
      expect(channelInviteV1(notMember.authUserId, newchannel.channelId, notMember.authUserId)).toStrictEqual({error: 'error'});
    });

    // correct input output
    test('Cases for correct return on channelInviteV1', () => {
        let owner = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
        let notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
        let newchannel = channelsCreateV1(owner.authUserId, 'crush team', true);
        // valid invite
        expect(channelInviteV1(owner.authUserId, newchannel.channelId, notMember.authUserId)).toStrictEqual({});
        expect(channelDetailsV1(owner.authUserId, newchannel.channelId)).toMatchObject({ 
            name: 'crush team', 
            isPublic: true,
            ownerMembers: [ 
              {
                email: "validemail@gmail.com",
                handleStr: "jakerenzella",
                nameFirst: "Jake",
                nameLast: "Renzella",
                uId: 1, 
              }  
            ],
            allMembers: [
              {
                email: "validemail@gmail.com",
                handleStr: "jakerenzella",
                nameFirst: "Jake",
                nameLast: "Renzella",
                uId: 1, 
              }, 
              {
                email: "Bob@gmail.com",
                handleStr: "bobrenzella",
                nameFirst: "Bob",
                nameLast: "Renzella",
                uId: 2,
              } 
            ],
        }); 
    });
})

describe('channelMessagesV1', () => {
    // cases where error occur
  test('Error for invalid channelId', () => {  
    let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    // invalid channelid
    expect(channelMessagesV1(aMember.authUserId, -999, 0)).toStrictEqual({ error: 'error' });
  });

  test('Error start is greater than total number of messages in channel', () => {  
    let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    let newchannel = channelsCreateV1(aMember.authUserId, 'crush team', true);
    expect(channelMessagesV1(aMember.authUserId, newchannel.channelId, 51)).toStrictEqual({ error: 'error'});
  });

  test('Error user not a member of channel', () => {  
  	let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    let notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    let newchannel = channelsCreateV1(aMember.authUserId, 'crush team', true);
    // channelid valid, authorised user not a member
    expect(channelMessagesV1(notMember.authUserId, newchannel.channelId, 0)).toStrictEqual({ error: 'error' });
  });

	// correct return for channelmessages
	test('correct return for empty array message', () => {  
		let aMember = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    let newchannel = channelsCreateV1(aMember.authUserId, 'crush team', true);
        
    // messages is an array of messages from newchannel
    // return messages from newchannel
    // valid arguments assuming messages is empty
    expect(channelMessagesV1(aMember.authUserId, newchannel.channelId, 0)).toStrictEqual({messages: [], start: 0, end: -1});
  });
});

describe('channelDetailsV1', () => {
  test('invalid userId', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelDetailsV1(-999, channel.channelId)).toStrictEqual({ error: 'error' });   
  })
	test('invalid channelId', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelDetailsV1(user.authUserId, -999)).toStrictEqual({ error: 'error' });  
    expect(channelDetailsV1(notMember.authUserId, channel.channelId)).toStrictEqual({ error: 'error' }); 
  })

	test('User not a member of channel', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelDetailsV1(notMember.authUserId, channel.channelId)).toStrictEqual({ error: 'error' }); 
  })
  
	test('correct return', () => {
    const user = authRegisterV1('abc@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, "BOOST", true);
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toMatchObject({ 
      name: 'BOOST', 
      isPublic: true,
      ownerMembers: [ 
        {
          uId: 1,
          email: "abc@gmail.com",
          handleStr: "jakerenzella",
          nameFirst: "Jake",
          nameLast: "Renzella",          
        },
      ],
      allMembers: [
        {
          uId: 1,
          email: "abc@gmail.com",
          handleStr: "jakerenzella",
          nameFirst: "Jake",
          nameLast: "Renzella",          
        },
      ], 
    }); 
  })
})

describe('channelJoinV1', () => {
  test('invalid input', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'BOOST', true);
    expect(channelJoinV1(user.authUserId, -999)).toStrictEqual({ error: 'error' });   
    expect(channelJoinV1(-999, channel.channelId)).toStrictEqual({ error: 'error' });  
    // authorised user is already a member of the channel
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({});
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({ error: 'error' });
    // channel that is private and member is not a global owner
    // assume member is not a global owner 
    const private_channel = channelsCreateV1(user.authUserId, 'Private', false);
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({ error: 'error' });
  }) 
  test('correct return', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'BOOST', true);
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({});
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toMatchObject({ 
      name: 'BOOST', 
      isPublic: true,
      ownerMembers: [ 
        {
          email: "validemail@gmail.com",
          handleStr: "jakerenzella",
          nameFirst: "Jake",
          nameLast: "Renzella",
          uId: 1, 
        }    
      ],
      allMembers: [ 
        {
          email: "validemail@gmail.com",
          handleStr: "jakerenzella",
          nameFirst: "Jake",
          nameLast: "Renzella",
          uId: 1, 
        },
        {
          email: "Bob@gmail.com",
          handleStr: "bobrenzella",
          nameFirst: "Bob",
          nameLast: "Renzella",
          uId: 2,
        } 
      ], 
    }); 
  })
})
