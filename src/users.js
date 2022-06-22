function userProfileV1(authUserId, uId) {
  return {
    user: {
      uId: 2, 
      email: 'different@gmail.com',
      nameFirst: 'Hermione',
      nameLast: 'Granger',
      handleStr: 'hermionegranger'
    }
  }
}

export { userProfileV1 }