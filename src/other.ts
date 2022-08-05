/**
 * implementation of other functions
 * @module other
**/
import { setData } from './data';
import { User, Channel, DM, TokenPair } from './interfaces';

function clearV1() {
  const timeStamp = Math.floor((new Date()).getTime() / 1000);
  const data = {
    users: [] as User[],
    channels: [] as Channel[],
    dms: [] as DM[],
    tokens: [] as TokenPair[],
    lastAuthUserId: 0,
    lastChannelId: 0,
    lastDMId: 0,
    lastMessageId: 0,
    lastToken: 0,
    stats: {
      channelsExist: [{ numChannelsExist: 0, timeStamp: timeStamp }],
      dmsExist: [{ numDmsExist: 0, timeStamp: timeStamp }],
      messagesExist: [{ numMessagesExist: 0, timeStamp: timeStamp }],
    },
    secret: 'COMP1531W14BHASHASHAHSHAHSA(*%&&%&*&&FKUYSCWLCW',
  };

  setData(data);

  return {};
}

export { clearV1 };
