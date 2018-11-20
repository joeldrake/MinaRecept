import React from 'react';
import { connect } from 'react-redux';
import Layout from './../components/Layout.js';
import Menu from './../components/Menu.js';
import Link from 'next/link';
import './../css/start.css';

class Index extends React.Component {
  static async getInitialProps({ isServer, pathname, asPath, query }) {
    return {
      isServer,
      pathname,
      asPath,
      query,
    };
  }

  async componentDidMount() {
    //clear selected recipe data
    this.props.dispatch({
      type: `UPDATE_RECIPE`,
      recipe: {},
    });
  }

  handleRecipeClick(recipe) {
    //set selected recipe data
    this.props.dispatch({
      type: `UPDATE_RECIPE`,
      recipe,
    });
  }

  render() {
    const { data } = this.props.store.recipes;

    let renderRecipes = data
      ? data.map((recipe, i) => {
          let addedStyle = {};

          let displayUrl = encodeURI(
            recipe.title.replace(/ /g, '-').toLowerCase(),
          );

          let queryID = encodeURIComponent(
            recipe.title.replace(/ /g, '-').toLowerCase(),
          );

          let hasImage;
          if (recipe.image && recipe.image !== '') {
            let recipieImageUrl = recipe.image;
            if (recipieImageUrl.includes('ucarecdn.com')) {
              //uploadcareUrl, add enhance and resize parameter
              recipieImageUrl += '-/enhance/50/-/resize/500x/';
            }
            hasImage = true;
            addedStyle.backgroundImage = `url(${recipieImageUrl})`;
          }

          return (
            <Link as={`/${displayUrl}/`} href={`/recipe?id=${queryID}`} key={i}>
              <a
                className={`recipeLink`}
                onClick={() => this.handleRecipeClick(recipe)}
              >
                <div
                  className={`recipeLinkImage` + (!hasImage ? ` noImage` : ``)}
                  style={addedStyle}
                />
                <div className={`recipeLinkText`}>{recipe.title}</div>
                {recipe.text ? (
                  <div className={`recipeLinkDesciption`}>{recipe.text}</div>
                ) : null}
              </a>
            </Link>
          );
        })
      : '';

    //todo: reupload and check cache
    return (
      <Layout>
        <div className={`widthWrapper`} style={{ position: 'relative' }}>
          <h1 className={`firstPageHeadline`}>Mina recept</h1>

          <Menu />
        </div>

        <div className={`recipesWrapper widthWrapper`}>{renderRecipes}</div>
      </Layout>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Index);
