interface IUserData {
  login: string;
  password: string;
  submitted: boolean;
  errorMessage: string;
}

const createEmptyLogin = (): IUserData => ({
  login: "",
  password: "",
  submitted: false,
  errorMessage: ""
});

export {
  IUserData,
  createEmptyLogin
};
