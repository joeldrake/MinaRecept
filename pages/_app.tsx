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
import './../css/minaReceptTransition.scss';

interface IAnyParams {
	[key: string]: any;
}

class MyApp extends App<IAnyParams> {
	unregisterAuthObserver: any;

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
		const { Component, pageProps, store, router } = this.props;
		const { route } = router;
		const startPage = route === '/';
		let transitionDirection = startPage ? 'transitionLeft' : 'transitionRight';

		let animateEnter = startPage ? true : false;
		let animateExit = startPage ? false : true;

		return (
			<Provider store={store}>
				<ThemeProvider theme={theme}>
					<TransitionGroup>
						<CSSTransition
							timeout={300}
							enter={animateEnter}
							exit={animateExit}
							classNames={transitionDirection}
							key={route}
						>
							<Component {...pageProps} />
						</CSSTransition>
					</TransitionGroup>
				</ThemeProvider>
			</Provider>
		);
	}
}

export default withRedux(initStore)(MyApp);
