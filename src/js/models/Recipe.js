import axios from "axios";
export default class Recipe {
  constructor(id) {
    this.id = id;
  }
  async getRecipe() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.image = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
      //   console.log(res.data);
    } catch (error) {
      console.log(error);
      alert(`Something went wrong`);
    }
  }

  calcTime() {
    const numIng = this.ingredients.length; //this.ingredients is an array
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15; //cooking time
  }
  calcServings() {
    this.servings = 4;
  }

  parseIngredients() {
    const unitLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds"
    ]; //we are gonna replace these units

    const unitShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound"
    ]; //we want this units
    const units = [...unitShort, "kg", "g"];

    const newIngredients = this.ingredients.map(el => {
      // 1. Uniform Units
      let ingredient = el.toLowerCase().trim();
      unitLong.forEach((unit, index) => {
        ingredient = ingredient.replace(unit, unitShort[index]);
      });
      // 2. Remove Parentheses
      ingredient = ingredient.replace(/ *\([^)]*\)*/g, "");
      // 3. Parse ingredients into unit,count,ingredient
      const arrIng = ingredient.split(" ");
      const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        //it has a UNIT   example=> 2 tbsp chilli powder or 2 1/2 tbsp chilli powder
        const arrCount = arrIng.slice(0, unitIndex); // [2] or [2, 1/2]
        let count;
        if (arrCount.length === 1) {
          count = eval(arrCount[0].replace("-", "+")); // some ingredient are like => 1-1/2 => then it becomes eval('1+1/2') = 1.5
        } else {
          count = eval(arrIng.slice(0, unitIndex).join("+")); // ex => eval("2+1/2") = 4.5 eval=> evaluates sum of tow strings
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" ")
        };
      } else if (parseInt(ingredient[0], 10)) {
        // it has NO unit but 1st element is number   example=> 2 tomato sauce
        objIng = {
          count: parseInt(ingredient[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" ")
        };
      } else if (unitIndex === -1) {
        //it has NO unit & NO number in 1st position    example=> tomato sauce
        objIng = {
          count: 1,
          unit: "",
          ingredient
        };
      }

      //in 'map' method we alwyas have to 'return' to get a new array
      return objIng;
    });

    this.ingredients = newIngredients;
  }

  updateServings(type) {
    // Servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    //Ingredients
    this.ingredients.forEach(ing => {
      ing.count *= newServings / this.servings;
    });

    this.servings = newServings;
  }
}
