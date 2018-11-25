import React from 'react';
import { connect } from 'react-redux';
import { Formik } from 'formik';
import Markdown from 'react-markdown';
import Router from 'next/router';
import fb from './../lib/load-firebase.js';
import {
  updateSelectedRecipe,
  deleteSelectedRecipe,
} from './../actions/recipeActions.js';
import Layout from '../components/Layout.js';
import Link from 'next/link';
import Ingredients from '../components/Ingredients.js';
import Steps from '../components/Steps.js';
import Uploader from './../components/Uploader';
//import { EditorState } from 'draft-js';
//import { RichEditorExample } from './../components/RichEditor';
import './../css/form-control.css';
import './../css/checkbox.css';
import './../css/recipe.css';

class Recipe extends React.Component {
  static async getInitialProps({ isServer, pathname, asPath, query }) {
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

  /*
  componentDidMount() {
    let { recipe } = this.props.store.selectedRecipe;
    if (recipe) {
      recipe.editorState = EditorState.createEmpty();
      this.props.dispatch({
        type: `UPDATE_RECIPE`,
        recipe: recipe,
      });
    }
  }
  */

  handleEditClick = () => {
    const { editing } = this.state;
    this.setState({
      editing: !editing,
    });
  };

  handleFormSubmit = async (values, actions) => {
    let { recipe } = this.props.store.selectedRecipe;

    const firebase = await fb();
    const firestore = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);

    values.lastUpdated = new Date();

    const addToFirebase = values.recipe;

    firestore
      .collection(`recipes`)
      .doc(recipe.id)
      .update(addToFirebase)
      .then(() => {
        console.log('success');
        actions.setSubmitting(false);

        if (recipe.title !== values.recipe.title) {
          let displayUrl = encodeURI(
            values.recipe.title.replace(/ /g, '-').toLowerCase(),
          );
          Router.push(`/recipe?id=${displayUrl}`, `/${displayUrl}/`);
        }

        recipe = values.recipe;

        this.props.dispatch(updateSelectedRecipe(recipe));

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
      let { recipe } = this.props.store.selectedRecipe;

      const firebase = await fb();
      const firestore = firebase.firestore();
      const settings = { timestampsInSnapshots: true };
      firestore.settings(settings);

      firestore
        .collection(`recipes`)
        .doc(recipe.id)
        .delete()
        .then(() => {
          this.props.dispatch(deleteSelectedRecipe(recipe));
        });
    }
  };

  render() {
    const { editing } = this.state;
    let { recipe } = this.props.store.selectedRecipe;
    const { isSignedIn, user } = this.props.store.session;

    let recipeImage;
    let headerImage;
    if (recipe.image) {
      let recipieImageUrl = recipe.image;
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

    return (
      <Layout
        title={recipe.title}
        description={recipe.text}
        ogImage={headerImage}
        url={this.props.asPath}
      >
        <div className="recipeWrapper">
          <Link href="/">
            <a className="backBtn">Start</a>
          </Link>

          {recipeImage}

          <div
            className={`recipeContent`}
            style={!recipeImage ? { paddingTop: '40px' } : null}
          >
            {(isSignedIn &&
              recipe.access &&
              recipe.access.includes(user.uid)) ||
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
                initialValues={{ recipe }}
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
                    <h1>Redigerar {recipe.title}</h1>
                    <form
                      onSubmit={handleSubmit}
                      className={`form-control-wrapper`}
                    >
                      <div>
                        <label
                          className={`checkboxWrapper`}
                          tabIndex={`0`}
                          onKeyPress={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              values.recipe.public = !values.recipe.public;
                              const input = e.target.children[0];
                              input.checked = !input.checked;
                            }
                          }}
                        >
                          Offentligt
                          <input
                            type={`checkbox`}
                            id={`recipe[public]`}
                            checked={values.recipe.public || false}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            tabIndex={`-1`}
                          />
                          <span className="checkmark" />
                        </label>
                      </div>

                      <label htmlFor={`recipe[image]`}>
                        Bild (adress till valfri extern källa)
                      </label>
                      <input
                        className={`form-control`}
                        id={`recipe[image]`}
                        autoComplete={`off`}
                        value={values.recipe.image || ''}
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
                            values.recipe.image = data.cdnUrl;
                          });
                        }}
                        onUploadComplete={data => {
                          console.log('Upload completed:', data);
                          values.recipe.image = data.cdnUrl;
                        }}
                      />

                      <label
                        htmlFor={`recipe[title]`}
                        style={{ marginTop: '20px' }}
                      >
                        Titel
                      </label>
                      <input
                        className={`form-control`}
                        id={`recipe[title]`}
                        value={values.recipe.title || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />

                      <label htmlFor={`recipe[text]`}>Text</label>
                      <textarea
                        className={`form-control stepEditTextArea`}
                        id={`recipe[text]`}
                        value={values.recipe.text || ''}
                        onChange={handleChange}
                      />

                      <h3>Sätt egen färg på receptet</h3>
                      <div className={`flexSplit`}>
                        <div>
                          <label htmlFor={`recipe['style'][color]`}>
                            Textfärg
                          </label>
                          <input
                            className={`form-control`}
                            id={`recipe['style'][color]`}
                            value={
                              (values.recipe.style &&
                                values.recipe.style.color) ||
                              '#000000'
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type={`color`}
                          />
                        </div>
                        <div>
                          <label htmlFor={`recipe['style'][background]`}>
                            Bakgrundsfärg
                          </label>
                          <input
                            className={`form-control`}
                            id={`recipe['style'][background]`}
                            value={
                              (values.recipe.style &&
                                values.recipe.style.background) ||
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
                          <label htmlFor={`recipe['cred']`}>Från</label>
                          <input
                            className={`form-control`}
                            id={`recipe['cred']`}
                            value={values.recipe.cred || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          />
                        </div>
                        <div>
                          <label htmlFor={`recipe['source']`}>Länk</label>
                          <input
                            className={`form-control`}
                            id={`recipe['source']`}
                            value={values.recipe.source || ''}
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
                <h1>{recipe.title}</h1>

                {recipe.text ? <Markdown source={recipe.text} /> : null}
              </div>
            )}

            <div className={`recipeIngredientsStepsWrapper`}>
              <Ingredients />

              <Steps />
            </div>

            {recipe.cred ? <div>{recipe.cred}</div> : null}

            {recipe.source ? (
              <div>
                <a href={recipe.source} target={`_blank`}>
                  {recipe.source}
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
