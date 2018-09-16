/**
 * Created by Илья on 09.09.2018.
 */
import {NODE_SERVER_URL, REACT_SERVER_URL} from "../../constants/pageGenerator";
import axios from "axios";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

type Json = {[id: string]: any};

export class AuthenticationDataGenerator {
  public static async findUser(name: string): Promise<Json> {
   return new Promise<Json>(async (resolve, reject) => {
     let url: string = NODE_SERVER_URL + "get-user?name=" + name;
     const response: Json = await axios.get(url);

     if (response.data.hasOwnProperty("name") && response.data.hasOwnProperty("password")) {
       resolve(response.data);
     } else {
       reject("User with name \"" + name + "\" not found");
     }
    });
  }
}
