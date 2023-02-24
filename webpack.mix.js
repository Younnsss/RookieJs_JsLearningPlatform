const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/js/main.js', 'public/js')
	.postCss('resources/css/style.css', 'public/css', [
		require('tailwindcss'),
		require('autoprefixer'),
	]);

mix.js('card_game/js/script-jeu.js', 'public/js')
	.js('card_game/js/docs.js', 'public/js')
	.postCss('card_game/css/style-jeu.css', 'public/css', [
		require('autoprefixer'),
	]).options({
		processCssUrls: false,
	})
	.postCss('card_game/css/croupier.css', 'public/css', [
		require('autoprefixer'),
	]);

mix.copy('card_game/assets', 'public/assets');

mix.disableNotifications();

