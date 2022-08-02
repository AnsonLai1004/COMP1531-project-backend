/**
 * File which contains sync-requests for every route. Used for testing.
 * @module requests
 */

import request from 'sync-request';
import { port, url } from './config.json';

/// //////////////////////////// ITERATION 3 ////////////////////////////////////
export function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channels/create/v3',
    {
      json: {
        name,
        isPublic
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.body as string);
  }
  return res.statusCode;
}

export function requestChannelsListV3(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channels/list/v3',
    {
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.body as string);
  }
  return res.statusCode;
}

export function requestChannelsListallV3(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channels/listall/v3',
    {
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.body as string);
  }
  return res.statusCode;
}

export function reqDmListV3(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/dm/list/v2',
    {
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.body as string);
  }
  return res.statusCode;
}

export function reqDmRemoveV3(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}` + '/dm/remove/v2',
    {
      qs: {
        dmId,
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.body as string);
  }
  return res.statusCode;
}
/// /////////////////////////////////////////////////////////////////////////////

// auth
export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/auth/login/v3',
    {
      json: {
        email, password
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/auth/register/v3',
    {
      json: {
        email, password, nameFirst, nameLast
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function requestAuthLogout(token: string) {
  const res = request(
    'POST',
      `${url}:${port}` + '/auth/logout/v2',
      {
        headers: {
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
/// /////////////////////////////////////////////////////////////////
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
    `${url}:${port}` + '/channel/invite/v3',
    {
      json: {
        token,
        channelId,
        uId,
      }
    });
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
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
    `${url}:${port}` + '/channel/messages/v3',
    {
      qs: {
        token,
        channelId,
        start,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
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
export function reqDmCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}` + '/dm/create/v1',
    {
      json: {
        token,
        uIds,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

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

/// ////////////////////////////////////////////
// /message/send/v2
export function reqMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/send/v2',
    {
      json: {
        token,
        channelId,
        message
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// /message/edit/v2
export function reqMessageEdit(token: string, messageId: number, message: string) {
  const res = request(
    'PUT',
    `${url}:${port}` + '/message/edit/v2',
    {
      json: {
        token,
        messageId,
        message,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// /message/remove/v2
export function reqMessageRemove(token: string, messageId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}` + '/message/remove/v2',
    {
      qs: {
        token,
        messageId,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// message/senddm/v2
export function reqSendMessageDm(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/senddm/v2',
    {
      json: {
        token,
        dmId,
        message,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// dm/messages/v2
export function reqDmMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/dm/messages/v2',
    {
      qs: {
        token,
        dmId,
        start,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}
/// ///////////////////////////////////////////////

export function reqDmList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/dm/list/v1',
    {
      qs: {
        token,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function reqDmRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}` + '/dm/remove/v1',
    {
      qs: {
        token,
        dmId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

export function reqDmLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/dm/leave/v1',
    {
      json: {
        token,
        dmId,
      }
    }
  );
  return JSON.parse(res.getBody() as string);
}

// user & users
export function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/user/profile/v3',
    {
      headers: {
        token
      },
      qs: {
        uId
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function requestUsersAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/users/all/v2',
    {
      headers: {
        token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function requestUserSetName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
      `${url}:${port}` + '/user/profile/setname/v2',
      {
        headers: {
          token
        },
        json: {
          nameFirst, nameLast
        }
      }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function requestUserSetEmail(token: string, email: string) {
  const res = request(
    'PUT',
      `${url}:${port}` + '/user/profile/setemail/v2',
      {
        headers: {
          token
        },
        json: {
          email
        }
      }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function requestUserSetHandle(token: string, handleStr: string) {
  const res = request(
    'PUT',
      `${url}:${port}` + '/user/profile/sethandle/v2',
      {
        headers: {
          token
        },
        json: {
          handleStr
        }
      }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}
