import React from 'react';
import { connect } from 'react-redux';
import posed, { PoseGroup } from 'react-pose';
import {
  handleUserFacebookSignIn,
  handleUserSignOut,
} from './../actions/sessionActions.js';
import LoginForm from './../components/LoginForm.js';
import Link from 'next/link';
import './../css/btn.scss';
import './../css/menu.scss';

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

    const okClick =
      target.classList.contains('menuBtn') ||
      target.classList.contains('menuBtnImg');

    if (okClick) {
      return;
    }

    const clickInsideMenu = target.closest('.menuWrapper');

    if (!clickInsideMenu) {
      this.props.dispatch({ type: 'MENU_TOGGLE', menuOpen: false });
    }
  };

  handleMenuBtnClick = e => {
    e.preventDefault();
    let { menuOpen } = this.props.store.layout;

    this.props.dispatch({ type: 'MENU_TOGGLE', menuOpen: !menuOpen });
  };

  handleLogoutClick = async e => {
    e.preventDefault();
    this.props.dispatch(handleUserSignOut());
  };

  handleFacebookLoginClick = async e => {
    e.preventDefault();

    this.props.dispatch(handleUserFacebookSignIn());
  };

  render() {
    const { menuOpen } = this.props.store.layout;
    const { user } = this.props.store.session;
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
                <div>
                  <div>Inloggad som:</div>
                  <div>
                    <Link href="/user">
                      <a className={`menuHeadline nice_text`}>
                        {user.displayName || user.email}
                      </a>
                    </Link>
                  </div>
                  <br />
                  <a
                    href={`/`}
                    onClick={this.handleLogoutClick}
                    className={`btn loginBtn`}
                  >
                    logout
                  </a>
                </div>
              ) : (
                <div>
                  <LoginForm />
                </div>
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
