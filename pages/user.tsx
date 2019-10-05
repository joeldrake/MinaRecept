import React from 'react';
import { connect } from 'react-redux';
import Layout from '@components/Layout.js';
import Menu from '@components/Menu.js';
import Link from 'next/link';
import '@styles/pages/user.scss';

interface IAnyParams {
	[key: string]: any;
}

class Index extends React.Component<IAnyParams> {
	static async getInitialProps({ isServer, pathname, asPath, query }) {
		return {
			isServer,
			pathname,
			asPath,
			query,
		};
	}

	render() {
		const { user } = this.props.store.session;

		return (
			<Layout>
				<div className={`widthWrapper addPadding topWrapper`}>
					<Link href='/'>
						<a className='backBtn'>Start</a>
					</Link>
					<Menu />
					<h1>user</h1>
				</div>

				<div className={`addPadding widthWrapper userWrapper`}>
					<h2>more to come</h2>
				</div>
			</Layout>
		);
	}
}

export default connect(store => {
	return {
		store,
	};
})(Index);
