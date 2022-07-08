/**
 * File which contains sync-requests for every route. Used for testing.
 * @module requests
 */

import request from 'sync-request';
import { port, url } from './config.json';

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/auth/login/v2',
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
    `${url}:${port}` + '/auth/register/v2',
    {
      json: {
        email, password, nameFirst, nameLast
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestAuthLogout(token: string) {
  const res = request(
    'POST',
      `${url}:${port}` + '/auth/logout/v1',
      {
        json: {
          token
        }
      }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}` + '/clear/v1',
    {}
  );
  return JSON.parse(res.getBody() as string);
}
