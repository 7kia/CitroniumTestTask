/**
 * Created by Илья on 07.08.2018.
 */
export class User {
    public id: number;
    public name: string;
    public email: string;
    public password: string;
    public accessToken: string;
    constructor(
        id: number,
        name: string,
        email: string,
        password: string,
        accessToken: string
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.accessToken = accessToken;
    }
}
