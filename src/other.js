import { getData } from './dataStore.js'

function clearV1() {
  const data = {
    users: [],
    channels: [],
    lastAuthUserId: 0,
    lastChannelId: 0,
  }

  return {};
}

export { clearV1 };
