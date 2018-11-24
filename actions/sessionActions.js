import { fetchPrivateRecipes } from './recipeActions.js';

export function handleUserLogin(user) {
  return async (dispatch, getState) => {
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
      isSignedIn: isSignedIn,
      user: userCollect,
    });

    dispatch(fetchPrivateRecipes());
  };
}
