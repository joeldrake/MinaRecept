import React from 'react';
import { Provider } from 'react-redux';
import App, { Container } from 'next/app';
import withRedux from 'next-redux-wrapper';
import { handleUserLogin } from './../actions/sessionActions.js';
import { fetchPublicRecipes } from './../actions/recipeActions.js';
import { initStore } from './../lib/store.js';
import fb from './../lib/load-firebase.js';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    if (ctx && ctx.req && ctx.res) {
      //this is serverside
      await ctx.store.dispatch(fetchPublicRecipes(ctx.query));
    }

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return {
      pageProps,
    };
  }

  componentDidMount() {
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
      this.props.store.dispatch(handleUserLogin(user));
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const { Component, pageProps, store } = this.props;
    return (
      <Container>
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withRedux(initStore)(MyApp);
