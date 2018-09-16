import * as React from "react"
import {Link, withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {createEmptyLogin, IUserData} from "../../models/login";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {AuthenticationDataGenerator} from "./AuthenticationDataGenerator";
import { If } from "react-control-statements";

interface State {
  loginInfo: IUserData;
}

interface Props extends RouteComponentProps<void> {
  //history: history;
}
// const onChange = (updateField: (name: string, value: string) => void)
//   => (event: React.ChangeEvent<HTMLInputElement>) => {
//   updateField(event.target.name, event.target.value);
// };

const onChange = (updateField: (name: string, value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
  updateField(e.target.name, e.target.value);
};

export const LoginPageContainer = withRouter(class LoginPageContainerInner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { loginInfo: createEmptyLogin() };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    //this.setState({ [name]: value });
    this.setState({loginInfo: {
      ...this.state.loginInfo,
      [name]: value,
    }});
  }

  public async handleSubmit(): Promise<void> {
    this.state.loginInfo.submitted = true;
    const { login, password } = this.state.loginInfo;
    try {
      if (login && password) {
        const userData: {[id: string]: any} = await AuthenticationDataGenerator.findUser(login);
        if (userData.password === password) {
          console.log(userData.name);
          console.log(userData.password);
          alert("authorization");
          this.state.loginInfo.errorMessage = "";
        } else {
          this.state.loginInfo.errorMessage = "Password incorrect";
        }
      }
    } catch (error) {
      this.state.loginInfo.errorMessage = error;
      //alert(error);
    }
  }

  public render() {
    const { login, password, submitted, errorMessage } = this.state.loginInfo;
    return (
      <div>
        <h1 className="h3 mb-3 font-weight-normal">Авторизация</h1>
        <If condition={errorMessage !== ""}>
          <div className="help-block">{errorMessage}</div>
        </If>
          <form className="login_form" method="post">
            <div className={"form-group text_box" + (submitted && !login ? " has-error" : "")}>
              <label htmlFor="login">Username</label>
              <input type="text"
                     placeholder="Enter Username"
                     className="form-control"
                     name="login"
                     value={login}
                     onChange={this.handleChange}
                     required/>
              <If condition={submitted && !login}>
                <div className="help-block">Username is required</div>
              </If>
            </div>
            <div className={"form-group text_box" + (submitted && !password ? " has-error" : "")}>
              <label htmlFor="password">Password</label>
              <input type="password"
                     placeholder="Enter Password"
                     className="form-control"
                     name="password"
                     value={password}
                     onChange={this.handleChange}
                     required/>
              <If condition={submitted && !password}>
                <div className="help-block">Username is required</div>
              </If>
            </div>
            <div className="buttons">
              <button type="button"
                      className="btn btn-lg btn-primary btn-block"
                      onClick={this.handleSubmit}>
                Войти
              </button>
            </div>
          </form>
      </div>
    );
  }
});

