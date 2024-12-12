const SEARCH_TYPES = ['pokemon', 'game', 'movie']

const searchAutocomplete = document.getElementById('search-autocomplete')
const searchResultsContainer = document.getElementById('searchResultsContainer')
const searchButton = document.getElementById('searchButton')
const search = document.getElementById('search')
let meilleurResultat = null

function goToFirstResult() {
    if (meilleurResultat) {
        location.assign(`pokemon.html?id=${meilleurResultat.id}`)
    }
}

async function submitPokemon(q) {
    const searchPokemonQuery = pokemonSearchRequest(q, 5);
    const url = getQueryUrl(WIKIDATA_API, searchPokemonQuery);
    const response = await fetch(url).then(response => response.json());
    const pokemons = response.results.bindings.map(pokemon => ({
        id: parseInt(pokemon.pokedexNumber.value),
        name: pokemon.pokemonLabel.value,
    }));
    renderResults(pokemons, 'pokemon')
    meilleurResultat = pokemons[0]
    searchAutocomplete.innerText = `${search.value} — ${pokemons[0].name}`
}

async function submitGames(q) {
    const searchGamesQuery = gameSearchRequest(q, 5);
    const url = getQueryUrl(WIKIDATA_API, searchGamesQuery);
    const response = await fetch(url).then(response => response.json());
    const games = response.results.bindings.map(game => ({
        id: game.videogame.value,
        name: game.videogameLabel.value,
    }));
    renderResults(games, 'game')
}

async function submitMovies(q) {
    const searchMoviesQuery = movieSearchRequest(q, 5);
    const url = getQueryUrl(WIKIDATA_API, searchMoviesQuery);
    const response = await fetch(url).then(response => response.json());
    const movies = response.results.bindings.map(movie => ({
        id: movie.movie.value,
        name: movie.movieLabel.value,
    }));
    renderResults(movies, 'movie')
}

function renderResults(results, type) {
    if (results.length > 0) {
        const category = document.createElement('div')
        category.className = 'recherche-categorie'
        const title = document.createElement('h2')
        if (type === 'pokemon') {
            title.innerText = 'Pokémon'
        } else if (type === 'game') {
            title.innerText = 'Game'
        } else if (type === 'movie') {
            title.innerText = 'Movie'
        }
        category.appendChild(title)
        const ul = document.createElement('ul')
        results.forEach(result => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            if (type === 'pokemon') {
                a.href = `pokemon.html?id=${result.id}`
            } else if (type === 'game') {
                a.href = `game.html?id=${result.id.substring(31)}`
            } else if (type === 'movie') {
                a.href = `movie.html?id=${result.id.substring(31)}`
            }
            a.innerText = result.name
            a.addEventListener('focus', () => {
                meilleurResultat = { id: result.id, type: type }
            }
            )
            li.appendChild(a)
            ul.appendChild(li)
        })
        category.appendChild(ul)
        searchResultsContainer.appendChild(category)
    }
}

function resetResults() {
    searchResultsContainer.innerHTML = ''
    meilleurResultat = null
}

function main() {

    searchButton.addEventListener('click', goToFirstResult)

    search.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            goToFirstResult()
        }
    })

    search.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            e.stopPropagation()
            searchResultsContainer.querySelector('a')?.focus()
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            e.stopPropagation()
            searchResultsContainer.querySelector('.recherche-categorie:last-child ul:last-child li:last-child a')?.focus()
        }
    })

    search.addEventListener('input', () => {
        const q = search.value.toLocaleLowerCase()
        if (q.length > 0) {
            resetResults()
            searchAutocomplete.innerText = `${search.value} — Recherche…`
            submitPokemon(q)
            submitGames(q)
            submitMovies(q)
        } else {
            searchAutocomplete.innerText = ''
            resetResults()
        }
    })

    searchResultsContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            e.stopPropagation()

            const direction = (e.key === 'ArrowDown') ? +1 : -1
            const liens = [...searchResultsContainer.querySelectorAll('a')]
            if (liens && liens.length > 0) {
                const index = liens.indexOf(document.activeElement)
                if (index == -1) {
                    // le focus n'est pas sur une ancre
                    liens[0].focus()
                } else {
                    const nextIndex = index + direction
                    if (nextIndex < 0) {
                        search.focus() // on focus l'entrée
                    } else if (nextIndex >= liens.length) {
                        search.focus() // on boucle
                    } else {
                        liens[nextIndex].focus()
                    }
                }
            }
        }
    })
}

main()