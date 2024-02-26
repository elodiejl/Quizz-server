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

## Description et réflexion:
Pour la mise en place de la communication en temps réel avec Socket.IO, deux aspects étaient à prendre en compte :
- Établissement de connexions WebSocket : Il était nécessaire de permettre la communication bidirectionnelle entre le serveur et les clients. À cette fin, j'ai créé un fichier socketServer.js dédié à l'initialisation des connexions WebSocket.

- Diffusion des questions et réception des réponses en temps réel : Cette fonctionnalité implique la capacité du serveur à diffuser les questions aux clients et à recevoir leurs réponses en temps réel. J'ai également géré cette partie dans le même fichier socketServer.js, en mettant en place les mécanismes nécessaires pour la diffusion des questions et la réception des réponses.



Rémy SCHERIER (DrAtsiSama)
- [x] Fonctionnalité de la salle de quiz
- [x] Minuteur côté serveur
- [x] Réglage du temps par question en temps réel
- [ ] Chat en direct lors des quiz

Description et réflexion:

- La fonctionnalité de la salle de quiz offre une plateforme interactive pour les participants, facilitant l'engagement et la collaboration. 
- Le minuteur côté serveur assure une gestion précise du temps pour chaque question, garantissant l'équité entre les participants.
- Le réglage du temps par question en temps réel permet une adaptation dynamique selon la complexité, optimisant ainsi l'expérience utilisateur. 
- L'intégration d'un chat en direct lors des quiz enrichirait l'interaction sociale entre les participants malheureusement on nous retrouvera pas un code abouti lors de la livraison de ce projet.

Elodie JOLO (elodiejl)
- [x] Déroulement des questions et réponses
- [x] Retour en direct sur les réponses
- [x] Notifications en temps réel

Description et réflexion:
- La mise en œuvre du déroulement des questions et réponses assure un flux fluide pendant les sessions de quiz. 
- Le retour en direct sur les réponses fournit aux participants un feedback immédiat, favorisant ainsi l'apprentissage interactif. 
- Les notifications en temps réel permettent de communiquer instantanément des informations importantes aux participants, améliorant ainsi la réactivité et l'efficacité de la plateforme de quiz.