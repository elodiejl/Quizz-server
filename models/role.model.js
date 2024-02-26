const mongoose = require("mongoose");

// Définition du modèle Role
const Role = mongoose.model(
    "Role", // Nom du modèle
    new mongoose.Schema({
        name: String // Champ "name" de type String
    })
);

module.exports = Role;
