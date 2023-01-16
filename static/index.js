// Handles updates to the data
let socket = io();
const table = document.getElementById('table');

// When message 'refresh' is received
socket.on('refresh', function(violations) {

    // Remove previous rows
    let tableBody = document.getElementById('tbody');
    tableBody.remove();
    tableBody = document.createElement('tbody');
    tableBody.setAttribute('id', 'tbody');

    // Populate table body with records
    for (const violation of violations) {

        // Create a new row for each violation
        let row = document.createElement('tr');

        // Populate the row with cells ('td' tags)
        let cells = Array(6).fill().map(x => document.createElement('td'));

        // Add values (and links were appropriate)
        cells[0].textContent = violation.detection_time;
        cells[1].textContent = violation.closest_distance;
        cells[2].textContent = violation.first_name;
        cells[3].textContent = violation.last_name;
        cells[4].innerHTML = `<a href="mailto:${violation.email}">${violation.email}</a>`;
        cells[5].innerHTML = `<a href="tel:${violation.phone_number}">${violation.phone_number}</a>`;

        for (const cell of cells) row.appendChild(cell);
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    //window.scrollTo(0, document.body.scrollHeight);
});