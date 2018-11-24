import React from 'react';
import { connect } from 'react-redux';
import fb from './../lib/load-firebase.js';
import { addedNewRecipe } from './../actions/recipeActions.js';
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

  handleAddRecipeClick = async () => {
    const { legalCharacters, user } = this.props.store.session;

    const title = prompt(`Ange namn på receptet`);

    /*
    console.log(!title.match(legalCharacters));
    if (!title.match(legalCharacters)) {
      //illegal characters used, bail out
      alert(
        `Du kan endast ha bokstäver och siffror i namnet. Var god försök igen med ett annat namn.`,
      );
      return false;
    }
    */

    if (title && title !== `` && user && user.uid) {
      const firebase = await fb();
      const firestore = firebase.firestore();
      const settings = { timestampsInSnapshots: true };
      firestore.settings(settings);

      let newRecipe = {
        title,
        public: false,
        date: new Date(),
        lastUpdated: new Date(),
        owner: user.uid,
      };

      firestore
        .collection(`recipes`)
        .add(newRecipe)
        .then(docRef => {
          newRecipe.id = docRef.id;

          this.props.dispatch(addedNewRecipe(newRecipe));
        })
        .catch(error => {
          console.error('Error adding document: ', error);
        });
    }
  };

  render() {
    const { data } = this.props.store.recipes;
    const { isSignedIn, user } = this.props.store.session;

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
          <h1 className={`firstPageHeadline addPadding`}>Mina recept</h1>

          <Menu />
        </div>

        <div className={`recipesWrapper addPadding widthWrapper`}>
          {renderRecipes}
        </div>

        <div className={`widthWrapper addPadding`}>
          {isSignedIn ? (
            <button
              onClick={this.handleAddRecipeClick}
              className={`recipeAddBtn btn`}
            >
              Lägg till recept
            </button>
          ) : null}
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
