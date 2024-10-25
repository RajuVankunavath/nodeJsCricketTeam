const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// GET all API

app.get("/players/", async (request, response) => {
  const getPlayers = `
        SELECT 
        *
        FROM cricket_team
        ORDER BY player_id;`;

  const dbResponse = await db.all(getPlayers);
  response.send(dbResponse.map((player) => convertObj(player)));
});

const convertObj = (player) => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  };
};

// POST (creat and add ) API

app.post("/players/", async (request, response) => {
  const teamDetails = request.body;
  //   console.log(teamDetails)

  const { playerName, jerseyNumber, role } = teamDetails;
  const PlayerAddInTeam = `
   INSERT INTO cricket_team
   (player_name,jersey_number,role)
   VALUES(
       '${playerName}',
       ${jerseyNumber},
       '${role}'
   )
    ;`;

  const dbResponse = await db.run(PlayerAddInTeam);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
  //   response.send(dbResponse);
});

// GET playerDetailsWithPlayerId API

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getDetailsPlater = `
    SELECT 
    *
    FROM cricket_team 
    WHERE player_id = ${playerId} 
    ;`;
  const player = await db.get(getDetailsPlater);
  response.send(convertObj(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `
    UPDATE
    cricket_team
    SET
        player_name = '${playerName}',
        jersey_number= ${jerseyNumber},
        role='${role}'

    WHERE player_id=${playerId} 
    
    ;`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerId = `
    DELETE FROM cricket_team 
    WHERE player_id=${playerId}
    ;`;

  await db.run(deletePlayerId);
  response.send("Player Removed");
});

module.exports = app;
