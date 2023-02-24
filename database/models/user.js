'use strict';
const {
	Model,
} = require('sequelize');

const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			User.hasMany(models.AuthToken);
			User.hasMany(models.Progress);
		}
	}
	User.init({
		userName: DataTypes.STRING,
		email: DataTypes.STRING,
		password: DataTypes.STRING,
	}, {
		sequelize,
		modelName: 'User',
	});

	// This is a class method, it is not called on an individual
	// user object, but rather the class as a whole.
	// e.g. User.authenticate('user1', 'password1234')
	User.authenticate = async function (username, password) {
		const user = await User.findOne({where: {username}});

		// Bcrypt is a one-way hashing algorithm that allows us to
		// store strings on the database rather than the raw
		// passwords. Check out the docs for more detail
		if (bcrypt.compareSync(password, user.password)) {
			return user.authorize();
		}

		throw new Error('invalid password');
	};

	User.updateProgress = async function (UserId, section, module, progress) {
		const {Progress} = sequelize.models;

		return Progress.findOne({where: {UserId, section, module}}).then(
			obj => {
				if (obj) {
					return obj.update({progress});
				}

				return Progress.create({UserId, section, module, progress});
			},
		);
	};

	User.getProgress = async function (UserId, section, module) {
		const {Progress} = sequelize.models;

		return Progress.findOne({where: {UserId, section, module}}).then(
			obj => {
				if (obj) {
					return obj.progress;
				}

				return 0;
			},
		);
	};

	User.getAllProgress = async function (UserId) {
		const {Progress} = sequelize.models;

		return Progress.findAll({where: {UserId}}).then(
			objs => {
				if (objs) {
					return objs.map(obj => ({module: obj.module, section: obj.section, progress: obj.progress}));
				}

				return [];
			},
		);
	};

	// In order to define an instance method, we have to access
	// the User model prototype. This can be found in the
	// sequelize documentation
	User.prototype.authorize = async function () {
		const {AuthToken} = sequelize.models;
		const user = this;

		// Create a new auth token associated to 'this' user
		// by calling the AuthToken class method we created earlier
		// and passing it the user id
		const authToken = await AuthToken.generate(this.id);

		// AddAuthToken is a generated method provided by
		// sequelize which is made for any 'hasMany' relationships
		await user.addAuthToken(authToken);

		return {user, authToken};
	};

	User.prototype.logout = async function (token) {
		// Destroy the auth token record that matches the passed token
		sequelize.models.AuthToken.destroy({where: {token}});
	};

	return User;
};
