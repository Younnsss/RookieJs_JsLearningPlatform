import Swal from 'sweetalert2';

import Prism from './prism.js';

import './../css/prism.css';

// Manage Quiz State
const quizHandler = [];

/* ===============================================
            Beginning of Quiz
=============================================== */

function quizInit(quizIndex, questions) {
	const quizHandlerInstance = quizHandler[quizIndex];
	quizHandlerInstance.isFinished = false;
	quizHandlerInstance.result = 0;
	quizHandlerInstance.questions = questions;
	quizHandlerInstance.nbQuestions = questions.length;
	quizHandlerInstance.answers = new Array(quizHandlerInstance.nbQuestions).fill(-1);
	quizHandlerInstance.actualQuestion = 1;
	quizHandlerInstance.nbCorrect = 0;

	document.querySelectorAll('.progresstext .max')[quizIndex].innerText = quizHandlerInstance.nbQuestions;
	buildQuestion(quizIndex, quizHandlerInstance.actualQuestion);
}

function calculateQuizResults(quizHandlerInstance) {
	let count = 0;
	for (let i = 0; i < quizHandlerInstance.nbQuestions; i++) {
		if (quizHandlerInstance.answers[i] === quizHandlerInstance.questions[i].correct) {
			count++;
		}
	}

	quizHandlerInstance.nbCorrect = count;
	quizHandlerInstance.result = Math.round(count * (1 / quizHandlerInstance.nbQuestions) * 100);
}

function buildQuestion(quizIndex, nb) {
	const quizHandlerInstance = quizHandler[quizIndex];
	document.querySelectorAll('.progresstext .min')[quizIndex].innerText = nb - 1;
	document.querySelectorAll('.progressbar .bar1')[quizIndex].style.width = `${Math.round(((nb - 1) / quizHandlerInstance.nbQuestions) * 100)}%`;

	const current = quizHandlerInstance.questions[nb - 1];
	document.querySelectorAll('.quiz .question')[quizIndex].innerText = current.question;

	let template = '';
	const letter = 65;
	for (let i = 0; i < current.answers.length && i < 26; i++) {
		template += `<input type="radio" name="answer" id="quiz${quizIndex}answer${i + 1}-check" value="${i + 1}">
        <a data-aos="fade-${i % 2 === 0 ? 'left' : 'right'}" data-aos-delay="${i * 150}" data-for="quiz${quizIndex}answer${i + 1}-check" class="answer answer${i + 1}">
            <span>${String.fromCharCode(letter + i)}</span>
            <p>${current.answers[i]}</p>
        </a>`;
	}

	document.querySelectorAll('.quiz .answers')[quizIndex].innerHTML = template;

	// Add answer click
	document
		.querySelectorAll('.quiz')[quizIndex].querySelectorAll('.answer')
		.forEach(el => {
			el.addEventListener('click', () => {
				const fordata = el.dataset.for;
				document.querySelector('#' + fordata).checked = true;
			});
		});
}

/* ===============================================
            Ending of Quiz
=============================================== */

/* ===============================================
            Beginning of Writing
=============================================== */

const inputarea = document.querySelectorAll('.writing .input');
const outputarea = document.querySelectorAll('.writing .output');

function escapeHtml(unsafe) {
	return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function sync_scroll(input, output) {
	// Get and set x and y
	output.scrollTop = input.scrollTop;
	output.scrollLeft = input.scrollLeft;
}

function writing_update(el) {
	let code = escapeHtml(el.value);
	if (code[code.length - 1] === '\n') {
		code += ' ';
	}

	el.parentElement.querySelector('.output').innerHTML = code;

	Prism.highlightElement(el.parentElement.querySelector('.output'));
	sync_scroll(el, el.parentElement.querySelector('.output'));
}

function writing_check_tab(el, event) {
	const code = el.value;
	if (event.key === 'Tab') {
		/* Tab key pressed */
		event.preventDefault(); // Stop normal
		const before_tab = code.slice(0, el.selectionStart); // Text before tab
		const after_tab = code.slice(el.selectionEnd, el.value.length); // Text after tab
		const cursor_pos = el.selectionEnd + 1; // Where cursor moves after tab - moving forward by 1 char to after tab
		el.value = before_tab + '\t' + after_tab; // Add tab char
		// move cursor
		el.selectionStart = cursor_pos;
		el.selectionEnd = cursor_pos;
		writing_update(el); // Update text to include indent
	}
}

function writingReveal() {
	this.parentElement.querySelector('.writing-blurred').classList.remove('writing-blurred');
	this.parentElement.querySelector('.reveal-text').classList.add('hidden');
	this.removeEventListener('click', writingReveal);
}

Prism.highlightAll();

/* ===============================================
            Ending of Writing
=============================================== */

/* ===============================================
            Beginning of Gap Fill
=============================================== */

function gapInitDragElement(el) {
	el.addEventListener('dragstart', gapDragStart, false);
	el.addEventListener('dragend', gapDragEnd, false);

	// Set draggable elements to draggable
	el.setAttribute('draggable', 'true');
}

function gapDragStart(e) {
	e.stopPropagation();

	this.classList.add('is-dragged');
	e.dataTransfer.effectAllowed = 'copy';
	e.dataTransfer.setData('text', this.innerText);
}

function gapDragEnd(e) {
	e.stopPropagation();
	this.classList.remove('is-dragged');
}

function gapDragEnter(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}

	this.classList.add('gap-dropover');
}

function gapDragLeave(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}

	this.classList.remove('gap-dropover');
}

function gapDragOver(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}

	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
	return false;
}

function gapDrop(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}

	const removeEl = e.dataTransfer.getData('text');
	const boxes = this.parentElement.parentElement.parentElement.querySelectorAll('.word-drag');
	const dropZone = this;
	const mainEl = dropZone.parentElement.parentElement.parentElement;

	this.classList.remove('gap-dropover');
	// Remove the dragged element
	boxes.forEach(el => {
		if (el.innerText === removeEl) {
			if (dropZone.innerHTML === '&nbsp;____&nbsp;') {
				dropZone.innerHTML = `&nbsp;${removeEl}&nbsp;`;
				dropZone.classList.add('cursor-pointer');
				dropZone.dataset.text = removeEl;

				dropZone.addEventListener('click', function gapClickEvent(event) {
					const div = document.createElement('div');
					div.className = 'px-2 py-1 transition-all duration-200 bg-red-700 cursor-move rounded-xl word-drag hover:bg-red-800';
					div.innerText = `${this.dataset.text}`;
					gapInitDragElement(div);
					mainEl.querySelector('.word-container').append(div);

					this.innerHTML = '&nbsp;____&nbsp;';
					this.classList.remove('cursor-pointer');
					gapUpdate(mainEl);
					this.removeEventListener('click', gapClickEvent);
				});

				gapUpdate(mainEl);
				el.remove();

				if (mainEl.querySelectorAll('.word-drag').length === 0) {
					const answers = JSON.parse(mainEl.dataset.answers.replaceAll('§', '"'));
					const userAnswers = mainEl.querySelectorAll('.word-drop');

					let count = 0;

					for (let i = 0; i < userAnswers.length; i++) {
						if (gapFindCorrect(answers, i + 1).text === userAnswers[i].innerText.replace(/\s/g, '')) {
							count++;
						}
					}

					let success = true;

					if ((count / userAnswers.length) < 0.5) {
						success = false;
					}

					console.log((count / userAnswers.length));

					// Display sweetalert displaying the score
					Swal.fire({
						title: success ? 'Bien joué !' : 'Bien tenté',
						html: `Vous avez obtenu ${count} sur ${userAnswers.length} réponses correctes !`,
						icon: success ? 'success' : 'error',
					}).then(() => {
						userAnswers.forEach(el => {
							el.click();
						});
					});
				}
			} else {
				el.innerText = dropZone.innerHTML.replaceAll('&nbsp;', '');
				dropZone.innerHTML = `&nbsp;${removeEl}&nbsp;`;
				dropZone.dataset.text = removeEl;

				gapUpdate(mainEl);
			}
		}
	});
}

function gapFindCorrect(obj, nb) {
	// Find the correct answer form an object list when key correct = nb
	for (let i = 0; i < obj.length; i++) {
		if (obj[i].correct === nb) {
			return obj[i];
		}
	}
}

function gapUpdate(el) {
	const code = el.querySelector('code');
	code.innerHTML = el
		.querySelector('.gap-container')
		.innerHTML.replaceAll(/(<div [^>]*>)/gm, '')
		.replaceAll(/<\/div>/g, '')
		.replaceAll('&nbsp;', '')
		.replaceAll('££££', '    ');
	Prism.highlightElement(code);
}

/* ===============================================
            Ending of Gap Fill
=============================================== */

// Add Events and OnStart functions
document.addEventListener('DOMContentLoaded', e => {
	document.querySelectorAll('.quiz').forEach((el, i) => {
		quizHandler.push({
			isFinished: false,
			questions: {},
			answers: [],
			nbQuestions: 0,
			result: 0, // Result percentage
			actualQuestion: 1, // Actual question
			nbCorrect: 0,
		});

		const questions = JSON.parse(el.dataset.quiz.replaceAll('§', '"'));
		quizInit(i, questions);
	});
	// Add quiz click event handler
	document.querySelectorAll('.submit-quiz').forEach((el, i) => {
		el.addEventListener('click', () => {
			if (quizHandler[i].isFinished === true) {
				el.innerText = 'Vérifier';
				quizInit(i, quizHandler[i].questions);
			} else {
				quizHandler[i].answers[quizHandler[i].actualQuestion - 1] = parseInt(document.querySelector('input[type=\'radio\'][name=\'answer\']:checked').value, 10);
				let modal;
				if (quizHandler[i].answers[quizHandler[i].actualQuestion - 1] === quizHandler[i].questions[quizHandler[i].actualQuestion - 1].correct) {
					modal = {
						title: 'Bonne réponse !',
						icon: 'success',
					};
				} else {
					modal = {
						title: 'Mauvaise réponse !',
						icon: 'error',
					};
				}

				Swal.fire({
					...modal,
					html: quizHandler[i].questions[quizHandler[i].actualQuestion - 1].explanation,
					confirmButtonText: 'Continuer',
				}).then(() => {
					if (quizHandler[i].actualQuestion < quizHandler[i].nbQuestions) {
						quizHandler[i].actualQuestion += 1;
						buildQuestion(i, quizHandler[i].actualQuestion);
					} else {
						document.querySelectorAll('.quiz')[i].querySelector('.progresstext .min').innerText = quizHandler[i].nbQuestions;
						document.querySelectorAll('.quiz')[i].querySelector('.progressbar .bar1').style.width = '100%';

						calculateQuizResults(quizHandler[i]);

						document.querySelectorAll('.quiz')[i].querySelector('.question').innerText = 'Résultats';
						document.querySelectorAll('.quiz')[i].querySelector('.submit-quiz').innerText = 'Rejouer';
						quizHandler[i].isFinished = true;

						document.querySelectorAll('.quiz')[i].querySelector('.answers').innerHTML = `<div id="circle-container"></div><p>Vous avez obtenu &nbsp;<span>${quizHandler[i].nbCorrect} / ${quizHandler[i].nbQuestions}</span></p>`;
					}
				});
			}
		});
	});

	// Add writing click event handler
	inputarea.forEach(el => {
		el.addEventListener(
			'input',
			event => {
				writing_update(el);
			},
			false,
		);

		el.addEventListener(
			'keydown',
			event => {
				writing_check_tab(el, event);
			},
			false,
		);

		// Refresh highlighting when blured focus from textarea.
		el.addEventListener(
			'blur',
			event => {
				Prism.highlightElement(el.parentElement.querySelector('.output'));
			},
			false,
		);

		el.addEventListener(
			'scroll',
			event => {
				sync_scroll(el, el.parentElement.querySelector('.output'));
			},
			false,
		);
	});

	document.querySelectorAll('.writing .reveal').forEach((el, i) => {
		el.addEventListener('click', writingReveal, false);
	});

	document.querySelectorAll('.gap-fill .word-drag').forEach((el, i) => {
		gapInitDragElement(el);
	});

	document.querySelectorAll('.gap-fill .word-drop').forEach((el, i) => {
		el.addEventListener('dragenter', gapDragEnter, false);
		el.addEventListener('dragleave', gapDragLeave, false);
		el.addEventListener('dragover', gapDragOver, false);
		el.addEventListener('drop', gapDrop, false);
	});

	const scrollBar = document.querySelector('#scrollbar');
	let maxScroll = null;
	const url = window.location.pathname.match(/(?<c>courses)\/(?<s>[1-9]+)\/(?<m>[1-9]+)/);

	let lastRequestTimestamp = Date.now();
	window.addEventListener('scroll', () => {
		if (url !== null) {
			if (maxScroll === null) {
				maxScroll = scrollBar.dataset.scrollbar;
			}

			const scrollTop = window.scrollY;
			const docHeight = document.body.offsetHeight;
			const winHeight = window.innerHeight;
			const scrollPercent = scrollTop / (docHeight - winHeight);
			const scrollPercentRounded = Math.round(scrollPercent * 100);
			scrollBar.style.width = scrollPercentRounded + '%';

			if (maxScroll !== 'unauthorized' && scrollPercentRounded > parseInt(maxScroll, 10) && lastRequestTimestamp + 3000 < Date.now()) {
				maxScroll = scrollPercentRounded;
				fetch(window.location.href + '/progress', {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						progress: scrollPercentRounded,
					}),
				});
				lastRequestTimestamp = Date.now();
			}
		}
	});
});
