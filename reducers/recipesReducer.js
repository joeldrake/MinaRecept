let data = [];
let tags = [];

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
  data,
  tags,
};

export default function recipes(state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_RECIPES':
      return {
        ...state,
        data: action.data,
      };
    case 'UPDATE_TAGS':
      return {
        ...state,
        tags: action.tags,
      };
    default:
      return state;
  }
}
