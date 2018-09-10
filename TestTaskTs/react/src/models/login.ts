class UserData {
  public login: string;
  public password: string;
}

const createEmptyLogin = (): UserData => {
  return new UserData();
};

export {
  UserData,
  createEmptyLogin
};
