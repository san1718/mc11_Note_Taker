// Framework to build server
const express = require("express");
// Module that will handle file operations
const fs = require("fs");
// Module for pathing
const path = require("path");
// Required for unique id generation
const { v4: uuidv4 } = require("uuid");

// Creates an express instance and defines server port
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for serving static files and parsing request bodies
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to serve the notes page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "public/notes.html"))
);

// API route to fetch all notes
app.get("/api/notes", (req, res) => {
  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }
    // Sends parsed notes as json
    res.json(JSON.parse(data));
  });
});

// API route to add a new note
app.post("/api/notes", (req, res) => {
  const newNote = {
    // Assigns a unique id to the new note
    id: uuidv4(),
    title: req.body.title,
    text: req.body.text,
  };

  // Reads content from the json
  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      // Will return error if there is no readable notes
      return res.status(500).json({ error: "Failed to read notes" });
    }

    // Parses the existing notes
    const notes = JSON.parse(data);
    // Adds the new note
    notes.push(newNote);

    try {
      fs.writeFileSync(
        path.join(__dirname, "db/db.json"),
        // Writes the updated notes to the file
        JSON.stringify(notes, null, 2),
        "utf8"
      );
      // Responds to the newly created note
      res.json(newNote);
    } catch (err) {
      return res.status(500).json({ error: "Failed to save note" });
    }
  });
});

// API route deleting notes by id
app.delete("/api/notes/:id", (req, res) => {
  // Extracts the note id from requested
  const noteId = req.params.id;

  fs.readFile(path.join(__dirname, "db/db.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read notes" });
    }

    const notes = JSON.parse(data);
    // Removes the specified note from list
    const updatedNotes = notes.filter((note) => note.id !== noteId);

    try {
      fs.writeFileSync(
        path.join(__dirname, "db/db.json"),
        // Writes the updated notes back to the file
        JSON.stringify(updatedNotes, null, 2),
        "utf8"
      );
      res.json({ message: "Note deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete note" });
    }
  });
});

// Route to serve the homepage
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

// Starts the server and listens on the defined port
app.listen(PORT, () =>
  console.log(`Note-Pad app listening at http://localhost:${PORT}`)
);
