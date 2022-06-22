```javascript
// TODO: insert your data structure that contains users + channels info here
// You may also add a short description explaining your design
/**
 *  Data structure 'users' to store users data 
 *  Fields :
 *  1. uId: integer
 *  2. nameFirst: string
 *  3. nameLast: string
 *  4. email: string
 *  5. password: string (use hashing to store?)
 *  6. handleStr: string
 *  7. profilePicUrl: string
 *  8. isOnline: boolean
 *  9. isOwner: boolean
**/
const users = [
    {
        'uId': 1,
        'nameFirst': 'Hayden',
        'nameLast': 'Smith',
        'email': 'hayhay123@gmail.com',
        'password': '8743b52063cd84097a65d1633f5c74f5'
        'handleStr': 'haydensmith',
        'profilePicUrl': '/path/to/image',
        'isOnline': true,
        'isOwner': true,
    }
]

/**
 * Data structure 'channels' to store channels data
 * Fields:
 * 1. name: string
 * 2. isPublic: boolean
 * 3. channelId: integer
 * 4. ownerMembers: <Array> userIds
 * 5. allMembers: <Array> userIds
 * 6. messages: <Array> messageObj (analogous to a C struct)
 * *  messageObj contain:
 * * * a. messageId: integer
 * * * b. uId: integer
 * * * c. message: string
 * * * d. timeSent: time
 **/

const channels: [
    {
        name: "boost"
        isPublic: true
        channelId: 1
        ownerMembers: [
            1, 2, 3
        ]
        allMembers: [
            1, 2, 3
        ]
        messages: [
            {
                messageId: 1
                uId: 1
                message: "Hello"
                timeSent: time
            }
        ]
    }
]

```