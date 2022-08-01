/**
 * implementation of other functions
 * @module other
**/
import { setData } from './data';
import { User, Channel, DM, TokenPair } from './interfaces';

function clearV1() {
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
  };
  setData(data);
  return {};
}

export { clearV1 };
