/**
 * stores data while program is running
 * also contains helper functions to access and set the data
 * @module dataStore
**/
import { User, Channel, DM, TokenPair, WorkplaceStats } from './interfaces';
import { ChannelsExist, DmsExist, MessagesExist } from './interfaces';
import fs from 'fs';

let data = {
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
    channelsExist: [] as ChannelsExist[],
    dmsExist: [] as DmsExist[],
    messagesExist: [] as MessagesExist[]
  },
  secret: 'COMP1531W14BHASHASHAHSHAHSA(*%&&%&*&&FKUYSCWLCW',
};

export interface DataStore {
  users: User[];
  channels: Channel[];
  dms: DM[];
  tokens: TokenPair[];
  lastAuthUserId: number;
  lastChannelId: number;
  lastDMId: number;
  lastMessageId: number;
  lastToken: number;
  stats: WorkplaceStats;
  secret: string;
}

// Use get() to access the data
export function getData(): DataStore {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
export function setData(newData: DataStore) {
  data = newData;
  // auto-save data every time it is modified
  fileSaveData();
}

// Saves the data to a file dataStore.json
function fileSaveData() {
  try {
    fs.writeFileSync('dataStore.json', JSON.stringify(data));
  } catch (err) {}
}

// Updates the data based on the contents of dataStore.json
export function fileLoadData() {
  try {
    data = JSON.parse(fs.readFileSync('dataStore.json', 'utf8'));
  } catch (err) {}
}

// Helper function to update the user stats relating to channels joined
export function updateStatsUserChannel(uId: number, timeStamp: number, action: 'add' | 'remove') {
  for (const user of data.users) {
    if (uId === user.uId) {
      const lastChannelJoinObj = user.stats.channelsJoined.slice(-1)[0];
      let newChannelJoinNum = lastChannelJoinObj.numChannelsJoined;
      if (action === 'add') {
        newChannelJoinNum++;
      } else {
        newChannelJoinNum--;
      }
      const newChannelJoinObj = {
        numChannelsJoined: newChannelJoinNum,
        timeStamp: timeStamp
      };
      user.stats.channelsJoined.push(newChannelJoinObj);
    }
  }
}

// Helper function to update the user stats relating to dms joined
export function updateStatsUserDm(uId: number, timeStamp: number, action: 'add' | 'remove') {
  for (const user of data.users) {
    if (uId === user.uId) {
      const lastDmJoinObj = user.stats.dmsJoined.slice(-1)[0];
      let newDmJoinNum = lastDmJoinObj.numDmsJoined;
      if (action === 'add') {
        newDmJoinNum++;
      } else {
        newDmJoinNum--;
      }
      const newDmJoinObj = {
        numDmsJoined: newDmJoinNum,
        timeStamp: timeStamp
      };
      user.stats.dmsJoined.push(newDmJoinObj);
    }
  }
}

// Helper function to update the user stats relating to messages sent
export function updateStatsUserMessage(uId: number, timeStamp: number) {
  for (const user of data.users) {
    if (uId === user.uId) {
      const lastMessageObj = user.stats.messagesSent.slice(-1)[0];
      const newMessageNum = lastMessageObj.numMessagesSent;
      const newMessageObj = {
        numMessagesSent: newMessageNum,
        timeStamp: timeStamp
      };
      user.stats.messagesSent.push(newMessageObj);
    }
  }
}
