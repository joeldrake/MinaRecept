import React from 'react';
import { Provider } from 'react-redux';
import App, { Container } from 'next/app';
import withRedux from 'next-redux-wrapper';
import { handleUserLogin } from './../actions/sessionActions.js';
import { initStore } from './../lib/store.js';
import fb from './../lib/load-firebase.js';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    if (ctx && ctx.req && ctx.res) {
      //this is serverside

      const firebase = await fb();
      const firestore = firebase.firestore();

      const settings = {
        timestampsInSnapshots: true,
      };
      firestore.settings(settings);

      //todo: check if user is on specific recipe and if so only load that

      let recipes = await firestore
        .collection(`recipes`)
        .where('public', '==', true)
        .orderBy(`date`, `asc`)
        .get()
        .then(data => {
          //var source = data.metadata.fromCache ? 'local cache' : 'server';
          //console.log('Data came from ' + source);

          const returnData = data.docs.map(recipe => {
            let recipeData = recipe.data();
            recipeData.id = recipe.id;

            let fixedTitle = recipeData.title.replace(/ /g, '-').toLowerCase();

            if (ctx.query && ctx.query.id === fixedTitle) {
              ctx.store.dispatch({
                type: `UPDATE_RECIPE`,
                recipe: recipeData,
              });
            }

            return recipeData;
          });

          return returnData;
        });

      ctx.store.dispatch({
        type: `UPDATE_RECIPES`,
        data: recipes,
      });
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
