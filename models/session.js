const mongoose = require("mongoose");
const PlayerResult = require("./playerResult");
const LeaderBoard = require("./leaderBoard");

// Schéma de la session
const sessionSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Référence vers le modèle User
    },
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz", // Référence vers le modèle Quiz
    },
    sessionId: {
        type: String, // Identifiant de session
    },
    pin: {
        type: String, // Code PIN de la session
    },
    isLive: {
        type: Boolean, // Indique si la session est en cours
        default: false, // Par défaut, la session n'est pas en cours
    },
    playerList: {
        type: [String], // Liste des ID des joueurs dans la session
        default: [], // Par défaut, la liste est vide
    },
    questionIdList: {
        type: [Number], // Liste des indices de questions dans la session
        default: [], // Par défaut, la liste est vide
    },
    date: {
        type: Date, // Date de création de la session
        required: true,
        default: Date.now, // Par défaut, la date actuelle
    },
    nbOfParticipants: {
        type: Number, // Nombre de participants à la session
        default: 0, // Par défaut, aucun participant
    },
    playerResultList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PlayerResult", // Référence vers le modèle PlayerResult
        },
    ],
});

// Fonction exécutée avant l'enregistrement d'une nouvelle session
sessionSchema.pre('save', async function(next) {
    if (this.isNew) {
        try {
            // Crée les résultats des joueurs pour cette session
            const playerResults = await PlayerResult.insertMany(
                this.playerList.map(playerId => ({
                    playerId,
                    gameId: this._id,
                }))
            );
            // Crée le tableau de bord des leaders pour cette session
            const leaderBoard = new LeaderBoard({
                gameId: this._id,
                playerResultList: playerResults.map(result => result._id),
                questionLeaderboard: [],
                currentLeaderboard: [],
            });
            // Enregistre le tableau de bord des leaders
            await leaderBoard.save();
            // Associe les résultats des joueurs à la session
            this.playerResultList = playerResults.map(result => result._id);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model("Session", sessionSchema);
