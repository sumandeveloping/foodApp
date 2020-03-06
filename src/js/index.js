import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { elements, renderLoader, clearLoader } from "./views/base";

/* Global state of our app
* - Search Object 
* - Current recipe object 
* - Shopping list object 
* - Liked recipes 

*/
const state = {};
//TESTING PURPOSE
window.state = state;

/**
 * Search Controller
 */

//control search func
const controlSearch = async () => {
  // 1. get query from view
  const query = searchView.getInput();
  //TESTING
  // const query = "pizza";
  // console.log(query);

  if (query) {
    // 2. new search object & add to state
    state.search = new Search(query);
    // console.log(state.search);

    // 3. Prepare UI for the query(clear previous data if it has)
    searchView.clearInput();
    searchView.clearReults();
    renderLoader(elements.searchRes);

    try {
      // 4. Search for recipes
      await state.search.getResults();

      // 5. Render results on UI after only loading data from api
      clearLoader();
      // console.log(state.search.result); //it holds all recipes as an array
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert("Error searching recipes");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

//click on paginations
elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    //clear result first
    searchView.clearReults();
    //thne  render result
    searchView.renderResults(state.search.result, goToPage);
    console.log(goToPage);
  }
});

/*
 * Recipe Controller
 */

const controlRecipe = async () => {
  const id = window.location.hash.replace("#", "");
  // console.log(id);
  if (id) {
    // 1.Prepare UI for changes -> clear previous data then show loader
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected search item
    if (state.search) searchView.highlightSelected(id);

    // 2. Create new Recipe object
    state.recipe = new Recipe(id);

    try {
      // 3. Get Recipe data
      await state.recipe.getRecipe();
      //also parse the ingredients
      state.recipe.parseIngredients();

      // 4. Calculate timings & Servings
      state.recipe.calcTime();
      state.recipe.calcServings();

      //TESTING
      window.r = state.recipe;

      // 5. Render Recipe
      // console.log(state.recipe);
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (error) {
      console.log(error);
      alert(`error processing recipe`);
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

//alternative of way above two lines
//CLicke event to see particular item recipe in details
["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/*
 * Shopping List Controller
 */

const controlList = () => {
  // console.log(e.target);
  // 1.Create shopping list object
  if (!state.list) state.list = new List();
  // 2.Put recipe ingredients array to an array of List object
  if (state.list.empty) {
    //list.empty = true(List model)
    state.recipe.ingredients.forEach(el => {
      const item = state.list.addItem(el.count, el.unit, el.ingredient);
      listView.renderItem(item);
    });
    // Render clear list button to clear full shopping list
    listView.renderClearListBtn();
    state.list.empty = false;
  }
};

/*
 *  LIKE Controller
 */

const controlLike = () => {
  // 1. Create a new Like object
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;
  //Users has NOT liked this current recipe
  if (!state.likes.isLiked(currentID)) {
    // 1. add Like to state.like
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.image
    );

    // 2. toggle the like button
    likesView.toggleLikebtn(true);

    // 3. Add like to the UI
    likesView.renderLike(newLike);

    //Users has liked this current recipe
  } else {
    //delete from likes
    state.likes.deleteLike(currentID);
    // 2. toggle the like button to dislike it
    likesView.toggleLikebtn(false);
    // 3. delete liked item from likes menu -> chnage UI
    likesView.deleteLike(currentID);
  }
  //toggling the like button on top right
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//Handling delete and update button click on shoppinglist items
elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemid;
  // console.log(id);

  //handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    //Delete from List object
    state.list.deleteItem(id);
    //Delete from UI
    listView.deleteItem(id);
  } else if (e.target.matches(".shopping__count-value")) {
    const val = +e.target.value; // '+' signs converts it into a number same as parseInt method
    state.list.updateCount(id, val);
  }
});

elements.shoppingMainDiv.addEventListener("click", e => {
  if (e.target.matches(".clear__shopping--list, .clear__shopping--list *")) {
    // console.log(e.target);
    // 1. clear list array from model
    state.list.clearList();
    // 2. Change UI (clear all list items) & also delete 'clearListBtn'
    listView.deleteFullList();
    listView.deleteClearListBtn();
    state.list.empty = true;
  }
});

//Restore liked recipes on page load using localStorage
window.addEventListener("load", () => {
  //TESTING
  state.likes = new Likes();
  //restore likes
  state.likes.readStorage();
  //toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  //render the existing likes
  state.likes.likes.forEach(el => {
    likesView.renderLike(el);
  });
});

//Handling recipe serving buttons click
elements.recipe.addEventListener("click", e => {
  // console.log(e.target);
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    //Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    //Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    //SHOPPING LIST CONTROLLER => add ingredients to shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    //Add Likes => Like controller
    controlLike();
  }
});
