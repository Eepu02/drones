const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const { XMLParser} = require("fast-xml-parser");
const express = require('express');
const { Server } = require("socket.io");

// Database options
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
    headers: {},
  },
};

// XML parser options
const parserOptions = {
  ignoreAttributes: false, // Attributes are needed for the sensor timestamp
  attributeNamePrefix: "attr_"
};

// App is a function handler that can be supplied to an HTTP server
const app = express();
const server = http.createServer(app);
const port = 3000;
const io = new Server(server);
const parser = new XMLParser(parserOptions);
const supabase = createClient(
  "https://rezyblgyhlamfrxqdrxo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlenlibGd5aGxhbWZyeHFkcnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM3MTAyMzEsImV4cCI6MTk4OTI4NjIzMX0.VEtaoqrJounIMyhfhS4dUTXs-Y-N8wO7hCZS5s_mGuc",
  options
);

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set up static file serving (like .css files)
app.use(express.static(__dirname + '/static'));

// Holds the bird nest coordinates
const birdNest = {
  'x': 250000,
  'y': 250000
};

// NDZ perimiter radius (in millimeters)
const perimeterRadius = 100000;

// Fetches and parses XML data from the monitoring equipment endpoint
async function getDrones() {
  try {
    const response = await fetch('https://assignments.reaktor.com/birdnest/drones');
    const body = await response.text();
    return parser.parse(body).report;

  } catch(err) {
    console.log('Error fetching sensor data. Details: ' + err.message);
    return {};
  }
}

// Fetches a pilot's contact info given their drone's serial number
async function getPilotInfo(serialNumber) {
  const url = 'https://assignments.reaktor.com/birdnest/pilots/' + serialNumber;
  try {
    const response = await fetch(url);
    const body = await response.text();
    return JSON.parse(body);

  } catch(err) {
    console.log('Error fetching pilot info. Details: ' + err);
    return {};
  }
}

// Returns the drones distance to the bird nest. Uses the distance formula.
// Altitude can be easily added for 3D-tracking.
function distToBirdNest(x, y) {
  return Math.sqrt((x - birdNest.x) ** 2 + (y - birdNest.y) ** 2);
}

// This function should delete records older than 10 minutes
// However, there is a problem with using
// detection_time < now() - INTERVAL '10 MINUTES'
// For now, records are cleared manually.
async function cleanViolations() {
  const { error } = await supabase
    .from('violations')
    .delete()
    // .lt('detection_time', "2023-01-15 00:35:00+02"); //works
    // .lt('detection_time', "CURRENT_TIMESTAMP - INTERVAL 10 MINUTE");
    .lt('detection_time', Date.now() - 10 * 60000);
  // console.log(Date.now());
}

// Adds a violation to the database
async function addViolation(serialNumber, dist, timestamp) {

  // Fetch pilot info from the registry
  // Pilot info will only be fetched for violators of the NDZ
  //
  // Pilot info may not always be available. In this case, the
  // serial number of the drone will be saved. 
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

// Checks the report for violations
// Violations are added to the database
function checkViolations(report) {

  let isViolated = false;

  // The timestamp will be the sensor time, as its the only confirmed
  // timestamp of the sighting
  const time = report.capture.attr_snapshotTimestamp;

  for (const drone of report.capture.drone) {

    const dist = distToBirdNest(drone.positionX, drone.positionY);
    
    if(dist > perimeterRadius) continue;
    
    // NDZ violation
    addViolation(drone.serialNumber, dist, time);
    isViolated = true;
  }
  return isViolated
}

// Returns all violations within the last 10 minutes
// Returned attributes are (in this order):
// - detection_time
// - closest_distance
// - first_name
// - last_name
// - email
// - phone_number
async function getViolations() {
  // const { data, error } = await supabase
  //   .from('violations')
  //   .select('detection_time, closest_distance, first_name, last_name, email, phone_number')
  //   .gt('detection_time', "now() - INTERVAL '10 minute'") //this doesn't work for some reason
  //   .order('detection_time', { ascending: false });
  const { data, error } = await supabase
    .from('recent_violations') // This is a view defined in the database.
    .select();
  // console.log(data[0]);
  return data;
}

// This function is called on an interval and will check the perimeter
// for violations, fetch violations from the database and signal the
// client to update the table
async function process() {

  const report = await getDrones();

  // Push new data to the client only if new violations are detected
  if(checkViolations(report)) {

    // Returns all violations within the last 10 minutes
    const data = await getViolations();

    // Send the updated violations to the page
    io.emit('refresh', data);
  }
}

// Function process will be called every 2 seconds
// (roughly matches with the endpoint update interval)
setInterval(process, 2 * 1000);

// Handles the initial get request
app.get('/', async (req, res) => {
  const data = await getViolations();
  res.render('pages/index', {
    violations: data
  });
});

server.listen(port, () => {
  console.log(`Server started on port ${port}`)
})