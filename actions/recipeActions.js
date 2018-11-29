import Router from 'next/router';
import fb from './../lib/load-firebase.js';
import { makePermalink } from './../lib/functions.js';
import { unionBy } from 'lodash';

export function addNewRecipe() {
  return async (dispatch, getState) => {
    const { legalCharacters, user } = getState().session;
    const title = prompt(`Ange namn på receptet`);

    /*
    //todo, fix the legaCharacters check

    console.log(!title.match(legalCharacters));
    if (!title.match(legalCharacters)) {
      //illegal characters used, bail out
      alert(
        `Du kan endast ha bokstäver och siffror i namnet. Var god försök igen med ett annat namn.`,
      );
      return false;
    }
    */

    if (title && title !== `` && user && user.uid) {
      const firebase = await fb();
      const firestore = firebase.firestore();
      const settings = { timestampsInSnapshots: true };
      firestore.settings(settings);

      let newRecipe = {
        title,
        permalink: makePermalink(title),
        public: false,
        date: new Date(),
        lastUpdated: new Date(),
        owner: user.uid,
      };

      firestore
        .collection(`recipes`)
        .add(newRecipe)
        .then(docRef => {
          newRecipe.id = docRef.id;

          dispatch(addedNewRecipe(newRecipe));
        })
        .catch(error => {
          console.error('Error adding document: ', error);
        });
    }
  };
}

export function addedNewRecipe(recipe) {
  return async (dispatch, getState) => {
    if (recipe) {
      let { usersRecipes } = getState().recipes;

      dispatch({
        type: `UPDATE_SELECTED_RECIPE`,
        selectedRecipe: recipe,
      });

      //adding a new recipe always starts in userRecipes, so dont have to update publicRecipes here
      usersRecipes.push(recipe);

      dispatch({
        type: `UPDATE_USERS_RECIPES`,
        usersRecipes,
      });

      Router.push(`/recipe?id=${recipe.permalink}`, `/${recipe.permalink}/`);
    }
  };
}

export function deleteSelectedRecipe(recipe) {
  return async (dispatch, getState) => {
    if (recipe) {
      let { usersRecipes, publicRecipes } = getState().recipes;

      publicRecipes = publicRecipes.filter(r => {
        return recipe.id !== r.id;
      });

      usersRecipes = usersRecipes.filter(r => {
        return recipe.id !== r.id;
      });

      dispatch({
        type: `UPDATE_PUBLIC_RECIPES`,
        publicRecipes,
      });

      dispatch({
        type: `UPDATE_USERS_RECIPES`,
        usersRecipes,
      });

      Router.push(`/`);
    }
  };
}

export function fetchRecipe(id) {
  return async (dispatch, getState) => {
    const { user } = getState().session;
    const firebase = await fb();
    const firestore = firebase.firestore();

    const settings = {
      timestampsInSnapshots: true,
    };
    firestore.settings(settings);

    //fungerar
    //.doc('Afrikansk kikärtsgryta 1527697807704')
    //todo: fix the permission in firebase

    let selectedRecipe = await firestore
      .collection(`recipes`)
      .where('permalink', '==', id)
      .get()
      .then(data => {
        const returnData = data.docs.map((recipe, i) => {
          let recipeData = recipe.data();
          recipeData.id = recipe.id;

          return recipeData;
        });

        const publicRecipe = returnData[0].public;
        const recipeOwner = returnData[0].owner;
        const loggedInUid = user && user.uid;

        if (
          returnData.length &&
          (publicRecipe || recipeOwner === loggedInUid)
        ) {
          return returnData[0];
        } else {
          return {};
        }
      })
      .catch(e => {
        console.log(e);
        return {};
      });

    dispatch({
      type: `UPDATE_SELECTED_RECIPE`,
      selectedRecipe,
    });

    return;
  };
}

export function fetchPrivateRecipes() {
  return async (dispatch, getState) => {
    const { user } = getState().session;

    if (!user) {
      dispatch({
        type: `UPDATE_USERS_RECIPES`,
        usersRecipes: [],
      });

      return;
    }

    /*
    const { router } = Router;
    let currentRecipe;
    if (router && router.query && router.query.id) {
      currentRecipe = router.query.id;
    }
    */

    const firebase = await fb();
    const firestore = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);

    let usersRecipes = await firestore
      .collection(`recipes`)
      .where('owner', '==', user.uid)
      .orderBy(`date`, `asc`)
      .get()
      .then(data => {
        const returnData = data.docs.map(recipe => {
          let recipeData = recipe.data();

          //see if id can be gotten in a better way
          recipeData.id = recipe.id;

          return recipeData;
        });

        return returnData;
      })
      .catch(e => {
        console.log(e);
        return [];
      });

    //const mergedRecipes = unionBy(data, privateRecepies, 'title');

    dispatch({
      type: `UPDATE_USERS_RECIPES`,
      usersRecipes,
    });
  };
}

export function fetchPublicRecipes() {
  return async (dispatch, getState) => {
    const firebase = await fb();
    const firestore = firebase.firestore();

    const settings = {
      timestampsInSnapshots: true,
    };
    firestore.settings(settings);

    let publicRecipes = await firestore
      .collection(`recipes`)
      .where('public', '==', true)
      .orderBy(`date`, `asc`)
      .get()
      .then(data => {
        //var source = data.metadata.fromCache ? 'local cache' : 'server';
        //console.log('Data came from ' + source);

        const returnData = data.docs.map((recipe, i) => {
          let recipeData = recipe.data();
          recipeData.id = recipe.id;

          return recipeData;
        });

        return returnData;
      })
      .catch(e => {
        console.log(e);
        return [];
      });

    dispatch({
      type: `UPDATE_PUBLIC_RECIPES`,
      publicRecipes,
    });
  };
}

export function updateSelectedRecipe(recipe) {
  return async (dispatch, getState) => {
    if (recipe) {
      let { usersRecipes, publicRecipes } = getState().recipes;

      dispatch({
        type: `UPDATE_SELECTED_RECIPE`,
        selectedRecipe: recipe,
      });

      const publicIndex = publicRecipes.findIndex(e => e.id === recipe.id);
      const usersIndex = usersRecipes.findIndex(e => e.id === recipe.id);

      if (recipe.public) {
        //recipe should be in public recipes
        if (publicIndex > -1) {
          //great, it is, just update it
          publicRecipes[publicIndex] = recipe;
        } else {
          //its not in there, add it
          publicRecipes.push(recipe);
        }
        dispatch({
          type: `UPDATE_PUBLIC_RECIPES`,
          publicRecipes,
        });
      } else {
        //not public, check if it is in list, if so remove it
        if (publicIndex > -1) {
          publicRecipes = publicRecipes.filter(r => {
            return recipe.id !== r.id;
          });
          dispatch({
            type: `UPDATE_PUBLIC_RECIPES`,
            publicRecipes,
          });
        }
      }

      if (usersIndex > -1) {
        //if user is updateing the recipe then it _should_ always have an index
        usersRecipes[usersIndex] = recipe;

        dispatch({
          type: `UPDATE_USERS_RECIPES`,
          usersRecipes,
        });
      }
    }
  };
}
