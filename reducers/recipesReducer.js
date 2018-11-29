/*
try {
    if(localStorage.recipes && localStorage.recipes !== ''){
        recipes = JSON.parse(localStorage.recipes);
    } else {
        recipes = require('./../utils/localRecipes.json');
    }
    if(localStorage.tags && localStorage.tags !== ''){
        tags = JSON.parse(localStorage.tags);
    }
} catch (e) {
    recipes = require('./../utils/localRecipes.json');
}
*/

const initialState = {
  selectedRecipe: {},
  selectedRecipeLoaded: false,
  publicRecipes: [],
  publicRecipesLoaded: false,
  usersRecipes: [],
  usersRecipesLoaded: false,
  recipeTags: [],
  recipeTagsLoaded: false,
};

export default function recipes(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_SELECTED_RECIPE':
      return {
        ...state,
        selectedRecipe: action.selectedRecipe,
        selectedRecipeLoaded: true,
      };
    case 'UPDATE_USERS_RECIPES':
      return {
        ...state,
        usersRecipes: action.usersRecipes,
        usersRecipesLoaded: true,
      };
    case 'UPDATE_PUBLIC_RECIPES':
      return {
        ...state,
        publicRecipes: action.publicRecipes,
        publicRecipesLoaded: true,
      };
    case 'UPDATE_RECIPE_TAGS':
      return {
        ...state,
        recipeTags: action.recipeTags,
        recipeTagsLoaded: true,
      };
    default:
      return state;
  }
}
