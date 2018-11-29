import React from 'react';
import { connect } from 'react-redux';
import posed, { PoseGroup } from 'react-pose';
import {
  handleUserFacebookSignIn,
  handleUserSignOut,
} from './../actions/sessionActions.js';
import './../css/btn.css';
import './../css/menu.css';

const MenuContainer = posed.div({
  enter: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0,
    x: '-12px',
    y: '-6px',
  },
});

class Menu extends React.Component {
  componentDidMount() {
    this.addEventListeners();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.removeEventListeners();
  }

  addEventListeners() {
    document.addEventListener('click', this.handlePageClick);
  }

  removeEventListeners() {
    document.removeEventListener('click', this.handlePageClick);
  }

  handlePageClick = e => {
    const target = e.target;
    const { menuOpen } = this.props.store.layout;

    if (!target || !menuOpen) {
      return;
    }

    const keepMenu =
      target.classList.contains('menuBtnImg') ||
      target.classList.contains('menuWrapper') ||
      target.classList.contains('menuHeadline');

    if (!keepMenu) {
      this.props.dispatch({ type: 'MENU_TOGGLE', menuOpen: false });
    }
  };

  handleMenuBtnClick = e => {
    e.preventDefault();
    const { menuOpen } = this.props.store.layout;
    this.props.dispatch({ type: 'MENU_TOGGLE', menuOpen: !menuOpen });
  };

  handleLogoutClick = async e => {
    e.preventDefault();
    this.props.dispatch(handleUserSignOut());
  };

  handleLoginClick = async e => {
    e.preventDefault();

    this.props.dispatch(handleUserFacebookSignIn());
  };

  render() {
    const { menuOpen } = this.props.store.layout;
    const { user, isSignedIn } = this.props.store.session;
    return (
      <React.Fragment>
        <button className={`menuBtn`} onClick={this.handleMenuBtnClick}>
          <img
            src={
              user && user.photoURL ? user.photoURL : `/static/img/cooking.svg`
            }
            alt={user && user.displayName ? user.displayName : `Menu`}
            className={`menuBtnImg`}
          />
        </button>
        <PoseGroup>
          {menuOpen ? (
            <MenuContainer className={`menuWrapper`} key={`menu`}>
              {user ? (
                <React.Fragment>
                  <h3 className={`menuHeadline`}>{user.displayName}</h3>
                  <a
                    href={`/`}
                    onClick={this.handleLogoutClick}
                    className={`btn loginBtn`}
                  >
                    logout
                  </a>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <h3 className={`menuHeadline`}>Logga in</h3>
                  <a
                    href={`/`}
                    onClick={this.handleLoginClick}
                    className={`btn loginBtn`}
                  >
                    Logga in med facebook
                  </a>
                </React.Fragment>
              )}
            </MenuContainer>
          ) : null}
        </PoseGroup>
      </React.Fragment>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Menu);
