function pokemonsRequestWikiData() {
  return `SELECT DISTINCT ?pokemon ?pokemonLabel ?pokedexNumber ?generationLabel 
      (GROUP_CONCAT(DISTINCT ?typeLabel; separator=", ") AS ?types) 
      WHERE {
  
      # Identifier les Pokémon
      ?pokemon wdt:P31/wdt:P279* wd:Q3966183 .  # Classe Pokémon

      # Récupérer le numéro de Pokédex
      ?pokemon wdt:P1685 ?pokedexNumber .

      # Identifier la génération avec P4584
      ?pokemon wdt:P4584 ?generation .
      ?generation rdfs:label ?generationLabel .

      # Identifier les types avec des références
      ?pokemon p:P31 ?typeStatement .
      ?typeStatement ps:P31 ?type ;
                    prov:wasDerivedFrom ?reference .  # Vérifie la présence d'une référence

      # Vérifier que le type est un "type de Pokémon"
      ?type wdt:P1552 wd:Q1266830 .

      # Récupérer les labels en français, puis en anglais si non disponible
      ?pokemon rdfs:label ?pokemonLabel .
      ?type rdfs:label ?typeLabel .

      # Filtrer pour récupérer uniquement le label en français, ou anglais si le français n'existe pas
      FILTER((LANG(?pokemonLabel) = "fr"))
      FILTER((LANG(?typeLabel) = "fr"))
      FILTER((LANG(?generationLabel) = "fr"))

    }
    GROUP BY ?pokemon ?pokemonLabel ?pokedexNumber ?generationLabel
    ORDER BY ?xsd:integer(pokedexNumber)
    `;
}

function evolutionsRequest(id) {
  // Formater l'ID pour qu'il ait toujours 3 chiffres avec des zéros devant
  const formattedId = id.toString().padStart(3, '0');
    return `SELECT DISTINCT ?pokemon ?pokemonLabel ?pokedexNumber (GROUP_CONCAT(DISTINCT ?evolLabel; separator=", ") AS ?evolLabels) (GROUP_CONCAT(DISTINCT ?evolNumber; separator=", ") AS ?evolNumbers) WHERE {
    
        # Identifier les Pokémon
        ?pokemon wdt:P31/wdt:P279* wd:Q3966183 .  # Classe Pokémon

        # Récupérer le numéro de Pokédex
        ?pokemon wdt:P1685 ?pokedexNumber .

        # Identifier la ligne évolutive du Pokémon
        ?pokemon wdt:P361 ?evolLineStatement .
        ?evolLineStatement wdt:P31 wd:Q15795637 .
        ?evolLineStatement wdt:P527 ?evol .

        # Récupérer les labels du Pokémon
        ?pokemon rdfs:label ?pokemonLabel .
        ?evol rdfs:label ?evolLabel .
        ?evol wdt:P1685 ?evolNumber .

        # Filtrer les labels en français
        FILTER((LANG(?pokemonLabel) = "fr"))
        FILTER((LANG(?evolLabel) = "fr"))
        FILTER(?pokedexNumber = '${formattedId}')
    }
    GROUP BY ?pokemon ?pokemonLabel ?pokedexNumber
    ORDER BY xsd:integer(?pokedexNumber)
    `;
}

function generationsRequest(id) {
    // Formater l'ID pour qu'il ait toujours 3 chiffres avec des zéros devant
    const formattedId = id.toString().padStart(3, '0');

    return `SELECT DISTINCT ?pokemon ?pokemonLabel ?pokedexNumber ?generationLabel WHERE {
  
        # Identifier les Pokémon
        ?pokemon wdt:P31/wdt:P279* wd:Q3966183 .  # Classe Pokémon

        # Récupérer le numéro de Pokédex
        ?pokemon wdt:P1685 ?pokedexNumber .

        # Identifier la génération avec P4584
        ?pokemon wdt:P4584 ?generation .
        ?generation rdfs:label ?generationLabel .

        # Récupérer les labels du Pokémon
        ?pokemon rdfs:label ?pokemonLabel .


        # Filtrer les labels en français
        FILTER((LANG(?pokemonLabel) = "fr"))
        FILTER((LANG(?generationLabel) = "fr"))
        FILTER(?pokedexNumber = '${formattedId}')
    }
    GROUP BY ?pokemon ?pokemonLabel ?pokedexNumber ?generationLabel
    ORDER BY xsd:integer(?pokedexNumber)
    `;   

}
      
function pokemonsRequestTriplyDB() {
  return `
    PREFIX poke: <https://triplydb.com/academy/pokemon/vocab/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?name ?description ?speciesLabel ?baseHP ?baseAttack ?baseDefense ?baseSpAtk ?baseSpDef ?baseSpeed ?length ?weight ?nb 
           (GROUP_CONCAT(?typeLabel; separator=', ') AS ?types)
    WHERE {
      ?pokemon poke:name ?name;
               poke:description ?description;
               poke:type ?type;
               poke:species ?species;
               poke:baseHP ?baseHP;
               poke:baseAttack ?baseAttack;
               poke:baseDefense ?baseDefense;
               poke:baseSpAtk ?baseSpAtk;
               poke:baseSpDef ?baseSpDef;
               poke:baseSpeed ?baseSpeed;
               poke:length ?length;
               poke:weight ?weight;
               poke:nationalNumber ?nb.

      ?species rdfs:label ?speciesLabel.
      ?type rdfs:label ?typeLabel.

      FILTER(lang(?description) = 'fr-fr' && lang(?name) = 'fr-fr')
    }
    GROUP BY ?name ?description ?speciesLabel ?baseHP ?baseAttack ?baseDefense ?baseSpAtk ?baseSpDef ?baseSpeed ?length ?weight ?nb
    ORDER BY ?nb
  `;
}

function pokemonRequestTriplyDB(id) {
  return `
    PREFIX poke: <https://triplydb.com/academy/pokemon/vocab/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    SELECT ?name ?description ?speciesLabel ?baseHP ?baseAttack ?baseDefense ?baseSpAtk ?baseSpDef ?baseSpeed ?length ?weight ?nb 
           (GROUP_CONCAT(?typeLabel; separator=', ') AS ?types)
    WHERE {
      ?pokemon poke:name ?name;
               poke:description ?description;
               poke:type ?type;
               poke:species ?species;
               poke:baseHP ?baseHP;
               poke:baseAttack ?baseAttack;
               poke:baseDefense ?baseDefense;
               poke:baseSpAtk ?baseSpAtk;
               poke:baseSpDef ?baseSpDef;
               poke:baseSpeed ?baseSpeed;
               poke:length ?length;
               poke:weight ?weight;
               poke:nationalNumber ?nb.

      ?species rdfs:label ?speciesLabel.
      ?type rdfs:label ?typeLabel.

      FILTER(lang(?description) = 'fr-fr' && lang(?name) = 'fr-fr')
      FILTER(?nb = ${id})
    }
    GROUP BY ?name ?description ?speciesLabel ?baseHP ?baseAttack ?baseDefense ?baseSpAtk ?baseSpDef ?baseSpeed ?length ?weight ?nb
    ORDER BY ?nb
  `;
}

function moviesRequestWikiData() {
  return `SELECT DISTINCT 
  ?movie 
  ?movieLabel 
  (MIN(?releaseDate) AS ?earliestReleaseDate) 
  ?sequelLabel 
  (GROUP_CONCAT(DISTINCT ?directorLabel; separator=",") AS ?directors)
  (GROUP_CONCAT(DISTINCT ?screenwriterLabel; separator=",") AS ?screenwriters)
  ?productionCompanyLabel 
  ?duration 
  ?tmdbID
  ?imdbID 
  ?metacriticScore 
  ?eirinRatingLabel
WHERE {
  # Find items that are instances of anime films or general films
  ?movie wdt:P31 ?movieType;
         wdt:P527* ?series. # Part of a series
  
  # Ensure the type is either anime film or general film
  VALUES ?movieType { wd:Q20650540 wd:Q11424 } # Anime film or general film

  # Ensure the series is related to Pokémon
  ?series wdt:P179 wd:Q97138261. # "Pokémon" series

  # Optional properties for additional information
  OPTIONAL { ?movie wdt:P577 ?releaseDate. } # Release date
  OPTIONAL { ?movie wdt:P345 ?imdbID. }      # IMDb ID
  OPTIONAL { ?movie wdt:P57  ?director. }    # Directors
  OPTIONAL { ?movie wdt:P58   ?screenwriter. } # Screenwriter
  OPTIONAL { ?movie wdt:P162  ?producer. }   # Producer
  OPTIONAL { ?movie wdt:P272  ?productionCompany. } # Production company
  OPTIONAL { ?movie wdt:P2047 ?duration. }   # Duration
  OPTIONAL { ?movie wdt:P3834 ?eirinRating. } # EIRIN film rating
  OPTIONAL { ?movie wdt:P4947 ?tmdbID. }     # TMDb ID
  OPTIONAL { ?movie wdt:P4969 ?sequel. }  # Sequel
  OPTIONAL { 
    ?movie p:P444 ?metacriticStatement. 
    ?metacriticStatement ps:P444 ?metacriticScore. 
    ?metacriticStatement pq:P447 wd:Q150248. 
  }

  
  SERVICE wikibase:label { 
    bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,fr". 
  }
}
GROUP BY 
  ?movie
  ?movieLabel
  ?sequelLabel 
  ?productionCompanyLabel 
  ?duration
  ?tmdbID
  ?imdbID
  ?metacriticScore
  ?eirinRatingLabel
ORDER BY ?earliestReleaseDate
`;
}

function gamesRequestWikiData() {
  return `SELECT DISTINCT ?videogame ?videogameLabel ?releaseDate ?directorLabel ?locationLabel 
    WHERE {
      ?videogame wdt:P31 wd:Q7889;
                 wdt:P179 wd:Q24558579.
      OPTIONAL { ?videogame wdt:P577 ?releaseDate. }
      OPTIONAL { ?videogame wdt:P57 ?director. }
      OPTIONAL { ?videogame wdt:P840 ?location. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],fr,en". }
    }
    ORDER BY ?releaseDate
    `
}