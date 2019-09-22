import React from 'react';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import Markdown from 'react-markdown';
import Router from 'next/router';
import fb from './../utils/load-firebase.js';
import {
  fetchRecipe,
  updateSelectedRecipe,
  deleteSelectedRecipe,
} from './../actions/recipeActions.js';
import Layout from '../components/Layout.js';
import Link from 'next/link';
import Ingredients from '../components/Ingredients.js';
import Steps from '../components/Steps.js';
import Menu from './../components/Menu.js';
import Uploader from './../components/Uploader';
import { makePermalink } from './../utils/functions.js';
import './../css/form-control.css';
import './../css/checkbox.css';
import './../css/recipe.css';

class Recipe extends React.Component {
  static async getInitialProps({ store, isServer, pathname, asPath, query }) {
    if (isServer) {
      await store.dispatch(fetchRecipe(query.id));
    }

    return {
      isServer,
      pathname,
      asPath,
      query,
    };
  }

  state = {
    editing: false,
  };

  handleEditClick = () => {
    const { editing } = this.state;
    this.setState({
      editing: !editing,
    });
  };

  handleFormSubmit = async (values, actions) => {
    let { selectedRecipe } = this.props.store.recipes;

    const firebase = await fb();
    const firestore = firebase.firestore();

    values.selectedRecipe.lastUpdated = new Date();

    values.selectedRecipe.permalink = makePermalink(
      values.selectedRecipe.title,
    );

    const addToFirebase = values.selectedRecipe;

    firestore
      .collection(`recipes`)
      .doc(selectedRecipe.id)
      .update(addToFirebase)
      .then(() => {
        console.log('success');
        actions.setSubmitting(false);

        if (selectedRecipe.title !== values.selectedRecipe.title) {
          let displayUrl = values.selectedRecipe.permalink;

          const href = `/?id=${displayUrl}`;
          const as = `/${displayUrl}/`;
          Router.push(href, as);
        }

        selectedRecipe = values.selectedRecipe;

        this.props.dispatch(updateSelectedRecipe(selectedRecipe));

        this.setState({
          editing: false,
        });
      })
      .catch(error => {
        console.log('error', error);
        actions.setSubmitting(false);
      });
  };

  handleDelRecipeClick = async () => {
    const userConfirmed = confirm('Vill du radera receptet?');
    if (userConfirmed) {
      let { selectedRecipe } = this.props.store.recipes;

      const firebase = await fb();
      const firestore = firebase.firestore();

      firestore
        .collection(`recipes`)
        .doc(selectedRecipe.id)
        .delete()
        .then(() => {
          this.props.dispatch(deleteSelectedRecipe(selectedRecipe));
        });
    }
  };

  render() {
    const { editing } = this.state;
    let { selectedRecipe = {}, usersRecipesLoaded } = this.props.store.recipes;
    const { user } = this.props.store.session;

    let recipeImage;
    let headerImage;
    if (selectedRecipe.image) {
      let recipieImageUrl = selectedRecipe.image;
      headerImage = recipieImageUrl;
      if (recipieImageUrl.includes(`ucarecdn.com`)) {
        //uploadcareUrl, add enhance and resize parameter
        recipieImageUrl += `-/enhance/50/-/resize/1000x/`;
        headerImage += `/-/enhance/50/-/scale_crop/1200x630/center/`;
      }

      recipeImage = (
        <div
          className="recipeImage"
          style={{
            backgroundImage: `url(${recipieImageUrl})`,
          }}
        />
      );
    }

    if (usersRecipesLoaded && !selectedRecipe.id) {
      return (
        <Layout>
          <div className="recipeWrapper">
            <Link href="/">
              <a className="backBtn">Start</a>
            </Link>
            <h1 style={{ padding: '50px 20px', margin: '0' }}>
              Kunde ej hitta recept...
            </h1>
          </div>
        </Layout>
      );
    }

    return (
      <Layout
        title={selectedRecipe.title}
        description={selectedRecipe.text}
        ogImage={headerImage}
        url={this.props.asPath}
      >
        {user ? (
          <div className={`widthWrapper topWrapper`}>
            <Menu />
          </div>
        ) : null}

        <div className="recipeWrapper widthWrapper">
          <Link href="/">
            <a className="backBtn">Start</a>
          </Link>

          {recipeImage}

          <div
            className={`recipeContent`}
            style={!recipeImage ? { paddingTop: '40px' } : null}
          >
            {(user &&
              selectedRecipe.access &&
              selectedRecipe.access.includes(user.uid)) ||
            (user && user.admin) ? (
              <button
                onClick={this.handleEditClick}
                className={`recipeEditBtn btn btnIcon`}
              >
                <img src={`/static/img/edit.svg`} />
              </button>
            ) : null}

            {editing ? (
              <Formik
                initialValues={{ selectedRecipe }}
                onSubmit={this.handleFormSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  setFieldValue,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                }) => (
                  <div>
                    <h1>Redigerar {selectedRecipe.title}</h1>
                    <form
                      onSubmit={handleSubmit}
                      className={`form-control-wrapper`}
                    >
                      <div>
                        <label className={`checkboxWrapper`} tabIndex={`0`}>
                          Offentligt
                          <input
                            type={`checkbox`}
                            id={`selectedRecipe[public]`}
                            checked={
                              values &&
                              values.selectedRecipe &&
                              values.selectedRecipe.public
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                            tabIndex={`-1`}
                          />
                          <span className="checkmark" />
                        </label>
                      </div>

                      <label
                        htmlFor={`selectedRecipe[title]`}
                        style={{ marginTop: '20px' }}
                      >
                        Titel
                      </label>
                      <input
                        className={`form-control`}
                        id={`selectedRecipe[title]`}
                        value={values.selectedRecipe.title || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <label htmlFor={`selectedRecipe[text]`}>Text</label>
                      <textarea
                        className={`form-control stepEditTextArea`}
                        id={`selectedRecipe[text]`}
                        value={values.selectedRecipe.text || ''}
                        onChange={handleChange}
                      />

                      <label htmlFor={`selectedRecipe[image]`}>
                        Bild (adress till valfri extern källa)
                      </label>
                      <input
                        className={`form-control`}
                        id={`selectedRecipe[image]`}
                        autoComplete={`off`}
                        value={values.selectedRecipe.image || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="https://valfriadress.se/bild.jpg"
                      />

                      <Uploader
                        id={`uploadcareUploader`}
                        name={`uploadcareUploader`}
                        data-tabs={`file camera url`}
                        data-crop={`free`}
                        data-images-only
                        onChange={promise => {
                          promise.then(data => {
                            console.log('File changed: ', data);
                            values.selectedRecipe.image = data.cdnUrl;
                          });
                        }}
                        onUploadComplete={data => {
                          console.log('Upload completed:', data);
                          values.selectedRecipe.image = data.cdnUrl;
                        }}
                      />

                      <h3>Sätt egen färg på receptet</h3>
                      <div className={`flexSplit`}>
                        <div>
                          <label htmlFor={`selectedRecipe['style'][color]`}>
                            Textfärg
                          </label>
                          <input
                            className={`form-control`}
                            id={`selectedRecipe['style'][color]`}
                            value={
                              (values.selectedRecipe.style &&
                                values.selectedRecipe.style.color) ||
                              '#000000'
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type={`color`}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`selectedRecipe['style'][background]`}
                          >
                            Bakgrundsfärg
                          </label>
                          <input
                            className={`form-control`}
                            id={`selectedRecipe['style'][background]`}
                            value={
                              (values.selectedRecipe.style &&
                                values.selectedRecipe.style.background) ||
                              '#f2eee9'
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type={`color`}
                          />
                        </div>
                      </div>

                      <h3>Visa vem/var som receptet kommer från</h3>
                      <div className={`flexSplit`}>
                        <div>
                          <label htmlFor={`selectedRecipe['cred']`}>Från</label>
                          <input
                            className={`form-control`}
                            id={`selectedRecipe['cred']`}
                            value={values.selectedRecipe.cred || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div>
                          <label htmlFor={`selectedRecipe['source']`}>
                            Länk
                          </label>
                          <input
                            className={`form-control`}
                            id={`selectedRecipe['source']`}
                            value={values.selectedRecipe.source || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                      </div>
                      <button
                        type={`submit`}
                        className={`saveRecipeBtn btn`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className={`spinner onBtn`} />
                        ) : null}
                        Spara
                      </button>

                      <button
                        type={`button`}
                        className={`delRecipeBtn btn btnDanger`}
                        onClick={this.handleDelRecipeClick}
                      >
                        Radera recept
                      </button>

                      <div className={`clearfix`} />
                      <hr />
                    </form>
                  </div>
                )}
              </Formik>
            ) : (
              <div>
                <h1>{selectedRecipe.title}</h1>

                {selectedRecipe.text ? (
                  <Markdown source={selectedRecipe.text} />
                ) : null}
              </div>
            )}

            {selectedRecipe.id ? (
              <div className={`recipeIngredientsStepsWrapper`}>
                <Ingredients />

                <Steps />
              </div>
            ) : null}

            {selectedRecipe.cred ? <div>{selectedRecipe.cred}</div> : null}

            {selectedRecipe.source ? (
              <div>
                <a
                  href={selectedRecipe.source}
                  className={`recipe__sourceLink`}
                  target={`_blank`}
                >
                  {selectedRecipe.source}
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </Layout>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Recipe);
