import React from 'react';
import { connect } from 'react-redux';
import { Formik, FieldArray } from 'formik';
import fb from './../lib/load-firebase.js';
import { updateSelectedRecipe } from './../actions/recipeActions.js';
import './../css/dragdrop.css';
import './../css/btn.css';
import './../css/ingredients.css';

class Ingredients extends React.Component {
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
    let { recipe } = this.props.store.selectedRecipe;

    const firebase = await fb();
    const firestore = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);

    const addToFirebase = {
      ingredients: values.ingredients,
      lastUpdated: new Date(),
    };

    firestore
      .collection(`recipes`)
      .doc(recipe.id)
      .update(addToFirebase)
      .then(() => {
        console.log('success');
        actions.setSubmitting(false);

        recipe.ingredients = values.ingredients;

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

  handleDragStart = i => e => {
    this.dragged = i;
  };

  handleDragOver = (arrayHelpers, i) => e => {
    e.preventDefault();
    const target = e.currentTarget;
    if (!target.classList.contains('draggedOver')) {
      target.classList.add('draggedOver');
      if (this.dragged !== i) {
        arrayHelpers.move(this.dragged, i);
      }
    }
  };

  handleDragLeave = (arrayHelpers, i) => e => {
    e.preventDefault();
    const target = e.currentTarget;
    if (target.classList.contains('draggedOver')) {
      target.classList.remove('draggedOver');
      if (this.dragged !== i) {
        arrayHelpers.move(i, this.dragged);
      }
    }
  };

  handleDrop = e => {
    e.preventDefault();
    const target = e.currentTarget;
    if (target.classList.contains('draggedOver')) {
      target.classList.remove('draggedOver');
      target.children[2].focus();
    }
    this.dragged = null;
  };

  handleDragEnd = () => {
    this.dragged = null;
  };

  render() {
    const { editing } = this.state;
    const { friendlyNames } = this.props.store.layout;
    const { recipe } = this.props.store.selectedRecipe;
    let { ingredients } = recipe;

    return (
      <div className="recipeIngredientsWrapper">
        <button
          onClick={this.handleEditClick}
          className={`recipeIngredrientsEditBtn btn btnIcon`}
        >
          <img src={`/static/img/edit.svg`} />
        </button>
        <h2 className="recipeSubHeadline nice_text">Ingredienser</h2>

        {editing ? (
          <div className="recipeIngredientsListEdit">
            <Formik
              initialValues={{ ingredients }}
              onSubmit={this.handleFormSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit}>
                  <FieldArray
                    name={`ingredients`}
                    render={arrayHelpers => (
                      <div>
                        {values.ingredients.map((ingredient, i) => {
                          let fields = [];
                          for (const parameter in ingredient) {
                            if (parameter !== 'headline') {
                              const placeholder =
                                friendlyNames[parameter] || '';
                              fields.push(
                                <input
                                  name={`ingredients[${i}][${parameter}]`}
                                  placeholder={placeholder}
                                  value={values.ingredients[i][parameter] || ''}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  className={`input-${parameter}`}
                                  key={`${parameter}${i}`}
                                />,
                              );
                            }
                          }

                          return (
                            <div
                              draggable={true}
                              onDragStart={this.handleDragStart(i)}
                              onDrop={this.handleDrop}
                              onDragOver={this.handleDragOver(arrayHelpers, i)}
                              onDragLeave={this.handleDragLeave(
                                arrayHelpers,
                                i,
                              )}
                              onDragEnd={this.handleDragEnd}
                              className={`ingredientEdit`}
                              key={i}
                            >
                              {fields}
                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(i)}
                                className={`removeIngredientBtn btn btnIcon`}
                              >
                                <img src={`/static/img/trash.svg`} />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type={`button`}
                          disabled={isSubmitting}
                          onClick={() => {
                            arrayHelpers.push({
                              amount: '',
                              headline: false,
                              unit: '',
                              what: '',
                            });
                          }}
                          className={`addIngredientBtn btn btnIcon`}
                        >
                          <img src={`/static/img/add.svg`} />
                        </button>
                      </div>
                    )}
                  />

                  <button
                    type={`submit`}
                    className={`saveIngredientsBtn btn`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <div className={`spinner onBtn`} /> : null}
                    Spara
                  </button>
                </form>
              )}
            </Formik>
          </div>
        ) : (
          <ul className="recipeIngredientsList">
            {ingredients.map((ingredient, i) => {
              const emptyLine =
                ingredient.amount === '' &&
                ingredient.unit === '' &&
                ingredient.what === '';
              return (
                <li
                  className={`ingredient` + (emptyLine ? ` noBorder` : ``)}
                  key={i}
                >
                  <span className={`nice_text`}>
                    {ingredient.amount}
                    {` `}
                    {ingredient.unit}
                  </span>

                  <span className={`nice_text`}>{ingredient.what}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Ingredients);
