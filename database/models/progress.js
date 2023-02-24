'use strict';
const {
	Model,
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Progress extends Model {
		/**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
		static associate(models) {
			Progress.belongsTo(models.User);
		}
	}
	Progress.init({
		UserId: DataTypes.INTEGER,
		section: DataTypes.INTEGER,
		module: DataTypes.INTEGER,
		progress: DataTypes.INTEGER,
	}, {
		sequelize,
		modelName: 'Progress',
	});
	return Progress;
};
