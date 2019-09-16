import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import withRedux from 'next-redux-wrapper';
import { handleUserAuthChanged } from './../actions/sessionActions.js';
import { fetchRecipe, fetchPublicRecipes } from './../actions/recipeActions.js';
import { initStore } from './../utils/store.js';
import fb from './../utils/load-firebase.js';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    if (ctx && ctx.req && ctx.res) {
      //this is serverside

      if (ctx.query && ctx.query.id) {
        //user is on a recipie page
        await ctx.store.dispatch(fetchRecipe(ctx.query.id));
        //await ctx.store.dispatch(fetchPublicRecipes(ctx.query));
      } else {
        await ctx.store.dispatch(fetchPublicRecipes());
      }
    }

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return {
      pageProps,
    };
  }

  componentDidMount() {
    //check if public recipes has been loaded server side. If not, load them.
    const { publicRecipes } = this.props.store.getState().recipes;
    if (!publicRecipes.length) {
      this.props.store.dispatch(fetchPublicRecipes());
    }
    /*
    //Firebase facebook login redirect did not like this service worker
    if (
      'serviceWorker' in navigator &&
      window.location.hostname !== 'localhost'
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(err => console.error('Service worker registration failed', err));
    }
    */
    this.setUpAuthListener();
  }

  async setUpAuthListener() {
    const firebase = await fb();
    const auth = firebase.auth();

    this.unregisterAuthObserver = auth.onAuthStateChanged(user => {
      this.props.store.dispatch(handleUserAuthChanged(user));
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(initStore)(MyApp);
