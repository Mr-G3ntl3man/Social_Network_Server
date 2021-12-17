import express from "express"
import SpotifyWebApi from 'spotify-web-api-node'
import cors from 'cors'
import bodyParser from 'body-parser'

const lyricsFinder = require('lyrics-finder');

require('dotenv').config()

const PORT = process.env.PORT || process.env.SPARE_PORT

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.post("/refreshToken", async (req, res) => {
   const refreshToken = req.body.refreshToken

   const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken,
   })

   try {
      const data = await spotifyApi.refreshAccessToken()

      res.json({
         accessToken: data.body.access_token,
         expiresIn: data.body.expires_in,
      })
   } catch (e) {
      res.sendStatus(400)
   }

})

app.post("/loginSpotify", async (req, res) => {
   const code = req.body.code

   const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REDIRECT_URI,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
   })

   try {
      const data = await spotifyApi.authorizationCodeGrant(code)

      res.json({
         accessToken: data.body.access_token,
         refreshToken: data.body.refresh_token,
         expiresIn: data.body.expires_in,
      })
   } catch (e) {
      res.sendStatus(400)
   }
})

app.get("/lyrics", async (req, res) => {
   const lyrics = (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"

   res.json({lyrics})
})

app.listen(PORT)
