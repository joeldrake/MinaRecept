import { fetchRecipe, fetchPrivateRecipes } from './recipeActions.js';
import fb from './../lib/load-firebase.js';
import Router from 'next/router';

export function handleSignUp(values = {}) {
  return async (dispatch, getState) => {
    const { email, password } = values;

    const firebase = await fb();

    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(data => {
        return data;
      })
      .catch(error => {
        return error;
      });
  };
}

export function handleSignIn(values = {}) {
  return async (dispatch, getState) => {
    const { email, password } = values;

    const firebase = await fb();

    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(data => {
        return data;
      })
      .catch(error => {
        return error;
      });
  };
}

export function handleUserFacebookSignIn() {
  return async (dispatch, getState) => {
    const firebase = await fb();
    const provider = new firebase.auth.FacebookAuthProvider();

    firebase
      .auth()
      .signInWithRedirect(provider)
      .catch(error => {
        console.log(error);
      });
  };
}

export function handleUserSignOut() {
  return async (dispatch, getState) => {
    const firebase = await fb();
    firebase
      .auth()
      .signOut()
      .then(() => {
        // Sign-out successful.
        dispatch({
          type: 'LOGOUT',
        });
      })
      .catch(error => {
        console.log(error);
      });
  };
}

export function handleUserAuthChanged(user) {
  return async (dispatch, getState) => {
    const { selectedRecipe } = getState().recipes;
    const { router } = Router;
    const { query } = router;

    let userCollect = null;
    let isSignedIn = false;
    if (user) {
      /*
        getting an error when trying to store the whole user object in redux
        because it contains reference points to a scope which Redux DevTools is not allowed to access.
        Therefor just collecting the bits needed.
      */

      let admin = user.uid === '85zPWycXRWYSlSYOAsw2iyhaa8C2' ? true : false;

      userCollect = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        admin: admin,
      };
      isSignedIn = true;
    }

    dispatch({
      type: `LOGIN_STATE`,
      isSignedIn,
      user: userCollect,
    });

    //if user is signed in and on a recipe, and selectedRecipe is empty, redo fetch, it might be the owner that logged in
    if (isSignedIn && query && query.id && !selectedRecipe.id) {
      console.log('refetch');
      dispatch(fetchRecipe(query.id));
    }

    dispatch(fetchPrivateRecipes());
  };
}
