const db = require("../models");
const ROLES = db.ROLES; // Importe les rôles définis dans la base de données
const User = db.user; // Importe le modèle d'utilisateur

// Middleware pour vérifier les doublons de nom d'utilisateur ou d'e-mail
checkDuplicateUsernameOrEmail = (req, res, next) => {
    // Vérifie si le nom d'utilisateur est déjà utilisé
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        // Si un utilisateur avec le même nom d'utilisateur est trouvé, renvoie une erreur 400
        if (user) {
            res.status(400).send({ message: "Failed! Username is already in use!" });
            return;
        }

        // Vérifie si l'e-mail est déjà utilisé
        User.findOne({
            email: req.body.email
        }).exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            // Si un utilisateur avec le même e-mail est trouvé, renvoie une erreur 400
            if (user) {
                res.status(400).send({ message: "Failed! Email is already in use!" });
                return;
            }
            next();
        });
    });
};

// Middleware pour vérifier l'existence des rôles spécifiés
checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        // Parcourt tous les rôles spécifiés dans la demande
        for (let i = 0; i < req.body.roles.length; i++) {
            // Vérifie si chaque rôle spécifié existe dans les rôles définis dans la base de données
            if (!ROLES.includes(req.body.roles[i])) {
                // Si un rôle spécifié n'existe pas, renvoie une erreur 400
                res.status(400).send({
                    message: `Failed! Role ${req.body.roles[i]} does not exist!`
                });
                return;
            }
        }
    }
    next();
};

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
};

module.exports = verifySignUp;
