// Configuration
const numeros = [
	{
		valeur: 1,
		lettre: 'A',
	},
	{
		valeur: 2,
		lettre: '2',
	},
	{
		valeur: 3,
		lettre: '3',
	},
	{
		valeur: 4,
		lettre: '4',
	},
	{
		valeur: 5,
		lettre: '5',
	},
	{
		valeur: 6,
		lettre: '6',
	},
	{
		valeur: 7,
		lettre: '7',
	},
	{
		valeur: 8,
		lettre: '8',
	},
	{
		valeur: 9,
		lettre: '9',
	},
	{
		valeur: 10,
		lettre: '10',
	},
	{
		valeur: 10,
		lettre: 'V',
	},
	{
		valeur: 10,
		lettre: 'D',
	},
	{
		valeur: 10,
		lettre: 'R',
	},
];

const symboles = [
	{
		type: 'coeur',
	},
	{
		type: 'pique',
	},
	{
		type: 'carreau',
	},
	{
		type: 'trefle',
	},
];

const pseudo = [
	{
		id: 'Joueur 1',
		type: 'human',
	},
	{
		id: 'Joueur 2',
		type: 'human',
	},
	{
		id: 'Joueur 3',
		type: 'human',
	},
	{
		id: 'robot',
		type: 'bot',
	},
];

const settings = {
	botMinScore: 17,
	croupierMinScore: 17,
	scoreToGet: 21,
	timePerRound: 20,
	maxLife: 1,
};

// Variables initiales
let game;
const menu = document.querySelector('.start-menu'); // Menu de départ
const affichageCroupier = document.querySelector('.croupier .affichageCroupier'); // Affiche la carte du croupier
const scoreCroupier = document.querySelector('.croupier .score'); // Affiche le score du croupier
const affichageJoueur = document.querySelector('.joueurs .affichageJoueurs'); // Affiche le joueur
const affichageJeu = document.querySelector('.jeu'); // Affiche le jeu
const affichageTransition = document.querySelector('.annonce'); // Affiche les annonces / les transitions
const affichageFin = document.querySelector('.final'); // Affiche la fin du jeu
const affichageCorps = document.querySelector('.corps_croupier'); // Affiche Corps Croupier

// Teste la meilleur combinaison
function best_under_17(combinaison) {
	if (Math.min(...combinaison) > settings.scoreToGet) {
		return Math.min(...combinaison);
	}

	const nouvel_combinaison = combinaison.filter(element => element <= settings.scoreToGet);
	return Math.max(...nouvel_combinaison);
}

// Teste si deux listes sont égales
function array_equals(a, b) {
	return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}

// Classe de la carte
class Card {
	constructor(valeur, type, lettre) {
		this.valeur = valeur; // Valeur de la carte
		this.type = type; // Type de la carte
		this.lettre = lettre; // Lettre de la carte
		this.recto(); // On stocke le recto de la carte
	}

	// Stocke le verso de la carte dans la variable html
	verso() {
		this.html = (window.listeCartes.filter(c => c.lettre === 'C')[0].html); // A optimiser je pense, voir docs.js - Viêt
	}

	// Stocke le recto de la carte dans la variable html
	recto() {
		this.html = (window.listeCartes.filter(c => c.lettre === this.lettre)[0].html).replace('card--type', 'card--' + this.type); // Réaffiche le html des cartes

		if (this.valeur === 10 && this.lettre !== '10') { // Si on est sur une carte "habillée"
			this.html = this.html.replace('{{ svg }}', './../assets/' + this.type + '_' + this.lettre + '.svg'); // On ajoute le bon svg
		}
	}
}

// Classe du joueur
class Joueur {
	constructor(pseudo, bot) {
		this.identifiant = pseudo; // Identifiant du joueur
		this.inventaire = []; // Inventaire du joueur
		this.vie = settings.maxLife; // Vie du joueur
		this.score = 0; // Score du joueur
		this.bot = bot === 'bot'; // Is this player a bot
	}
}

class Croupier {
	constructor() {
		this.identifiant = 'Croupier'; // Identifiant du croupier
		this.inventaire = []; // Inventaire du croupier
		this.score = 0; // Score du croupier
		this.score_affiche = 0; // Score du croupier affiché
		this.html = '<div class="corps"> <div class="background-circle"> <div class="body"></div><div class="habit"><div class="bouttons"><div class="boutton"></div><div class="boutton"></div><div class="boutton"></div></div><div class="chemise"><div class="triangle_cravate"></div><div class="cravate_bout"></div></div><div class="bouttons"><div class="boutton"></div><div class="boutton"></div><div class="boutton"></div></div></div></div><div class="head"><div class="ear" id="left"></div><div class="ear" id="right"></div><div class="hair-main"><div class="sideburn" id="left"></div><div class="sideburn" id="right"></div><div class="hair-top"></div></div><div class="face"><div class="hair-bottom"></div><div class="nose"></div><div class="eye-shadow" id="left"><div class="eyebrow"></div><div class="eye"></div></div><div class="eye-shadow" id="right"><div class="eyebrow"></div><div class="eye"></div></div><div class="mouth"></div></div></div></div>';
	}
}

class Game {
	constructor() {
		this.time = settings.timePerRound; // Temps de jeu
		this.joueurs = []; // Liste des joueurs
		this.cards = []; // Liste des cartes
		this.manche = 1; // Numéro de la manche
		this.joueurs_en_cours = 0; // Numéro du joueur en cours
		this.croupier = new Croupier(); // Croupier
		this.nb_joueurs_en_vie = 0; // Nombre de joueurs en vie

		this.generer_cartes();

		// On crée les joueurs
		for (let index = 0; index < pseudo.length; index++) {
			const nom = pseudo[index].id; // Identifiant du joueur
			const {type} = pseudo[index]; // Type du joueur
			this.joueurs.push(new Joueur(nom, type)); // On ajoute le joueur
		}
	}

	// On s'assure que la liste de cartes est vide
	generer_cartes() {
		this.cards = [];
		// On crée le jeu de cartes
		for (let i = 0; i < numeros.length; i++) {
			const {lettre, valeur} = numeros[i]; // Lettre et valeur de la carte
			// On crée la carte pour chaque symbole
			for (let j = 0; j < symboles.length; j++) {
				const {type} = symboles[j]; // Type de la carte
				this.cards.push(new Card(valeur, type, lettre)); // On ajoute la carte
			}
		}
	}

	// Tour du croupier
	tour_croupier() {
		let as = 0; // Nombre d'as
		const position = []; // Position des cartes du croupier
		for (let i = 0; i < 2; i++) { // On prend 2 cartes au hasard
			game.croupier.inventaire.push(game.cards.shift()); // On ajoute les cartes au croupier
			if (game.croupier.inventaire[i].valeur === 1) { // Si on a un as
				as += 1; // On incrémente le nombre d'as
			} else {
				position.push(i); // Sinon on ajoute la position de la carte
			}
		}

		let combinaison = []; // On crée la combinaison
		if (as !== 0) { // Si on a un as
			combinaison = [1, 11]; // On crée la combinaison
			for (let i = 1; i < as; i++) {
				combinaison[0] += 1;
				combinaison[1] += 1;
			}
		}

		let somme_croupier = game.croupier.inventaire[0].valeur + game.croupier.inventaire[1].valeur; // On calcule le score du croupier

		if (!(array_equals(combinaison, []))) { // Si on a une combinaison qui n'est pas vide
			for (const element of position) { // Pour chaque position
				[combinaison[0], combinaison[1]] = [combinaison[0] + game.croupier.inventaire[element].valeur, combinaison[1] + game.croupier.inventaire[element].valeur];
				somme_croupier = Math.max(...combinaison); // On calcule le score du croupier avec la valeur maximale de la combinaison
			}
		}

		let a = 1; // Nombre de tour de boucle
		while (somme_croupier < settings.croupierMinScore) { // Tant que le score du croupier est inférieur à 17
			a += 1; // On incrémente le nombre de tour de boucle
			this.croupier.inventaire.push(this.cards.shift()); // On ajoute une carte au croupier
			if (this.croupier.inventaire[a].valeur === 1) { // Si on a un as
				as += 1; // On incrémente le nombre d'as
				if (as === 1) { // Si on a un seul as
					const combinaison = [somme_croupier + 1, somme_croupier + 11]; // On crée la combinaison
					somme_croupier = best_under_17(combinaison); // On calcule le score du croupier avec la valeur maximale de la combinaison
				} else if (as !== 0) { // Si on a zéro as
					for (let i = 0; i < combinaison.length; i++) { // Pour chaque combinaison
						combinaison[i] += 1; // On incrémente la combinaison
					}

					somme_croupier = best_under_17(combinaison); // On calcule le score du croupier avec la valeur maximale de la combinaison
				}
			} else {
				somme_croupier += game.croupier.inventaire[a].valeur; // On calcule le score du croupier
			}
		}

		for (let i = 1; i < this.croupier.inventaire.length; i++) { // Pour chaque carte du croupier
			this.croupier.inventaire[i].verso(); // On cache la carte
		}

		game.croupier.score = somme_croupier; // On calcule le score du croupier
		game.croupier.score_affiche = this.croupier.inventaire[0].valeur; // On met à jour le score du croupier
		game.affichage(affichageCroupier, game.croupier); // On affiche le croupier
	}

	distribution(liste_joueurs) { // Fonction changée pour ne pas distribuer aux morts, seuls changements : game.joueur => liste_joueurs
		for (let i = game.cards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[game.cards[i], game.cards[j]] = [game.cards[j], game.cards[i]];
		}

		for (let i = 0; i < liste_joueurs.length; i++) { // Pour chaque joueur
			for (let k = 0; k < 2; k++) { // Pour chaque carte
				liste_joueurs[i].inventaire.push(game.cards.shift()); // On ajoute une carte au joueur
			}

			liste_joueurs[i].score = liste_joueurs[i].inventaire[0].valeur + liste_joueurs[i].inventaire[1].valeur; // On calcule le score du joueur
		}

		game.affichage(affichageJoueur, liste_joueurs[game.joueurs_en_cours]); // On affiche le joueur
	}

	// Piocher une carte
	pioche(joueur_en_cours) {
		if (game.joueurs[joueur_en_cours].score > settings.scoreToGet) { // Si le score du joueur est supérieur à settings.scoreToGet
			return;
		}

		game.joueurs[joueur_en_cours].inventaire.push(game.cards.shift()); // On ajoute une carte au joueur
		const position = game.joueurs[joueur_en_cours].inventaire.length - 1; // On calcule la position de la carte
		game.joueurs[joueur_en_cours].score += game.joueurs[joueur_en_cours].inventaire[position].valeur; // On calcule le score du joueur
		game.ajout_carte(affichageJoueur, game.joueurs[joueur_en_cours]); // On affiche le joueur
		if (game.joueurs[joueur_en_cours].score > settings.scoreToGet) { // Si le score du joueur est supérieur à settings.scoreToGet
			game.time += 4; // On augmente le temps
			setTimeout(() => { // On attend 2,7 secondes
				game.tour_suivant(joueur_en_cours); // On passe au tour suivant
			}, 2700);
		} else {
			game.time = settings.timePerRound; // On remet le temps à settings.timePerRound
		}
	}

	// Tour suivant
	tour_suivant(joueur_en_cours) {
		if (joueur_en_cours === game.joueurs.length - 1) { // Si on est au dernier joueur
			game.decompte_points(); // On décompte les points

			let nb_joueurs_en_vie = 0; // Nombre de joueur en vie
			for (let index = 0; index < pseudo.length; index++) { // Pour chaque joueur
				if (game.joueurs[index].vie > 0) { // Si le joueur est en vie
					nb_joueurs_en_vie++; // On incrémente le nombre de joueur en vie
				}
			}

			game.nb_joueurs_en_vie = nb_joueurs_en_vie; // On met à jour le nombre de joueur en vie

			game.resultatTour();
		} else if (game.joueurs[joueur_en_cours + 1].vie <= 0) {
			game.tour_suivant(joueur_en_cours + 1);
		} else if (game.joueurs[joueur_en_cours + 1].bot) {
			game.tour_bot(joueur_en_cours + 1);
			game.tour_suivant(joueur_en_cours + 1);
		} else {
			game.joueurs_en_cours = joueur_en_cours + 1;
			game.affichage(affichageJoueur, game.joueurs[game.joueurs_en_cours]);
			game.transition('');
			game.time = settings.timePerRound;
		}
	}

	manche_suivante() {
		document.querySelector('.final').classList.add('hide');
		affichageJeu.classList.remove('hide');
		game.time = settings.timePerRound;
		game.manche += 1;
		game.joueurs_en_cours = 0;
		game.croupier = new Croupier();
		game.affichage(affichageJoueur, game.joueurs[game.joueurs_en_cours]);
		affichageFin.classList.add('show-anim');

		this.generer_cartes();

		const liste_joueurs = game.joueurs.slice(); // A modifier/exploiter pour ne pas afficher les morts
		for (let index = 0; index < pseudo.length; index++) {
			game.joueurs[index].inventaire = [];
			if (game.joueurs[index].vie === 0) {
				liste_joueurs.splice(index, 1);
			}
		}

		game.distribution(liste_joueurs);
		game.tour_croupier();
		if (game.joueurs[game.joueurs_en_cours].vie <= 0) {
			game.tour_suivant(game.joueurs_en_cours);
		}

		game.transition('Manche : ' + game.manche + '<br>');
	}

	decompte_points() {
		for (let index = 0; index < pseudo.length; index++) {
			if (((game.joueurs[index].score < game.croupier.score && (game.croupier.score < settings.scoreToGet)) || (game.joueurs[index].score > settings.scoreToGet)) && (game.joueurs[index].vie > 0) && (game.croupier.score < settings.scoreToGet)) {
				game.joueurs[index].vie -= 1;
			}
		}
	}

	ajout_carte(emplacement, contenu) {
		const new_carte_html = document.createElement('div');
		new_carte_html.classList.add('carte', 'carte-anim');
		contenu.inventaire[contenu.inventaire.length - 1].verso();
		new_carte_html.innerHTML = contenu.inventaire[contenu.inventaire.length - 1].html;
		const carte_html = emplacement.children[1].appendChild(new_carte_html);
		setTimeout(() => {
			// Passsage au recto de la carte
			contenu.inventaire[contenu.inventaire.length - 1].recto();
			carte_html.innerHTML = contenu.inventaire[contenu.inventaire.length - 1].html;

			// Mise à jour du score
			emplacement.children[2].innerHTML = contenu.identifiant + ' : ' + contenu.score;
		}, 1000);
	}

	affichage(emplacement, contenu) {
		emplacement.querySelector('.vie').innerHTML = contenu.vie + ' x ♥';
		emplacement.querySelector('.score').innerHTML = contenu.identifiant + ' : ' + contenu.score;

		emplacement.querySelector('.main').innerHTML = '';
		if (contenu.identifiant === 'Croupier') {
			for (let k = 0; k < 2; k++) {
				const new_carte_html = document.createElement('div');
				new_carte_html.innerHTML = contenu.inventaire[k].html;
				emplacement.querySelector('.main').appendChild(new_carte_html);
				emplacement.querySelector('.score').innerHTML = contenu.identifiant + ' : ' + contenu.score_affiche;
			}
		} else {
			for (let k = 0; k < contenu.inventaire.length; k++) {
				const new_carte_html = document.createElement('div');
				new_carte_html.innerHTML = contenu.inventaire[k].html;
				emplacement.querySelector('.main').appendChild(new_carte_html);
			}
		}
	}

	transition(information) {
		affichageTransition.classList.add('show-anim');
		affichageTransition.children[0].innerHTML = information + 'A toi de jouer ' + game.joueurs[game.joueurs_en_cours].identifiant;
		setTimeout(() => {
			affichageTransition.classList.remove('show-anim');
			affichageTransition.children[0].innerHTML = '';
			game.time = settings.timePerRound;
		}, 1000);
	}

	conclusion() {
		document.querySelector('.final').classList.remove('hide');
		clearInterval(window.decompte);
		let resultathtml = '';

		for (let index = 0; index < pseudo.length; index++) {
			resultathtml += `<div class="rang">
				<div class="pseudo">${game.joueurs[index].identifiant}</div>
				<div class="viefinal">${game.joueurs[index].vie}</div>
			</div>`;
		}

		affichageFin.children[0].innerHTML = resultathtml;

		let test = 0;
		let gagnant;
		for (let index = 0; index < pseudo.length; index++) {
			if (game.joueurs[index].vie !== 0) {
				test = 1;
				gagnant = game.joueurs[index].identifiant;
			}
		}

		if (test === 0) {
			affichageFin.children[1].innerHTML = 'Il n\'y a pas de gagnant';
		} else {
			affichageFin.children[1].innerHTML = 'Le gagnant est : ' + gagnant;
		}

		affichageFin.children[2].innerHTML = '<button type="button" onclick="window.game()">Lancement</button>';
	}

	resultatTour() {
		game.time = -1;
		affichageJeu.classList.add('hide');
		affichageFin.classList.add('show-anim');
		let resultathtml = '';
		affichageFin.children[0].innerHTML = '';
		affichageFin.children[1].innerHTML = '';
		affichageFin.children[2].innerHTML = '';
		document.querySelector('.final').classList.remove('hide');

		resultathtml += `<div class="rang">
			<div class="pseudo">Croupier</div>
			<div class="cartes">`;
		for (let i = 0; i < game.croupier.inventaire.length; i++) {
			game.croupier.inventaire[i].recto();
			resultathtml += game.croupier.inventaire[i].html;
		}

		resultathtml += `</div>
			<div class="scorefinal">${game.croupier.score}</div>
		</div>`;

		for (let index = 0; index < pseudo.length; index++) {
			if (game.joueurs[index].vie > 0) {
				resultathtml += `<div class="rang">
					<div class="pseudo">${game.joueurs[index].identifiant}</div>
					<div class="cartes">`;
				for (let k = 0; k < game.joueurs[index].inventaire.length; k++) {
					resultathtml += game.joueurs[index].inventaire[k].html;
				}

				resultathtml += `</div>
					<div class="scorefinal">${game.joueurs[index].score}</div>
				</div>`;
			}
		}

		affichageFin.children[0].innerHTML = resultathtml;

		if (game.nb_joueurs_en_vie < 2) {
			affichageFin.children[2].innerHTML = '<button type="button">Suivant</button>';
			setTimeout(() => {
				affichageFin.querySelector('button').addEventListener('click', () => game.conclusion());
			}, 200);
		} else {
			affichageFin.children[2].innerHTML = '<button type="button">Tour suivant</button>';
			setTimeout(() => {
				affichageFin.querySelector('button').addEventListener('click', () => game.manche_suivante());
			}, 200);
		}
	}

	tour_bot(bot) {
		while (game.joueurs[bot].score < settings.botMinScore) {
			game.joueurs[bot].inventaire.push(game.cards.shift()); // On ajoute une carte au joueur
			const position = game.joueurs[bot].inventaire.length - 1;
			game.joueurs[bot].score += game.joueurs[bot].inventaire[position].valeur;
		}
	}
}

window.game = () => {
	menu.classList.remove('start-menu-overlay'); // On retire le menu
	menu.classList.add('hide');
	game = new Game(); // On crée une nouvelle partie

	// Ajout des événements de boutons
	const childs = document.querySelector('.boutons').children;
	childs[0].addEventListener('click', () => game.pioche(game.joueurs_en_cours));
	childs[1].addEventListener('click', () => game.tour_suivant(game.joueurs_en_cours));

	game.distribution(game.joueurs); // On distribue les cartes
	game.tour_croupier(); // On distribue les cartes au croupier
	game.transition(''); // On affiche la transition
	affichageJeu.classList.remove('hide'); // On affiche le jeu
	affichageTransition.classList.remove('show-anim'); // On retire la transition
	affichageFin.classList.remove('show-anim');
	affichageCorps.innerHTML = game.croupier.html;
	affichageCorps.classList.remove('hide');
	document.querySelector('.final').classList.add('hide');

	window.decompte = setInterval(() => {
		game.time--;
		document.querySelector('.chrono-text').innerHTML = game.time;
		if (game.time === 0) {
			game.tour_suivant(game.joueurs_en_cours);
		}
	}, 1000);
};

window.watch = () => {
	console.log(game);
};
