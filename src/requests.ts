/**
 * File which contains sync-requests for every route. Used for testing.
 * @module requests
 */

import request from 'sync-request';
import { port, url } from './config.json';

/// //////////////////////////// ITERATION 3 ////////////////////////////////////
// Standup
export function requestStandupStartV3(token: string, channelId: number, length: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/standup/start/v1',
    {
      json: {
        channelId,
        length
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

export function requestStandupActiveV3(token: string, channelId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/standup/active/v1',
    {
      qs: {
        channelId
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

export function requestStandupSendV3(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/standup/send/v1',
    {
      json: {
        channelId,
        message
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

// Channels
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

// dm
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

export function reqDmLeaveV3(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/dm/leave/v2',
    {
      json: {
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
export function reqMessageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/share/v1',
    {
      json: {
        ogMessageId,
        channelId,
        dmId,
        message,
      },
      headers: {
        token: token,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.body as string);
  }
  return res.statusCode;
}
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
    `${url}:${port}` + '/channel/details/v3',
    {
      qs: {
        channelId,
      },
      headers: {
        token: token
      }
    }
  );

  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqChannelJoin(token: string, channelId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channel/join/v3',
    {
      json: {
        channelId,
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/channel/invite/v3',
    {
      json: {
        channelId,
        uId,
      },
      headers: {
        token: token
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
      `${url}:${port}` + '/channel/leave/v2',
      {
        json: {
          token,
          channelId,
        },
        headers: {
          token: token
        }
      }

  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqChannelMessages(token: string, channelId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/channel/messages/v3',
    {
      qs: {
        channelId,
        start,
      },
      headers: {
        token: token
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
      `${url}:${port}` + '/channel/addowner/v2',
      {
        headers: {
          token: token
        },
        json: {
          channelId,
          uId,
        }
      }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqChannelRemoveowner(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
      `${url}:${port}` + '/channel/removeowner/v2',
      {
        headers: {
          token: token
        },
        json: {
          channelId,
          uId,
        }
      }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// dm/.../v1
export function reqDmCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}` + '/dm/create/v2',
    {
      headers: {
        token: token
      },
      json: {
        uIds,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqDmDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}` + '/dm/details/v2',
    {
      headers: {
        token: token
      },
      qs: {
        dmId,
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

/// ////////////////////////////////////////////
// /message/send/v2
export function reqMessageSend(token: string, channelId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/send/v2',
    {
      json: {
        channelId,
        message
      },
      headers: {
        token: token
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
        messageId,
        message,
      },
      headers: {
        token: token
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
        messageId,
      },
      headers: {
        token: token
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
        dmId,
        message,
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// message/sendlater/v1
export function reqMessageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/sendlater/v1',
    {
      json: {
        channelId,
        message,
        timeSent
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

// message/sendlaterdm/v1
export function reqMessageSendLaterDM(token: string, dmId: number, message: string, timeSent: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/sendlaterdm/v1',
    {
      json: {
        dmId,
        message,
        timeSent
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqMessagePin(token: string, messageId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/pin/v1',
    {
      json: {
        messageId,
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}

export function reqMessageUnpin(token: string, messageId: number) {
  const res = request(
    'POST',
    `${url}:${port}` + '/message/unpin/v1',
    {
      json: {
        messageId,
      },
      headers: {
        token: token
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
        dmId,
        start,
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}
/// ///////////////////////////////////////////////

// user & users
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

// search route
export function reqMessagesSearch(token: string, queryStr: string) {
  const res = request(
    'GET',
    `${url}:${port}` + '/search/v1',
    {
      qs: {
        queryStr
      },
      headers: {
        token: token
      }
    }
  );
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
  return res.statusCode;
}
