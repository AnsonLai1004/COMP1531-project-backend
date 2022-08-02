import { getData, setData } from './data';
import { Message } from './interfaces';
import { tokenToUId } from './auth';
import HTTPError from 'http-errors';
export {
  notification
};

/**
 * Return the user's most recent 20 notifications, 
 * ordered from most recent to least recent.
 * @returns { notifications }
*/
function notification() {

}