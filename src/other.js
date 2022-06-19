import { setData } from './dataStore.js';
function clearV1() {
  const data = {
    users: [],
    channels: []
  };
  setData(data);
  return {};
}

export { clearV1 };
