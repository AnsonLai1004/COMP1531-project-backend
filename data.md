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
    }
]

/**
 * Data structure 'channels' to store channels data
 * Fields:
 * 1. cId: integer
 * 2. channelName: string
 * 3. channelDesc: string
 * 4. usersMember: list of integers
 * 5. usersStaff: list of integers
 * 6. isPublic: boolean
 * 7. messageLog: list of message objects (analogous to a C struct)
 * *  message objects contain:
 * * * a. messageContents: string 
 * * * b. messageDate: Date
 * * * c. messageAuthor: integer
 * * * d. isMessageRead: boolean
 **/
const channels = [
    {
        'cId': 1,
        'channelName': 'COMP1531 Boost',
        'channelDesc': 'For discussing the group project',
        'usersMember': [1, 2, 3, 4, 5],
        'usersStaff': [1, 3],
        'isPublic': false,
        'messageLog': [
            {
                'messageContents': 'Hey, I submitted a merge request.',
                'messageTime': 'June 9 2022 18:34',
                'messageAuthor': 2,
                'isMessageRead': true
            },
            {
                'messageContents': 'Approved it on GitLab',
                'messageDate': 'June 9 2022 20:06',
                'messageAuthor': 4,
                'isMessageRead': false
            }
        ]
    }
]

```