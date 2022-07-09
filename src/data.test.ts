import { authRegisterV1 } from './auth';
import { channelJoinV1, channelDetailsV1 } from './channel';
import { channelsCreateV1 } from './channels';
import { userProfileV1 } from './users';
import { clearV1 } from './other';
import { fileLoadData } from './data';

describe('Testing data persistence', () => {
  test('Clear data then manually reload from save', () => {
    const user1 = authRegisterV1('valid@gmail.com', 'password', 'Harry', 'Potter');
    const user2 = authRegisterV1('different@gmail.com', 'password', 'Hermione', 'Granger');
    const channel1 = channelsCreateV1(user1.authUserId, 'channel1', true);
    channelJoinV1(user2.authUserId, channel1.channelId);
    const profile = userProfileV1(user1.authUserId, user2.authUserId);

    clearV1();
    fileLoadData();

    expect(profile).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: 'different@gmail.com',
        nameFirst: 'Hermione',
        nameLast: 'Granger',
        handleStr: 'hermionegranger'
      }
    });

    expect(channelDetailsV1(user1.authUserId, channel1.channelId)).toMatchObject({
      name: 'channel1',
      isPublic: true,
      ownerMembers: [
        {
          uId: user1.authUserId,
          email: 'valid@gmail.com',
          handleStr: 'harrypotter',
          nameFirst: 'Harry',
          nameLast: 'Potter',
        },
      ],
      allMembers: [
        {
          uId: user1.authUserId,
          email: 'valid@gmail.com',
          handleStr: 'harrypotter',
          nameFirst: 'Harry',
          nameLast: 'Potter',
        },
        {
          uId: user2.authUserId,
          email: 'different@gmail.com',
          handleStr: 'hermionegranger',
          nameFirst: 'Hermione',
          nameLast: 'Granger',
        }
      ],
    });
  });
});
