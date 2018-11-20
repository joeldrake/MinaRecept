import React from 'react';
import { connect } from 'react-redux';
import Layout from '../components/Layout.js';
import Link from 'next/link';
import Ingredients from '../components/Ingredients.js';
import Steps from '../components/Steps.js';
import './../css/recipe.css';

class Recipe extends React.Component {
  static async getInitialProps({ isServer, pathname, asPath, query }) {
    return {
      isServer,
      pathname,
      asPath,
      query,
    };
  }

  /*
  async componentDidMount() {
    const firebase = await this.props.firebase();
    console.log(firebase);
    const firestore = firebase.auth();
    console.log(firestore);
  }
  */

  render() {
    const { recipe } = this.props.store.selectedRecipe;

    let recipeImage = '';
    let headerImage = '';
    if (recipe.image) {
      let recipieImageUrl = recipe.image;
      headerImage = recipieImageUrl;
      if (recipieImageUrl.includes(`ucarecdn.com`)) {
        //uploadcareUrl, add enhance and resize parameter
        recipieImageUrl += `-/enhance/50/-/resize/1000x/`;
        headerImage += `/-/enhance/50/-/scale_crop/1200x630/center/`;
      }

      recipeImage = (
        <div
          className="recipeImage"
          style={{
            backgroundImage: `url(${recipieImageUrl})`,
          }}
        />
      );
    }

    return (
      <Layout
        title={recipe.title}
        description={recipe.text}
        ogImage={headerImage}
        url={this.props.asPath}
      >
        <div className="recipeWrapper">
          <Link href="/">
            <a className="backBtn">Start</a>
          </Link>

          {recipeImage}

          <div className={`recipeContent`}>
            <h1>{recipe.title}</h1>

            {recipe.text ? <p>{recipe.text}</p> : null}

            <div className={`recipeIngredientsStepsWrapper`}>
              {recipe.ingredients ? <Ingredients /> : null}

              {recipe.steps ? <Steps /> : null}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default connect(store => {
  return {
    store,
  };
})(Recipe);
