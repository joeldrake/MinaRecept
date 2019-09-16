import React from 'react';
import { connect } from 'react-redux';
import { addNewRecipe } from './../actions/recipeActions.js';
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
      type: `UPDATE_SELECTED_RECIPE`,
      selectedRecipe: {},
    });
  }

  handleRecipeClick(selectedRecipe) {
    //set selected recipe data
    this.props.dispatch({
      type: `UPDATE_SELECTED_RECIPE`,
      selectedRecipe,
    });
  }

  handleAddRecipeClick = async () => {
    this.props.dispatch(addNewRecipe());
  };

  renderRecipes(recipes) {
    return recipes
      ? recipes.map((recipe, i) => {
          let addedStyle = {};

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
            <Link
              as={`/${recipe.permalink}/`}
              href={`/recipe?id=${recipe.permalink}`}
              key={i}
            >
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
      : null;
  }

  render() {
    const { publicRecipes, usersRecipes } = this.props.store.recipes;
    const { user } = this.props.store.session;

    const nonPublicRecipes = usersRecipes.filter(recipe => {
      return recipe.public === false;
    });

    let renderedUsersRecipes = this.renderRecipes(nonPublicRecipes);

    let renderedPublicRecipes = this.renderRecipes(publicRecipes);

    //todo: reupload and check cache
    return (
      <Layout>
        <div className={`widthWrapper addPadding topWrapper`}>
          <Menu />
          <h1 className={`firstPageHeadline `}>Mina recept</h1>

          {user ? (
            <div>
              <h2>Dina icke publika recept</h2>
              <div className={`recipesWrapper`}>{renderedUsersRecipes}</div>
              <button
                onClick={this.handleAddRecipeClick}
                className={`recipeAddBtn btn`}
              >
                Lägg till recept
              </button>
            </div>
          ) : null}
        </div>

        <div className={`addPadding widthWrapper`}>
          <h2>Offentliga recept</h2>
          <div className={`recipesWrapper`}>{renderedPublicRecipes}</div>
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
