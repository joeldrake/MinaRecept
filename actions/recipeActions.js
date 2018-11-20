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
