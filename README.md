# Install project :

```shell
npm install
```

# to start project : 

```shell
> docker compose build
> docker compose up -d
```
# Petite note


Veuillez noter qu'il n'y a pas d'interface utilisateur pour notre projet. Pour tester les fonctionnalités, veuillez utiliser Postman en accédant à l'adresse `localhost:8080`.


# Contribution de l'équipe

Viet Anh BUI (vietanh2810)
- [ ] Interface de création de quiz
- [x] Communication en temps réel avec Socket.IO
- [x] Notation et résultats
- [x] Synchronisation des états de jeu

Description et réflexion:
Pour la partie Communication en temps réel avec Socket.IO, il y avait 2 parties à gérer:
- Établissement de connexions WebSocket entre le serveur et les clients pour une communication bidirectionnelle.
- Diffusion des questions et réception des réponses en temps réel.
Pour la première partie, j'ai créé un fichier socketServer.js qui initialise une connexion Websocket.
Pour la deuxième partie, toujours dans le même fichier.



Rémy SCHERIER (DrAtsiSama)
- [x] Fonctionnalité de la salle de quiz
- [x] Minuteur côté serveur
- [x] Réglage du temps par question en temps réel
- [ ] Chat en direct lors des quiz

Description et réflexion:

Elodie JOLO (elodiejl)
- [x] Déroulement des questions et réponses
- [x] Retour en direct sur les réponses
- [x] Notifications en temps réel

Description et réflexion: