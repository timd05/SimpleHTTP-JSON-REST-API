const express = require('express');
const { v4: uuidv4 } = require('uuid'); // UUID-Generator
const fs = require('fs'); // Modul zum Arbeiten mit Dateien
const app = express();
const port = 8000;

// Wetterdaten importieren
const weatherData = require('./weather.json');

const saveWeatherDataToFile = () => {
    fs.writeFileSync('./weather.json', JSON.stringify(weatherData, null, 2), 'utf8');
};
// Middleware hinzufügen, um JSON-Daten zu parsen
app.use(express.json());

// Aufgabe 4.1:
// GET-Methode für /weather
app.get('/weather', (req, res) => {
    res.json(weatherData);
});

// Aufgabe 4.2:
// POST-Methode für /weather
app.post('/weather', (req, res) => {
    // Daten aus dem Body der Anfrage extrahieren
    const newWeatherEntry = req.body;

    // UUIDs für id und auth generieren
    const id = uuidv4();
    const auth = uuidv4();

    // Neuen Eintrag erstellen und IDs hinzufügen
    const completeEntry = { id, auth, newWeatherEntry };

    // Eintrag zur Wetterliste hinzufügen
    weatherData.push(completeEntry);

    saveWeatherDataToFile();

    // Erfolgsmeldung mit ID und auth zurückgeben
    res.status(201).json({
        message: 'Weather data added successfully',
        id,
        auth,
        data: completeEntry,
    });
});

// Aufgabe 4.3:
// GET-Methode für /weather/{id}
app.get('/weather/:id', (req, res) => {
    // Die ID aus der URL extrahieren
    const { id } = req.params;

    // Wettereintrag mit der entsprechenden ID finden
    const weatherEntry = weatherData.find(entry => entry.id === id);

    // Wenn der Eintrag nicht gefunden wurde
    if (!weatherEntry) {
        return res.status(404).json({ error: 'Weather entry not found' });
    }

    // Den gefundenen Eintrag zurückgeben
    res.status(200).json(weatherEntry);
});

// Aufgabe 4.4:
// PUT-Methode für /weather/{id}?auth={auth}
app.put('/weather/:id', (req, res) => {
    const newEntry = req.body;

    // ID aus der URL extrahieren
    const { id } = req.params;

    // auth aus der URL extrahieren (Query-Parameter)
    const { auth } = req.query;

    // Wettereintrag mit der entsprechenden ID finden
    const weatherEntry = weatherData.find(entry => entry.id === id);

    // Wenn der Eintrag nicht gefunden wurde
    if (!weatherEntry) {
        return res.status(404).json({ error: 'Weather entry not found' });
    }

    // Prüfen der Authentifizierung
    if (weatherEntry.auth === auth) {
        // Wettereintrag aktualisieren
        Object.assign(weatherEntry, newEntry);
        saveWeatherDataToFile();
        res.status(200).json(weatherEntry);
    } else {
        return res.status(401).json({ error: 'You are unauthorized.' });
    }
});


// Aufgabe 4.5:
// DELETE-Methode für /weather/{id}?auth={auth}
app.delete('/weather/:id', (req, res) => {
    // ID aus der URL extrahieren
    const { id } = req.params;

    // auth aus der URL extrahieren
    const { auth } = req.query;

    // Index des Wettereintrags mit der entsprechenden ID finden
    const index = weatherData.findIndex(entry => entry.id === id);

    // Wenn der Eintrag nicht gefunden wurde
    if (index === -1) {
        return res.status(404).json({ error: 'Weather entry not found' });
    }

    const weatherEntry = weatherData[index];

    // Prüfen der Authorisierung
    if (weatherEntry.auth !== auth) {
        return res.status(401).json({ error: 'You are unauthorized.' });
    }
    
    // Eintrag entfernen
    weatherData.splice(index, 1);
    saveWeatherDataToFile();
    res.status(200).json({ message: 'Weather entry deleted successfully', id });
})

// Server starten
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
