/**
 * Created by Илья on 07.08.2018.
 */
export class User {
    public id: number;
    public name: string;
    public email: string;
    public password: string;
    public accessToken: string;
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.accessToken = data.access_token;
    }
}
