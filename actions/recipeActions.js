import Router from 'next/router';
import fb from './../lib/load-firebase.js';
import { unionBy } from 'lodash';

export function deleteSelectedRecipe(recipe) {
  return async (dispatch, getState) => {
    if (recipe) {
      let recipes = getState().recipes.data;

      const updatedRecipes = recipes.filter(r => {
        return recipe.id !== r.id;
      });

      dispatch({
        type: `UPDATE_RECIPES`,
        data: updatedRecipes,
      });

      Router.push(`/`);
    }
  };
}

export function addedNewRecipe(recipe) {
  return async (dispatch, getState) => {
    if (recipe) {
      let recipes = getState().recipes.data;

      dispatch({
        type: `UPDATE_RECIPE`,
        recipe,
      });

      recipes.push(recipe);

      dispatch({
        type: `UPDATE_RECIPES`,
        data: recipes,
      });

      let displayUrl = encodeURI(recipe.title.replace(/ /g, '-').toLowerCase());
      Router.push(`/recipe?id=${displayUrl}`, `/${displayUrl}/`);
    }
  };
}

export function fetchPrivateRecipes() {
  return async (dispatch, getState) => {
    const { user } = getState().session;
    const { data } = getState().recipes;

    if (!user) {
      return;
    }

    const { router } = Router;
    let currentRecipe;
    if (router && router.query && router.query.id) {
      currentRecipe = router.query.id;
    }

    const firebase = await fb();
    const firestore = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);

    let privateRecepies = await firestore
      .collection(`recipes`)
      .where('owner', '==', user.uid)
      .orderBy(`date`, `asc`)
      .get()
      .then(data => {
        const returnData = data.docs.map(recipe => {
          let recipeData = recipe.data();

          //see if id can be gotten in a better way
          recipeData.id = recipe.id;

          //check if user is on this recepie
          let fixedTitle = recipeData.title.replace(/ /g, '-').toLowerCase();

          if (currentRecipe && currentRecipe === fixedTitle) {
            dispatch({
              type: `UPDATE_RECIPE`,
              recipe: recipeData,
            });
          }

          return recipeData;
        });

        return returnData;
      });

    const mergedRecipes = unionBy(data, privateRecepies, 'title');

    dispatch({
      type: `UPDATE_RECIPES`,
      data: mergedRecipes,
    });
    dispatch({
      type: `PRIVATE_LOADED`,
      privateLoaded: true,
    });
  };
}

export function fetchPublicRecipes(query) {
  return async (dispatch, getState) => {
    const firebase = await fb();
    const firestore = firebase.firestore();

    const settings = {
      timestampsInSnapshots: true,
    };
    firestore.settings(settings);

    let recipes = await firestore
      .collection(`recipes`)
      .where('public', '==', true)
      .orderBy(`date`, `asc`)
      .get()
      .then(data => {
        //var source = data.metadata.fromCache ? 'local cache' : 'server';
        //console.log('Data came from ' + source);

        const returnData = data.docs.map(recipe => {
          let recipeData = recipe.data();
          recipeData.id = recipe.id;

          let fixedTitle = recipeData.title.replace(/ /g, '-').toLowerCase();

          if (query && query.id === fixedTitle) {
            dispatch({
              type: `UPDATE_RECIPE`,
              recipe: recipeData,
            });
          }

          return recipeData;
        });

        return returnData;
      });

    dispatch({
      type: `UPDATE_RECIPES`,
      data: recipes,
    });
  };
}

export function updateSelectedRecipe(recipe) {
  return async (dispatch, getState) => {
    if (recipe) {
      let recipes = getState().recipes.data;

      dispatch({
        type: `UPDATE_RECIPE`,
        recipe,
      });

      const i = recipes.findIndex(e => e.id === recipe.id);

      if (i > -1) {
        recipes[i] = recipe;

        dispatch({
          type: `UPDATE_RECIPES`,
          data: recipes,
        });
      }
    }
  };
}
