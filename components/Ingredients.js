import React from 'react';
import { connect } from 'react-redux';
import { Formik, FieldArray } from 'formik';
import fb from './../utils/load-firebase.js';
import { updateSelectedRecipe } from './../actions/recipeActions.js';
import './../css/dragdrop.scss';
import './../css/btn.scss';
import './../css/ingredients.scss';

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
    let { selectedRecipe } = this.props.store.recipes;

    const firebase = await fb();
    const firestore = firebase.firestore();

    const addToFirebase = {
      ingredients: values.ingredients,
      lastUpdated: new Date(),
    };

    firestore
      .collection(`recipes`)
      .doc(selectedRecipe.id)
      .update(addToFirebase)
      .then(() => {
        console.log('success');
        actions.setSubmitting(false);

        selectedRecipe.ingredients = values.ingredients;

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

  selectLatestIngredient() {
    setTimeout(() => {
      const list = document.querySelectorAll('.ingredientEdit');
      if (list && list.length) {
        const parent = list[list.length - 1];
        const target = parent.childNodes[0];
        if (target) target.focus();
      }
    }, 10);
  }

  render() {
    const { editing } = this.state;
    const { friendlyNames } = this.props.store.layout;
    const { selectedRecipe } = this.props.store.recipes;
    const { user } = this.props.store.session;
    let { ingredients } = selectedRecipe;
    if (!ingredients) {
      ingredients = [];
    }

    return (
      <div className="recipeIngredientsWrapper">
        {(user &&
          selectedRecipe.access &&
          selectedRecipe.access.includes(user.uid)) ||
        (user && user.admin) ? (
          <button
            onClick={this.handleEditClick}
            className={`recipeIngredrientsEditBtn btn btnIcon`}
          >
            <img src={`/static/img/edit.svg`} />
          </button>
        ) : null}

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
                                  id={`ingredients[${i}][${parameter}]`}
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
                            this.selectLatestIngredient();
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
          <ul className={`recipeIngredientsList`}>
            {ingredients
              ? ingredients.map((ingredient, i) => {
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
                })
              : null}
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
