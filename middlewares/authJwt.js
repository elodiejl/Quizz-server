const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

const { TokenExpiredError } = jwt;

// Fonction de gestion des erreurs de jeton JWT
const catchError = (err, res) => {
    // Si le jeton est expiré, renvoie une erreur 401 avec un message approprié
    if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
    }

    // Sinon, renvoie simplement une erreur 401 sans message spécifique
    return res.status(401).send({ message: "Unauthorized!" });
};

// Middleware pour vérifier l'authentification JWT
const verifyToken = (req, res, next) => {
    // Récupère le jeton d'accès à partir des en-têtes de la requête
    const token = req.headers["x-access-token"];

    // Si aucun jeton n'est fourni, renvoie une erreur 403
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    // Vérifie le jeton avec la clé secrète configurée
    jwt.verify(token, config.secret, (err, decoded) => {
        // Si une erreur survient lors de la vérification du jeton, appelle la fonction catchError
        if (err) {
            return catchError(err, res);
        }
        // Si le jeton est valide, ajoute l'ID de l'utilisateur extrait du jeton à la demande et passe au middleware suivant
        req.userId = decoded.id;
        next();
    });
};

// Middleware pour vérifier si l'utilisateur est un administrateur
const hasRole = (roleName) => async (req, res, next) => {
    try {
        // Récupère l'utilisateur à partir de l'ID stocké dans la demande
        const user = await User.findById(req.userId);
        // Récupère tous les rôles de l'utilisateur
        const roles = await Role.find({ _id: { $in: user.roles } });
        
        // Vérifie si l'utilisateur possède le rôle spécifié
        const roleExists = roles.some(role => role.name === roleName);
        // Si l'utilisateur possède le rôle, passe au middleware suivant
        if (roleExists) {
            next();
        } else {
            // Sinon, renvoie une erreur 403
            res.status(403).send({ message: `Require ${roleName} Role!` });
        }
    } catch (err) {
        // En cas d'erreur, renvoie une erreur 500 avec le message d'erreur
        res.status(500).send({ message: err });
    }
};

// Exporte les fonctions de middleware
const authJwt = {
    verifyToken,
    isAdmin: hasRole("admin"), // Middleware pour vérifier le rôle d'administrateur
    isModerator: hasRole("moderator") // Middleware pour vérifier le rôle de modérateur
};

module.exports = authJwt;
