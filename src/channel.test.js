import { channelInviteV1, channelMessagesV1, channelDetailsV1, channelJoinV1 } from 'channel.js';
import { channelsCreateV1 } from 'channels.js';
import { authLoginV1 } from 'auth.js';
import { clearV1 } from 'other.js';

describe('channelInviteV1', () => {
  expect().toBe();   
})

describe('channelMessagesV1', () => {
  expect().toBe();   
})

describe('channelDetailsV1', () => {
  clearV1();
  test('invalid input', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const notMember = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelDetailsV1(-999, channel.channelId)).toStrictEqual({ error: 'error' });   
    expect(channelDetailsV1(user.authUserId, -999)).toStrictEqual({ error: 'error' });  
    expect(channelDetailsV1(notMember.authUserId, channel.channelId)).toStrictEqual({ error: 'error' }); 
  })
  clearV1();
  test('correct return', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toMatchObject({ 
      name: 'secret candy crush team', 
      isPublic: true,
      ownerMembers: [ user.authUserId ],
      allMembers: [ user.authUserId ], 
    }); 
  })
})

describe('channelJoinV1', () => {
  clearV1();
  test('invalid input', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelJoinV1(user.authUserId, -999)).toStrictEqual({ error: 'error' });   
    expect(channelJoinV1(-999, channel.channelId)).toStrictEqual({ error: 'error' });  
    // authorised user is already a member of the channel
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({});
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({ error: 'error' });
    // channel that is private and member is not a global owner
    // assume member is not a global owner 
    const private_channel = channelsCreateV1(user.authUserId, 'Private channel', false);
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({ error: 'error' });
  }) 
  clearV1();
  test('correct return', () => {
    const user = authRegisterV1('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    const member = authRegisterV1('Bob@gmail.com', '123abc!@#', 'Bob', 'Renzella');
    const channel = channelsCreateV1(user.authUserId, 'secret candy crush team', true);
    expect(channelJoinV1(member.authUserId, channel.channelId)).toStrictEqual({});
    expect(channelDetailsV1(user.authUserId, channel.channelId)).toMatchObject({ 
      name: 'secret candy crush team', 
      isPublic: true,
      ownerMembers: [ user.authUserId ],
      allMembers: [ user.authUserId, member.authUserId ], 
    }); 
  })
})
