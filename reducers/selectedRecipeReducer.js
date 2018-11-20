let recipe = {};

const initialState = {
  recipe,
};

export default function selectedRecipe(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipe: action.recipe,
      };
    default:
      return state;
  }
}
