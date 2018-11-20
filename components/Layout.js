import React from 'react';
import Head from './Head';
import './../css/main.css';

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

export default Layout;
