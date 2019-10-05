import React from 'react';
import { connect } from 'react-redux';
import { fetchPublicRecipes, addNewRecipe } from '@actions/recipeActions.js';
import Layout from '@components/Layout.js';
import Menu from '@components/Menu.js';
import Link from 'next/link';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import { withStyles } from '@material-ui/core/styles';

import '@styles/pages/Start.scss';

interface IAnyParams {
  [key: string]: any;
}

const StyledCardMedia = withStyles({
  root: {
    paddingTop: '50%',
  },
})(CardMedia);

const StyledCard = withStyles({
  root: {
    height: '100%',
  },
})(Card);

class Index extends React.Component<IAnyParams> {
  static async getInitialProps({ store, isServer, pathname, asPath, query }) {
    if (isServer) {
      await store.dispatch(fetchPublicRecipes());
    }

    return {
      isServer,
      pathname,
      asPath,
      query,
    };
  }

  componentDidMount() {}

  handleRecipeClick(selectedRecipe) {
    this.props.dispatch({
      type: `UPDATE_SELECTED_RECIPE`,
      selectedRecipe,
    });
  }

  handleAddRecipeClick = async () => {
    this.props.dispatch(addNewRecipe());
  };

  renderRecipes(recipes) {
    if (!recipes) return;

    return recipes.map((recipe, i) => {
      let recipieImageUrl = '/static/img/OGimage.png';
      if (recipe.image && recipe.image !== '') {
        recipieImageUrl = recipe.image;
        if (recipieImageUrl.includes('ucarecdn.com')) {
          //uploadcareUrl, add enhance and resize parameter
          recipieImageUrl += '-/enhance/50/-/resize/500x/';
        }
      }

      return (
        <Link
          href={`/[id]?id=${recipe.permalink}`}
          as={`/${recipe.permalink}/`}
          key={i}
        >
          <a
            className={`recipeLink`}
            onClick={() => this.handleRecipeClick(recipe)}
          >
            <StyledCard>
              <StyledCardMedia image={recipieImageUrl} title={recipe.title} />
              <CardContent>
                <h2>{recipe.title}</h2>
                <p>{recipe.text}</p>
              </CardContent>
            </StyledCard>
          </a>
        </Link>
      );
    });
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
        </div>

        <div className={`addPadding widthWrapper`}>
          {user ? <h2>Publika recept</h2> : null}
          <div className={`recipesWrapper`}>{renderedPublicRecipes}</div>
        </div>

        {user ? (
          <div className={`addPadding widthWrapper`}>
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
      </Layout>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Index);
