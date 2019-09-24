import React from 'react';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import { handleSignIn, handleSignUp } from './../actions/sessionActions.js';
import Router from 'next/router';
import './../css/btn.scss';
import './../css/form-control.scss';
import './../css/loginform.scss';

class LoginForm extends React.Component {
  state = {
    newSignUp: false,
  };

  handleSignUpClick = e => {
    e.preventDefault();
    this.setState({
      newSignUp: true,
    });
  };

  handleFormSubmit = (values, actions) => {
    const { newSignUp } = this.state;

    if (newSignUp) {
      this.props.dispatch(handleSignUp(values)).then(data => {
        console.log(data);
        const { code } = data;
        if (code === `auth/user-not-found`) {
          this.setState({
            newSignUp: true,
          });
        } else if (code === `auth/wrong-password`) {
        } else if (code === `auth/too-many-requests`) {
        }
        actions.setSubmitting(false);
      });
    } else {
      this.props.dispatch(handleSignIn(values)).then(data => {
        console.log(data);
        const { code } = data;
        if (code === `auth/user-not-found`) {
          //should sign up new user
          this.setState({
            newSignUp: true,
          });
        }
        actions.setSubmitting(false);
      });
    }
  };

  renderForm() {
    const { newSignUp } = this.state;
    const { router } = Router;
    return (
      <React.Fragment>
        <h3 className={`menuHeadline`}>
          {newSignUp ? `Skapa nytt konto` : `Logga in`}
        </h3>
        <Formik onSubmit={this.handleFormSubmit}>
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit} className={`keepMenuOnClick`}>
              <label htmlFor={`email`} className={`keepMenuOnClick`}>
                Epost
              </label>
              <input
                type={`email`}
                className={`form-control keepMenuOnClick`}
                id={`email`}
                value={values.email || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required={true}
              />

              <label htmlFor={`password`} className={`keepMenuOnClick`}>
                Lösenord
              </label>
              <input
                type={`password`}
                className={`form-control keepMenuOnClick`}
                id={`password`}
                value={values.password || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                required={true}
              />

              <button
                type={`submit`}
                className={`btn btnBlock keepMenuOnClick`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className={`spinner onBtn keepMenuOnClick`} />
                ) : null}
                {newSignUp ? `Skapa nytt konto` : `Logga in`}
              </button>
            </form>
          )}
        </Formik>
        {!newSignUp ? (
          <div>
            <br />
            <a
              href={router.asPath}
              onClick={this.handleSignUpClick}
              className={`keepMenuOnClick`}
            >
              Skapa nytt konto
            </a>
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  render() {
    return (
      <div className={`loginForm keepMenuOnClick`}>{this.renderForm()}</div>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(LoginForm);
