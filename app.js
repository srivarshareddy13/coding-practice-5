const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const app = express()
app.use(express.json())
const initializeDbAndServer = async () => {
  try {
    db = await open({
      fileName: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()
const convertDbObjectToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
//get movies
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM movie 
    ORDER BY movie_id;
    `
  const movies = await db.all(getMoviesQuery)
  response.send(movies.map(each => convertDbObjectToResponse(each)))
})
//add movie
app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {movieId, directorId, movieName, leadActor} = movieDetails
  const addMovieQuery = `
  INSERT 
  INTO 
  movie (movie_id,director_id,movie_name,lead_actor)
  VALUE (
    ${movieId},
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );
  `
  const movies = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})
//get movie
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT *
  FROM movie
  WHERE movie_id = ${movieId};
  `
  const movie = await db.all(getMovieQuery)
  response.send(convertDbObjectToResponse(movie))
})
//update movie
app.put('movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const details = request.body
  const {movieId, directorId, movieName, leadActor} = details
  const updateMovieQuery = `
  UPDATE movie 
  SET 
    movie_id = ${movieId},
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}; 
  WHERE movie_id = ${movieId}
  `
  const movie = await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//delete movie
app.delete('movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE 
  FROM movie  
  WHERE movie_id = ${movieId}
  `
  const movies = await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//get directors
app.get('/directors/', async (request, response) => {
  const getMoviesQuery = `
    SELECT *
    FROM director
    ORDER BY director_id
    `
  const movies = await db.all(getMoviesQuery)
  response.send(movies.map(each => convertDbObjectToResponse(each)))
})

//
app.get('/directors/:directorId/', async (request, response) => {
  const {directorId} = request.params
  const getMoviesQuery = `
    SELECT movie.movie_name as movie_name
    FROM movie join director on movie.director_id = director.director_id
    WHERE director_id = ${directorId}
    `
  const movies = await db.all(getMoviesQuery)
  response.send(movies.map(each => convertDbObjectToResponse(each)))
})

export default app
