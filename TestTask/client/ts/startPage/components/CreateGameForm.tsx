"use strict";

import * as React from "react";
import {FormErrors, FormProps, reduxForm, SubmitHandler as ISubmitHandler} from "redux-form";
import {Alert, Button, Form, Panel} from "react-bootstrap";
import Input from "../../common/forms/fields/Input";
import * as validators from "../../common/forms/validators";

export interface IFormData {
  size: string;
}

interface ICreateGameFormState {
  createError: string | null;
}

interface IFormProps extends FormProps<IFormData, {}, {}> {}

interface ICreateGameFormProps extends IFormProps {
  onSubmit: (data: IFormData, handleError: (message: string) => void) => void;
  closePopup: () => void;
}

function validate(formData: IFormData): FormErrors<IFormData> {
  const { size } = formData;
  let errors: IFormData = { size: "" };

  errors.size = validators.required(size);

  return errors;
}

@reduxForm<IFormData, ICreateGameFormProps, ICreateGameFormState>({
  form: "CreateGameForm",
  validate
})
class CreateGameForm extends React.Component<ICreateGameFormProps, ICreateGameFormState> {
  constructor(props: ICreateGameFormProps) {
    super(props);

    this.state = {
      createError: null,
    };
  }

  private setErrorMessage = (message: string) => {
    this.setState({createError: message});
  };

  private submit: ISubmitHandler<IFormData, ICreateGameFormProps, {}> = (formData: IFormData): void => {
    this.props.onSubmit(formData, this.setErrorMessage);
  };

  private renderCreateError(error: string): JSX.Element {
    return <Alert bsStyle="warning">{error}</Alert>;
  }

  public render(): JSX.Element {
    const { handleSubmit } = this.props;
    const { createError } = this.state;

    return (
      <Form onSubmit={handleSubmit && handleSubmit(this.submit)}>
        {createError ? this.renderCreateError(createError) : null}
        <Input name="size" label="Size"/>

        <div className="buttons">
          <Button bsStyle="primary" bsSize="lg" type="submit">
            Create
          </Button>
          <Button
            className="float-right"
            bsStyle="primary"
            bsSize="lg"
            onClick={this.props.closePopup}
          >
            Cancel
          </Button>
        </div>
      </Form>
    );
  }
}

export default CreateGameForm;
