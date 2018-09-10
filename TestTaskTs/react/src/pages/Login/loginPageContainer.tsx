import * as React from "react"
import { withRouter } from "react-router-dom";
import {RouteComponentProps} from "react-router";
import {createEmptyLogin, UserData} from "../../models/login";

interface State {
  loginInfo: UserData;
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
  }

  // public onChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   this.updateLoginField(e.target.name, e.target.value);
  // }

  public performLogin(): void {
    //if (isValidLogin(this.state.loginInfo)) {
    //   this.props.history.push("/pageB");
    // }

    // TODO : проверь!

    alert("asdfsdf");
  }

  public updateLoginField = (name, value) => {
    this.setState(
      {
        loginInfo: {
          ...this.state.loginInfo,
          [name]: value,
        }
      }
    );
  };

  public render() {
    return (
      <div>
        <form className="login_form" method="post">
          <h1 className="h3 mb-3 font-weight-normal">Авторизация</h1>
          <div className="text_boxs">
            <div className="input-group">
              <input className="form-control text_box"
                     placeholder="логин"
                     type="text"
                     id="username"
                     name="_username"
                     onChange={onChange(this.updateLoginField)}
                     value={this.state.loginInfo.login}
              />
            </div>
            <div className="input-group">
              <input className="form-control text_box"
                     placeholder="пароль"
                     type="password"
                     id="password"
                     name="_password"
                     onChange={onChange(this.updateLoginField)}
                     value={this.state.loginInfo.password}
              />
            </div>
            <div className="buttons">
              <button type="button"
                      className="btn btn-lg btn-primary btn-block"
                      onClick={this.performLogin}>
                Войти
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
});

