import { combineReducers } from 'redux';
import layout from './layoutReducer.js';
import modal from './modalReducer.js';
import recipes from './recipesReducer.js';
import session from './sessionReducer.js';

export default combineReducers({
  layout,
  modal,
  recipes,
  session,
});
