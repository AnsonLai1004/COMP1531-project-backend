Assume that if the authUserId passed into any function is invalid, return {error: error}
Assume the structure of a valid email is of form 'string@string.domain', and can be accurately validated by the imported isEmail function from 'validator' package
Assume that non-alphanumeric characters are permitted in user and channel names and passwords
Assume that the case where all characters of the user names are non-alphanumeric will result in an empty handle string (possibly with appended numbers)
Assume that the return type of userProfile is of type {user: user} rather than simply a "user" object
Assume all users are not global owner except user that created a channel
Assume that authUserId is of type number
