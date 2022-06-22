Assume that authUserId is of type number
Assume the structure of a valid email is of form 'string@string.domain', and can be accurately validated by the imported isEmail function from 'validator' package
Assume that non-alphanumeric characters are permitted in user and channel names and passwords
Assume that userProfile also returns an error if argument "authUserId" is not valid
Assume that the return type of userProfile is of type {user: user} rather than simply a "user" object
Assume that if authUserId passed into a function is invalid, return error
