import { setData } from './dataStore.js';
function clearV1() {
  const data = {
    users: [],
    channels: [],
    lastAuthUserId: 0,
    lastChannelId: 0,
  };
  setData(data);
  return {};
}

export { clearV1 };
