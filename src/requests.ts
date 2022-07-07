/**
 * File which contains sync-requests for every route. Used for testing.
 * @module requests
 */

import request from 'sync-request';
import { SERVER_URL } from './config';

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/login/v2',
    {
      json: {
        email, password
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    SERVER_URL + '/auth/register/v2',
    {
      json: {
        email, password, nameFirst, nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestClear() {
  const res = request(
    'DELETE',
    SERVER_URL + '/clear/v1',
    {}
  );
  return JSON.parse(res.getBody() as string);
}
