const http = require('http');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { XMLParser} = require("fast-xml-parser");



const xml = '<?xml version="1.0" encoding="UTF-8"?>\
<report>\
  <deviceInformation deviceId="GUARDB1RD">\
    <listenRange>500000</listenRange>\
    <deviceStarted>2023-01-14T13:29:16.057Z</deviceStarted>\
    <uptimeSeconds>3469</uptimeSeconds>\
    <updateIntervalMs>2000</updateIntervalMs>\
  </deviceInformation>\
  <capture snapshotTimestamp="2023-01-14T14:27:04.937Z">\
    <drone>\
      <serialNumber>SN-Q8DldvRXa0</serialNumber>\
      <model>HRP-DRP 1 Pro</model>\
      <manufacturer>ProDröne Ltd</manufacturer>\
      <mac>90:1c:5c:5b:aa:4e</mac>\
      <ipv4>39.85.107.28</ipv4>\
      <ipv6>6cba:eaa0:12be:5f3b:ffcb:cf75:8a2b:e819</ipv6>\
      <firmware>6.1.7</firmware>\
      <positionY>255270.06460340694</positionY>\
      <positionX>440305.5585814906</positionX>\
      <altitude>4318.968372588006</altitude>\
    </drone>\
    <drone>\
      <serialNumber>SN-xdAH4TmHMf</serialNumber>\
      <model>Altitude X</model>\
      <manufacturer>DroneGoat Inc</manufacturer>\
      <mac>31:1f:33:44:3a:3d</mac>\
      <ipv4>116.230.43.54</ipv4>\
      <ipv6>e451:e9ad:0e2d:20f7:8abd:a181:68d3:f5b8</ipv6>\
      <firmware>9.6.6</firmware>\
      <positionY>315070.3455133886</positionY>\
      <positionX>181011.72630801165</positionX>\
      <altitude>4953.853099760229</altitude>\
    </drone>\
    <drone>\
      <serialNumber>SN-A8pirD8Ubj</serialNumber>\
      <model>Mosquito</model>\
      <manufacturer>MegaBuzzer Corp</manufacturer>\
      <mac>f9:a0:a7:55:50:60</mac>\
      <ipv4>75.146.51.31</ipv4>\
      <ipv6>35ca:fa04:368b:36f8:9f52:469a:6923:5558</ipv6>\
      <firmware>9.3.8</firmware>\
      <positionY>142827.6255230109</positionY>\
      <positionX>14544.828605481413</positionX>\
      <altitude>4253.008472407863</altitude>\
    </drone>\
    <drone>\
      <serialNumber>SN-M7m7oyjQ4R</serialNumber>\
      <model>Altitude X</model>\
      <manufacturer>DroneGoat Inc</manufacturer>\
      <mac>81:13:f6:d0:82:4c</mac>\
      <ipv4>192.165.34.207</ipv4>\
      <ipv6>53c3:72d6:bb48:be2e:f51a:2625:be07:b800</ipv6>\
      <firmware>1.7.1</firmware>\
      <positionY>282630.90672085417</positionY>\
      <positionX>173367.4356034819</positionX>\
      <altitude>4798.964914113087</altitude>\
    </drone>\
    <drone>\
      <serialNumber>SN-fAG7kQocV_</serialNumber>\
      <model>HRP-DRP 1 Max</model>\
      <manufacturer>ProDröne Ltd</manufacturer>\
      <mac>7a:99:4d:58:02:c9</mac>\
      <ipv4>138.25.252.80</ipv4>\
      <ipv6>d065:81c0:6ffd:a552:d997:ae64:38e4:634f</ipv6>\
      <firmware>0.3.8</firmware>\
      <positionY>347821.63562948786</positionY>\
      <positionX>297954.2488362376</positionX>\
      <altitude>4064.832402781136</altitude>\
    </drone>\
    <drone>\
      <serialNumber>SN-s8JyWArmjr</serialNumber>\
      <model>Altitude X</model>\
      <manufacturer>DroneGoat Inc</manufacturer>\
      <mac>01:bf:d2:a2:78:8b</mac>\
      <ipv4>248.198.243.140</ipv4>\
      <ipv6>4481:327f:5fde:3599:55cf:29bb:2e83:285e</ipv6>\
      <firmware>4.4.4</firmware>\
      <positionY>455779.5231214864</positionY>\
      <positionX>362152.14182326465</positionX>\
      <altitude>4229.60053702873</altitude>\
    </drone>\
  </capture>\
</report>'

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

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: "attr_"
}

const parser = new XMLParser(parserOptions);
// const supabase = createClient('https://uokgtlwjygqqtnzfkjkt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVva2d0bHdqeWdxcXRuemZramt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzMzNzU5ODksImV4cCI6MTk4ODk1MTk4OX0.MlF8bzo06y41zcTEkij7m4QDncUPBFF9Gb_4_-TJlm4', options)
const supabase = createClient('https://rezyblgyhlamfrxqdrxo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlenlibGd5aGxhbWZyeHFkcnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM3MTAyMzEsImV4cCI6MTk4OTI4NjIzMX0.VEtaoqrJounIMyhfhS4dUTXs-Y-N8wO7hCZS5s_mGuc', options)

// async function getData() {
//   const { data, error } = await supabase
//     .from('test')
//     .select('country')

//   console.log(data);
// }
// getData();

// supabase.from('test').select().then(res => {
//   console.log(res);
// });

// fetch('https://assignments.reaktor.com/birdnest/drones')
//     .then((response) => response.text())
//     .then((body) => {
//         const res = parser.parse(body);
//         json = res.report.capture.drone;
//         console.log(res.report.capture.drone);
//     });   
// const res = parser.parse(data)
// console.log(res.report.capture)
// const response = await fetch('https://assignments.reaktor.com/birdnest/drones');
// const body = await response.text();

// console.log(body);

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
  // const xDiff = (x - birdNest.x) ** 2;
  // const yDiff = (y - birdNest.y) ** 2;
  // return Math.sqrt(xDiff + yDiff);
  return Math.sqrt((x - birdNest.x) ** 2 + (y - birdNest.y) ** 2);
}

function cleanViolations() {

}

async function addViolation(serialNumber, dist, timestamp) {

  // Fetch pilot info from the registry
  const pilot = await getPilotInfo(serialNumber);
  // console.log(pilot);
  
  const { error } = await supabase
    .from('violations')
    .insert({
      first_name: pilot.firstName,
      last_name: pilot.lastName,
      email: pilot.email,
      phone_number: pilot.phoneNumber,
      pilot_id: pilot.pilotId,
      closest_distance: dist,
      time: timestamp,
      serial_number: serialNumber
    });
}

// Fetches drone data and checks it for violations
async function process() {
  // Returns an array of the drones currently picked up by the sensor
  const report = await getDrones();

  // The timestamp will be the sensor time, as its the only confirmed
  // timestamp of the sighting
  // console.log(report);
  const time = report.capture.attr_snapshotTimestamp;

  // const drones = report.capture.drone
  for (const drone of report.capture.drone) {
    const dist = distToBirdNest(drone.positionX, drone.positionY);
    if(dist > perimeterRadius) {
      console.log("No violation, dist: " + dist);
      continue;
    }
    // NDZ violation
    console.log("violation with dist: " + dist)
    addViolation(drone.serialNumber, dist, time);
  }

  const { error } = await supabase
    .from('violations')
    .delete()
    .lt('time', "now() - INTERVAL '10 MINUTE')");
}

process();
// console.log(distToBirdNest(400811.45473757136, 209602.62374963035));

http.createServer(function (req, res) {
    /*fs.readFile('main.html', function(err, data) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
    });*/
    res.writeHead(200, {'Content-Type:': 'text/html'});
    res.end("Hello world!")
  }).listen(8080); 