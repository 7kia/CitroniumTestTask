/**
 * Created by Илья on 09.09.2018.
 */
import {NODE_SERVER_URL} from "../../constants/pageGenerator";
import Dictionary from "typescript-collections/dist/lib/Dictionary";

export class AuthenticationDataGenerator {
  public static findUser(name: string, password: string): Dictionary<string, string> {
    const Http: XMLHttpRequest = new XMLHttpRequest();
    const url: string = NODE_SERVER_URL
      + "get-user?name=" + name
      + "&password=" + password;
    Http.open("GET", url);
    Http.send();

    let userData: Dictionary<string, string> = new Dictionary<string, string>();
    Http.onreadystatechange = (err) => {
      if ((Http.readyState === 4) && (Http.status === 200)) {
        console.log(Http.response);
        userData.setValue("name", Http.response.name);
        userData.setValue("password", Http.response.password);
      }
    };
    return userData;
  }
}