import React from 'react';
import { Provider } from 'react-redux';
import App from 'next/app';
import withRedux from 'next-redux-wrapper';
import { handleUserAuthChanged } from './../actions/sessionActions.js';
import { fetchPublicRecipes } from './../actions/recipeActions.js';
import { initStore } from './../utils/store.js';
import fb from './../utils/load-firebase.js';
import { ThemeProvider } from '@material-ui/styles';
import theme from '@styles/theme';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
const throttle = require('lodash/throttle');
import './../css/minaReceptTransition.scss';

interface IAnyParams {
  [key: string]: any;
}

class MyApp extends App<IAnyParams> {
  unregisterAuthObserver: any;
  onScrollThrottled: any;

  static async getInitialProps({ Component, ctx }) {
    if (ctx && ctx.req && ctx.res) {
      //this is serverside
    }

    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

    return {
      pageProps,
    };
  }

  state = {
    offsetTop: 0,
    isTransitioning: false,
  };

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

    this.onScrollThrottled = throttle(this.onScroll, 10);

    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('scroll', this.onScrollThrottled);
  }

  removeEventListeners() {
    document.removeEventListener('scroll', this.onScrollThrottled);
  }

  onScroll = () => {
    if (this.state.isTransitioning) return;
    this.setState({ offsetTop: window.scrollY === 0 ? 0 : -window.scrollY });
  };

  async setUpAuthListener() {
    const firebase = await fb();
    const auth = firebase.auth();

    this.unregisterAuthObserver = auth.onAuthStateChanged(user => {
      this.props.store.dispatch(handleUserAuthChanged(user));
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
    this.removeEventListeners();
  }

  onExiting = () => {
    this.setState({ isTransitioning: true });
  };

  onExited = () => {
    this.setState({ isTransitioning: false });
    window.requestAnimationFrame(() => {
      this.onScroll();
    });
  };

  render() {
    const { Component, pageProps, store, router } = this.props;
    const { route } = router;
    const startPage = route === '/';
    let transitionDirection = startPage ? 'transitionLeft' : 'transitionRight';

    let animateEnter = true;
    let animateExit = true;

    const { offsetTop, isTransitioning } = this.state;

    const style = { '--offsetTop': `${offsetTop}px` } as React.CSSProperties;
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <div style={style}>
            <TransitionGroup>
              <CSSTransition
                timeout={300}
                onExiting={this.onExiting}
                onExited={this.onExited}
                enter={animateEnter}
                exit={animateExit}
                classNames={transitionDirection}
                key={route}
              >
                <Component {...pageProps} />
              </CSSTransition>
            </TransitionGroup>
          </div>
        </ThemeProvider>
      </Provider>
    );
  }
}

export default withRedux(initStore)(MyApp);
