/**
 * Created by Илья on 08.09.2018.
 */
import * as React from "react";
import "./styles/register.css";
// interface IProps {
// 	title: string;
// }
// <IProps>

class StartPage extends React.Component {
  // constructor(props: IProps) {
  // 	super(props);
  // }

  public render() {
    return (
      <div class="registration-form">
        <h1 class="h3 mb-3 font-weight-normal">Регистрация</h1>
        {/*{{ form_start(form) }}*/}
        <div class="registration-form__text_boxes">
          <div class="mb-3">
            <label for="login">Логин</label>
            {/*{{ form_widget(form.username) }}*/}
            {/*{{ form_errors(form.username) }}*/}
          </div>
          <div class="mb-3">
            <label for="email">Почта</label>
            {/*{{ form_widget(form.email) }}*/}
            {/*{{ form_errors(form.email) }}*/}
          </div>
          <div class="mb-3">
            <label for="password">Пароль</label>
            {/*{{ form_widget(form.plainPassword.first) }}*/}
            {/*{{ form_errors(form.plainPassword.first) }}*/}
          </div>
          <div class="mb-3">
            <label for="second-password">Подтвердите пароль</label>
            {/*{{ form_widget(form.plainPassword.second) }}*/}
            {/*{{ form_errors(form.plainPassword.second) }}*/}
          </div>

        </div>
        <div class="registration-form__buttons">
          <button class="btn btn-primary btn-lg btn-block" type="submit">Регистрация</button>
        </div>
        {/*{{ form_end(form) }}*/}
      </div>
    );
  }
}

export default StartPage;