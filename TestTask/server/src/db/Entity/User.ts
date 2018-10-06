/**
 * Created by Илья on 07.08.2018.
 */
import {DataForCreation} from "../../Helpers";

export class User {
  public id: number;
  public name: string;
  public email: string;
  public password: string;
  public accessToken: string;
  constructor(data: DataForCreation) {
      this.id = data.getValue("id");
      this.name = data.getValue("name");
      this.email = data.getValue("email");
      this.password = data.getValue("password");
      this.accessToken = data.getValue("access_token");
  }
}
