/**
 * File which contains sync-requests for every route. Used for testing.
 * @module requests
 */

import request from 'sync-request';
import { port, url } from './config.json';
// auth
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

// channels
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

// channel
export function reqChannelDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channel/details/v2',
    {
      qs: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function reqChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channel/join/v2',
    {
      json: {
        token,
        channelId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

// user & users
export function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/user/profile/v2',
    {
      qs: {
        token,
        uId
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestUsersAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/users/all/v1',
    {
      qs: {
        token
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestUserSetName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
      `${url}:${port}` + '/user/profile/setname/v1',
      {
        json: {
          token, nameFirst, nameLast
        }
      }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestUserSetEmail(token: string, email: string) {
  const res = request(
    'PUT',
      `${url}:${port}` + '/user/profile/setemail/v1',
      {
        json: {
          token, email
        }
      }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestUserSetHandle(token: string, handle: string) {
  const res = request(
    'PUT',
      `${url}:${port}` + '/user/profile/sethandle/v1',
      {
        json: {
          token, handle
        }
      }
  );
  return JSON.parse(res.getBody() as string);
}
