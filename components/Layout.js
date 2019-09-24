import React from 'react';
import { connect } from 'react-redux';
import Head from './Head';
import './../css/main.scss';

class Layout extends React.Component {
  render() {
    return (
      <div className={`layoutWrapper`}>
        <Head
          title={this.props.title}
          description={this.props.description}
          ogImage={this.props.ogImage}
          url={this.props.url}
        />
        {this.props.children}
      </div>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Layout);
