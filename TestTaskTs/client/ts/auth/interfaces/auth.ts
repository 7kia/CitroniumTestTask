export interface IAuthLoginCreds {
    email: string;
    password: string;
}

export interface IAuthSignupCreds extends IAuthLoginCreds {
    name: string;
    passwordConfirm: string;
}

export interface IAuthResponse {
    token: string;
}
