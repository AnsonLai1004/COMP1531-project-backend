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

// channel functions
export function reqChannelDetails(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channel/details/v2',
    {
      qs: {
        token,
        channelId,
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
        channelId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function reqChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channel/invite/v2',
    {
      json: {
        token,
        channelId,
        uId,
      }
    });
  return JSON.parse(res.getBody() as string);
}

// channel/.../v1
export function reqChannelLeave(token: string, channelId: number) {
  const res = request(
    'POST',
      `${url}:${port}` + '/channel/leave/v1',
      {
        json: {
          token,
          channelId,
        }
      }

  );
  return JSON.parse(res.getBody() as string);
}

export function reqChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channel/messages/v2',
    {
      qs: {
        token,
        channelId,
        start,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function reqChannelAddowner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
      `${url}:${port}` + '/channel/addowner/v1',
      {
        json: {
          token,
          channelId,
          uId,
        }
      }
  );
  return JSON.parse(res.getBody() as string);
}

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channels/create/v2',
    {
      json: {
        token,
        name,
        isPublic
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

export function reqChannelRemoveowner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
      `${url}:${port}` + '/channel/removeowner/v1',
      {
        json: {
          token,
          channelId,
          uId,
        }
      }
  );
  return JSON.parse(res.getBody() as string);
}

// dm/.../v1
export function reqDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/dm/details/v1',
    {
      qs: {
        token,
        dmId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

// /message/send/v1
export function reqMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/send/v1',
    {
      json: {
        token,
        channelId,
        message,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

// /message/edit/v1
export function reqMessageEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    `${url}:${port}` + '/message/edit/v1',
    {
      json: {
        token,
        messageId,
        message,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

// /message/remove/v1
export function reqMessageRemove(token: string, messageId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}` + '/message/remove/v1',
    {
      qs: {
        token,
        messageId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}
