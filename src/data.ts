/**
 * stores data while program is running
 * also contains helper functions to access and set the data
 * @module dataStore
**/
import { User, Channel, DM, TokenPair } from './interfaces';
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
