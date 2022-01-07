import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import ShareButton from '../components/ShareButton';
import { createDOneLocalStorage } from '../services/CreateLocalStorages';

function test(id) {
  const initialLocal = JSON.parse(localStorage.getItem('inProgressRecipes'));
  if (!initialLocal) {
    return [];
  }
  return initialLocal.meals[id.match.params.id] || [];
}

export default function ComidasProgress(id) {
  const history = useHistory();
  const [loaded, setLoaded] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [returnApi, setReturnApi] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState(test(id));
  const [allIngredients, setAllIngredients] = useState([]);

  const clickButton = () => {
    createDOneLocalStorage(returnApi.meals[0]);
    history.push('/receitas-feitas');
  };

  const checkIngredient = ({ target }) => {
    const { name } = target;
    if (target.checked) {
      setCheckedIngredients([...checkedIngredients, name]);
    } else {
      setCheckedIngredients(checkedIngredients.filter((elem) => elem !== name));
    }
  };

  const getFoods = async () => {
    await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id.match.params.id}`)
      .then((data) => data.json())
      .then((data) => setReturnApi(data));
    setLoaded(true);

    let getLocal = await JSON.parse(localStorage.getItem('inProgressRecipes'));
    if (!getLocal || Object.keys(getLocal.meals).length === 0) {
      getLocal = { cocktails: {}, meals: { [id.match.params.id]: [] } };
      localStorage.setItem('inProgressRecipes', JSON.stringify(getLocal));
    } else {
      const inProgressRecipes = {
        ...getLocal,
        meals: { ...getLocal.meals, [id.match.params.id]: checkedIngredients } };
      localStorage.setItem('inProgressRecipes', JSON.stringify(inProgressRecipes));
    }
  };

  useEffect(() => {
    getFoods();
    if (returnApi.length !== 0) {
      setAllIngredients((Object.entries(returnApi.meals[0])
        .filter((elem) => elem[0].includes('Ingredient')))
        .filter((elem) => elem[1] !== null)
        .filter((elem) => elem[1] !== ''));

      if (checkedIngredients.length === allIngredients.length) {
        setIsDisabled(false);
      } else {
        console.log(returnApi);
        setIsDisabled(true);
      }
    }
  }, [checkedIngredients]);

  return (
    <div>

      {(loaded) && (
        <div>
          <img
            src={ `${returnApi.meals[0].strMealThumb}` }
            alt="img"
            data-testid="recipe-photo"
          />
          <h1 data-testid="recipe-title">
            { returnApi.meals[0].strMeals }
          </h1>
          <div>
            <FavoriteButton apiRetur={ returnApi.meals } />
          </div>
          <div>
            <ShareButton
              dataTestid="share-btn"
              pathname={ `/comidas/${id.match.params.id}` }
            />
          </div>
          <p data-testid="recipe-category">
            { returnApi.meals[0].strCategory }
          </p>
          {(Object.entries(returnApi.meals[0])
            .filter((elem) => elem[0].includes('Ingredient'))
            .map((elem, index) => {
              if (elem[1] !== null && elem[1] !== '') {
                return (
                  <div key={ index }>
                    <label
                      htmlFor="recipes"
                      data-testid={ `${index}-ingredient-step` }
                    >
                      <input
                        type="checkbox"
                        name={ elem[1] }
                        id={ `${index}-${elem[1]}` }
                        onClick={ checkIngredient }
                        checked={ (checkedIngredients).includes(elem[1]) }
                      />
                      {`${elem[1]}`}
                    </label>
                  </div>
                );
              }
              return null;
            }))}
          <p data-testid="instructions">
            {returnApi.meals[0].strInstructions}
          </p>
          <button
            disabled={ isDisabled }
            data-testid="finish-recipe-btn"
            type="button"
            onClick={ () => clickButton() }
          >
            Finalizar
          </button>
        </div>
      )}
    </div>
  );
}
