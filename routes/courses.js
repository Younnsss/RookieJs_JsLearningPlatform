/* global db */
'use strict';
const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');

function escapeHtml(unsafe) {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function groupBy(array, f) {
	const groups = {};
	array.forEach(o => {
		const group = f(o).join('-');
		groups[group] = groups[group] || [];
		delete o.section;
		delete o.module;
		groups[group].push(o);
	});
	return groups;
}

/* GET home page. */
router.get('/', async (req, res) => {
	const sections = [];

	for (let i = 0; i < fs.readdirSync(path.join(__dirname, '../resources/courses')).length - 1; i++) {
		const section = JSON.parse(fs.readFileSync(path.join(__dirname, `../resources/courses/section${i + 1}/section.json`)));
		section.id = i + 1;
		section.modules = [];
		for (let j = 1; j < fs.readdirSync(path.join(__dirname, `../resources/courses/section${i + 1}`)).length; j++) {
			const module = JSON.parse(fs.readFileSync(path.join(__dirname, `../resources/courses/section${i + 1}/module${j}.json`)));
			module.id = j;
			section.modules.push(module);
		}

		sections.push(section);
	}

	let listProgress = null;

	if (req.user !== undefined) {
		const progress = await db.User.getAllProgress(req.user.id);
		listProgress = groupBy(progress, item => [item.section, item.module]);
	}

	res.render('courses', {title: 'Liste des cours', sections, listProgress});
});

router.get('/:id/:id2/next', async (req, res) => {
	const {id, id2} = req.params;

	const {section, module} = req.query;
	if (req.user !== undefined) {
		db.User.updateProgress(req.user.id, parseInt(id, 10), parseInt(id2, 10), 100);
	}

	if (section === undefined || module === undefined) {
		res.redirect(`/courses/${id}/${id2}`);
		return;
	}

	res.redirect(`/courses/${section}/${module}`);
});

router.get('/:id/:id2', async (req, res) => {
	const {id, id2} = req.params;

	const section = JSON.parse(fs.readFileSync(path.join(__dirname, `../resources/courses/section${id}/section.json`)));
	section.id = id;

	// Load a json file in the resources folder and extract in a variable using fs
	const module = JSON.parse(fs.readFileSync(path.join(__dirname, `../resources/courses/section${id}/module${id2}.json`)));
	module.id = id2;
	for (let i = 0; i < module.content.length; i++) {
		if (module.content[i].type === 'code') {
			module.content[i].code = escapeHtml(module.content[i].code);
		}
	}

	if ((fs.readdirSync(path.join(__dirname, `../resources/courses/section${id}`)).length - 1) === parseInt(id2, 10)) {
		if ((fs.readdirSync(path.join(__dirname, '../resources/courses')).length - 1) > parseInt(id, 10)) {
			section.next = parseInt(id, 10) + 1;
			module.next = 1;
		} else {
			section.next = null;
			module.next = null;
		}
	} else {
		section.next = parseInt(id, 10);
		module.next = parseInt(id2, 10) + 1;
	}

	for (let i = 0; i < module.exercices.length; i++) {
		const exercice = module.exercices[i];
		if (exercice.type === 'gapfill') {
			for (let i = exercice.gaps.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[exercice.gaps[i], exercice.gaps[j]] = [exercice.gaps[j], exercice.gaps[i]];
			}

			module.exercices[i].gaps = exercice.gaps;
		}
	}

	let progress;

	if (req.user === undefined) {
		progress = 'unauthorized';
	} else {
		progress = await db.User.getProgress(req.user.id, id, id2);
	}

	res.render('course', {title: 'Cours', section, module, progress, whitenav: true});
});

router.post('/:id/:id2/progress', (req, res) => {
	const {id, id2} = req.params;
	console.log(req.data);
	const {progress} = req.body;

	// Make sure the user is logged in
	if (req.user !== undefined) {
		res.redirect('/me');
	}

	// Make a request to the database to update the progress
	return db.User.updateProgress(req.user.id, parseInt(id, 10), parseInt(id2, 10), progress);
});

module.exports = router;
