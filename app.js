const http = require('http');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { XMLParser} = require("fast-xml-parser");
const express = require('express');
const path = require('path');
const { Server } = require("socket.io");

// App is a function handler that can be supplied to an HTTP server
const app = express();
const server = http.createServer(app);
const port = 3000;
const io = new Server(server);

// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));


// Supabase options
const options = {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
}

// XML parser options
const parserOptions = {
  ignoreAttributes: false, // Attributes are needed for the sensor timestamp
  attributeNamePrefix: "attr_"
}

const parser = new XMLParser(parserOptions);
const supabase = createClient('https://rezyblgyhlamfrxqdrxo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlenlibGd5aGxhbWZyeHFkcnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM3MTAyMzEsImV4cCI6MTk4OTI4NjIzMX0.VEtaoqrJounIMyhfhS4dUTXs-Y-N8wO7hCZS5s_mGuc', options)

async function getDrones() {
  const response = await fetch('https://assignments.reaktor.com/birdnest/drones');
  const body = await response.text();
  return parser.parse(body).report;
}

// Must handle 404 error
async function getPilotInfo(serialNumber) {
  const url = 'https://assignments.reaktor.com/birdnest/pilots/' + serialNumber;
  const response = await fetch(url);
  const body = await response.text();
  return JSON.parse(body);
}

// Holds the bird nest coordinates
const birdNest = {
  'x': 250000,
  'y': 250000
};

const perimeterRadius = 100000;

// Returns the drones distance to the bird nest. Uses the distance formula.
// Altitude can be easily added for 3D-tracking.
function distToBirdNest(x, y) {
  return Math.sqrt((x - birdNest.x) ** 2 + (y - birdNest.y) ** 2);
}

async function cleanViolations() {
  // console.log("cleaning old violations!")
  const { error } = await supabase
    .from('violations')
    .delete()
    // .lt('detection_time', "2023-01-15 00:35:00+02"); //works
    // .lt('detection_time', "CURRENT_TIMESTAMP - INTERVAL 10 MINUTE");
    .lt('detection_time', Date.now() - 10 * 60000);
  // console.log(Date.now());
}

async function addViolation(serialNumber, dist, timestamp) {

  // Fetch pilot info from the registry
  // Pilot info will only be fetched for violators of the NDZ
  const pilot = await getPilotInfo(serialNumber);
  
  // Add the record to the database
  const { error } = await supabase
    .from('violations')
    .insert({
      first_name: pilot.firstName,
      last_name: pilot.lastName,
      email: pilot.email,
      phone_number: pilot.phoneNumber,
      pilot_id: pilot.pilotId,
      closest_distance: dist,
      detection_time: timestamp,
      serial_number: serialNumber
    });
}

// Fetches drone data and checks it for violations
async function checkViolations() {

  const report = await getDrones();

  // The timestamp will be the sensor time, as its the only confirmed
  // timestamp of the sighting
  const time = report.capture.attr_snapshotTimestamp;

  for (const drone of report.capture.drone) {
    const dist = distToBirdNest(drone.positionX, drone.positionY);
    if(dist > perimeterRadius) {
      // console.log("No violation, dist: " + dist);
      continue;
    }
    // NDZ violation
    // console.log("violation with dist: " + dist)
    addViolation(drone.serialNumber, dist, time);
  }
}

async function getViolations() {
  // const { data, error } = await supabase
  //   .from('violations')
  //   .select('detection_time, closest_distance, first_name, last_name, email, phone_number')
  //   .gt('detection_time', "now() - INTERVAL '10 minute'") //this doesn't work for some reason
  //   .order('detection_time', { ascending: false });
  const { data, error } = await supabase
    .from('recent_violations') // This is a view defined in the database.
    .select();
  return data;
}

async function process() {
  await checkViolations();

  // Returns all violations within the last 10 minutes
  const data = await getViolations();

  // Send the updated violations to the page
  io.emit('refresh', data);
}

// console.log("starting!");
setInterval(process, 2 * 1000);
// let data = getViolations();

app.get('/', async (req, res) => {
  const data = await getViolations();
  process();
  // console.log(data);
  res.render('pages/index', {
    violations: data
  });
});

// io.on('connection', (socket) => {
//   console.log('a user connected');
//   // socket.broadcast.emit('refresh');
// });

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})