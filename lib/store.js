import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './../reducers/index.js';

export const initStore = (initialState, options) => {
  return createStore(reducers, initialState, applyMiddleware(thunk));
};
