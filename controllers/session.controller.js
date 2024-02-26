const mongoose = require("mongoose");
const Session = require("../models/session.js");
const PlayerResult = require("../models/playerResult");
const Quiz = require("../models/quiz.model.js");

// Fonction pour créer une nouvelle session
const createSession = async (quizId, userId, nbOfParticipants, socket) => {
    // Récupère le quiz correspondant à l'ID fourni
    const quiz = await Quiz.findById(quizId);
    // Vérifie si le quiz existe
    if (!quiz) {
        return { success: false, message: "Quiz not found" };
    }

    // Crée une nouvelle session avec les détails fournis
    const session = new Session({
        hostId: userId,
        quizId,
        nbOfParticipants: nbOfParticipants,
        sessionId: Math.random().toString(36).substring(2, 7),
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
        date: new Date().toISOString(),
        isLive: false,
        playerList: [],
        playerResultList: [],
    });

    try {
        // Enregistre la nouvelle session dans la base de données
        const newSession = await session.save();
        return { success: true, message: "Session created", session: newSession };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Fonction pour ajouter un joueur à une session
const addPlayer = async (sessionId, pin, userId, socket) => {
    try {
        // Récupère la session correspondant à l'ID fourni
        const session = await Session.findOne({ sessionId });
        // Vérifie si la session est en cours
        if (session.isLive) {
            return { sucess: false, message: "The session is live" };
        }
        // Vérifie si le code PIN est valide
        if (session.pin !== pin) {
            return { sucess: false, message: "Invalid pin" };
        }
        // Vérifie si l'utilisateur est déjà dans la session
        if (session.playerList.includes(userId)) {
            return { sucess: false, message: "The user is already in the session" };
        }
        // Vérifie si la session est pleine
        if (session.nbOfParticipants === session.playerList.length) {
            return { sucess: false, message: "The session is full" };
        }
        // Ajoute l'ID de l'utilisateur à la liste des joueurs de la session
        session.playerList.push(userId);
        // Enregistre les modifications dans la base de données
        await session.save();
        return { sucess: true, message: "Player added to session" };
    } catch (error) {
        return { sucess: false, message: error.message };
    }
};

// Fonction pour démarrer une session
const startSession = async (sessionId, userId, socket) => {
    try {
        // Récupère la session correspondant à l'ID fourni
        const session = await Session.findOne({ sessionId });
        // Vérifie si la session est déjà en cours
        if (session.isLive) {
            return { success: false, message: "The session is already live" };
        }
        // Marque la session comme en cours
        session.isLive = true;
        // Récupère les détails du quiz correspondant à la session
        const quiz = await Quiz.findById(session.quizId);
        // Vérifie si le quiz existe
        if (!quiz) {
            return { success: false, message: "Quiz not found" };
        }
        // Vérifie si le quiz doit être mélangé
        const isQuizRandom = quiz.quizConfig.randomOrder === true;
        // Mélange l'ordre des questions si nécessaire
        if (isQuizRandom) {
            const questionIdList = quiz.questionList.map((question, index) => index);
            session.questionIdList = shuffle(questionIdList);
        } else {
            session.questionIdList = quiz.questionList.map((question, index) => index);
        }
        // Enregistre les modifications dans la base de données
        await session.save();
        // Récupère la première question du quiz
        const firstQuestion = quiz.questionList[session.questionIdList[0]];
        // Initialise les réponses à null
        firstQuestion.answerList = firstQuestion.answerList.map(answer => answer.isCorrect = null);
        return { success: true, message: "Session started", isLive: true, question: firstQuestion };
    } catch (error) {
        return { success: false, message: error.message, isLive: false, question: null };
    }
};

// Fonction pour calculer les points du joueur
const calculatePoints = (correctAnswers, playerAnswers, answerTime, questionTime) => {
    if (correctAnswers.length !== playerAnswers.length) {
        return 0;
    } 
    const allCorrectAnswersMatch = correctAnswers.every(answer => playerAnswers.includes(answer));
    const allPlayerAnswersMatch = playerAnswers.every(answer => correctAnswers.includes(answer));
    if (!allCorrectAnswersMatch || !allPlayerAnswersMatch) {
        return 0;
    } else {
        return 100 * (1 - answerTime / questionTime);
    }
};

// Fonction pour passer à la question suivante
const nextQuestion = async (sessionId) => {
    try {
        // Récupère la session correspondant à l'ID fourni
        const session = await Session.findOne({ sessionId });
        // Vérifie si la session est en cours
        if (!session.isLive) {
            return { success: false, message: "The session is not live" };
        }
        // Récupère les détails du quiz correspondant à la session
        const quiz = await Quiz.findById(session.quizId);
        // Vérifie si le quiz existe
        if (!quiz) {
            return { success: false, message: "Quiz not found" };
        }
        // Récupère l'indice de la question actuelle
        const currentQuestionIndex = session.questionIdList.shift();
        // Récupère l'indice de la prochaine question
        const nextQuestionIndex = session.questionIdList[0];
        // Récupère les détails de la question actuelle et de la prochaine question
        const currentQuestion = quiz.questionList[currentQuestionIndex];
        const nextQuestion = quiz.questionList[nextQuestionIndex];
        return { success: true, message: "Next question found", currentQuestion, nextQuestion };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Fonction pour soumettre la réponse d'un joueur
const submitResponse = async (sessionId, userId, response, socket) => {
    try {
        // Récupère la session correspondant à l'ID fourni
        const session = await Session.findOne({ sessionId });
        // Vérifie si la session est en cours
        if (!session.isLive) {
            return { success: false, message: "The session is not live" };
        }
        // Récupère les détails du quiz correspondant à la session
        const quiz = await Quiz.findById(session.quizId);
        // Récupère l'indice de la question pour laquelle la réponse est soumise
        let currentQuestion = response.questionIndex;
        // Récupère les réponses correctes pour la question actuelle
        const correctAnswers = quiz.questionList[currentQuestion].answerList.filter(answer => answer.isCorrect === true).map(answer => answer.name);
        // Récupère les résultats du joueur
        const playerResult = await PlayerResult.findOne({ playerId: userId, gameId: session._id });
        // Récupère le temps alloué pour répondre à la question actuelle
        const questionTime = quiz.questionList[currentQuestion].answerTime;
        // Calcule les points du joueur en fonction de sa réponse
        const points = calculatePoints(correctAnswers, response.answers, response.time, questionTime);
        // Met à jour les résultats du joueur avec sa réponse
        playerResult.answers.push(
            {
                questionIndex: response.questionIndex,
                answered: true,
                answers: response.answers,
                time: response.time,
                points: points,
            }
        );
        // Met à jour le score total du joueur
        playerResult.score += points;
        await playerResult.save();
        // Récupère le classement des joueurs
        const leaderBoard = await LeaderBoard.findOne({ gameId: session._id });
        return { success: true, message: "Response submitted", playerResult, leaderBoard };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Fonction utilitaire pour mélanger un tableau
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Exporte toutes les fonctions
module.exports = { createSession, addPlayer, startSession, submitResponse, nextQuestion };
