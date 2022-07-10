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

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channels/create/v2',
    {
      json: {
        token, name, isPublic
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestChannelsList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channels/list/v2',
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestChannelsListall(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channels/listall/v2',
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}