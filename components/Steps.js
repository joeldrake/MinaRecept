import React from 'react';
import { connect } from 'react-redux';
import { Formik, FieldArray } from 'formik';
import Markdown from 'react-markdown';
import fb from './../utils/load-firebase.js';
import { updateSelectedRecipe } from './../actions/recipeActions.js';
import './../css/dragdrop.css';
import './../css/btn.css';
import './../css/form-control.css';
import './../css/steps.css';

class Steps extends React.Component {
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
      steps: values.steps,
      lastUpdated: new Date(),
    };

    firestore
      .collection(`recipes`)
      .doc(selectedRecipe.id)
      .update(addToFirebase)
      .then(() => {
        console.log('success');
        actions.setSubmitting(false);

        selectedRecipe.steps = values.steps;

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
      target.children[0].focus();
    }
    this.dragged = null;
  };

  handleDragEnd = () => {
    this.dragged = null;
  };

  handleItemClick = e => {
    const target = e.currentTarget;
    target.classList.toggle(`checked`);
  };

  autosize = e => {
    console.log(e.scrollHeight);
    /*
    e.target.style = 'height:auto; padding:0';
    el.style.cssText = 'height:' + e.scrollHeight + 'px';
    */
  };

  selectLatestStep() {
    setTimeout(() => {
      const list = document.querySelectorAll('.recipeStepsEdit form div');
      if (list && list.length) {
        const parent = list[list.length - 1];
        const target = parent.childNodes[0];
        if (target) target.focus();
      }
    }, 10);
  }

  render() {
    const { editing } = this.state;
    const { selectedRecipe } = this.props.store.recipes;
    let { steps } = selectedRecipe;
    if (!steps) {
      steps = [];
    }

    const { user } = this.props.store.session;

    return (
      <div className="recipeStepsWrapper">
        {(user &&
          selectedRecipe.access &&
          selectedRecipe.access.includes(user.uid)) ||
        (user && user.admin) ? (
          <button
            onClick={this.handleEditClick}
            className={`recipeStepsEditBtn btn btnIcon`}
          >
            <img src={`/static/img/edit.svg`} />
          </button>
        ) : null}

        <h2 className="recipeSubHeadline">Steg</h2>

        {editing ? (
          <div className={`recipeStepsEdit`}>
            <Formik initialValues={{ steps }} onSubmit={this.handleFormSubmit}>
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
                    name={`steps`}
                    render={arrayHelpers => (
                      <div>
                        {values.steps.map((step, i) => {
                          return (
                            <div
                              className={`stepEdit`}
                              draggable={true}
                              onDragStart={this.handleDragStart(i)}
                              onDrop={this.handleDrop}
                              onDragOver={this.handleDragOver(arrayHelpers, i)}
                              onDragLeave={this.handleDragLeave(
                                arrayHelpers,
                                i,
                              )}
                              onDragEnd={this.handleDragEnd}
                              key={i}
                            >
                              <textarea
                                className={`form-control stepEditTextArea`}
                                onKeyPress={this.autosize}
                                name={`steps[${i}][text]`}
                                value={values.steps[i]['text'] || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                key={`step${i}`}
                              />

                              <button
                                type="button"
                                onClick={() => arrayHelpers.remove(i)}
                                className={`removeStepBtn btn btnIcon`}
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
                              text: '',
                            });
                            this.selectLatestStep();
                          }}
                          className={`addStepBtn btn btnIcon`}
                        >
                          <img src={`/static/img/add.svg`} />
                        </button>
                      </div>
                    )}
                  />

                  <button
                    type={`submit`}
                    className={`saveStepsBtn btn`}
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
          <ol className={`recipeSteps`}>
            {steps
              ? steps.map((step, i) => {
                  let renderStep = '';
                  let addedClass = ``;
                  let canClick = true;
                  if (step.text) {
                    renderStep = step.text;
                  }
                  if (step.headline) {
                    //dont add click function if its a headline
                    addedClass += ` headline`;
                  }
                  return (
                    <li
                      className={`step${addedClass}`}
                      key={i}
                      onClick={this.handleItemClick}
                    >
                      <div className={`stepMarkdownWrapper`}>
                        <Markdown source={renderStep} />
                      </div>
                    </li>
                  );
                })
              : null}
          </ol>
        )}
      </div>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Steps);
