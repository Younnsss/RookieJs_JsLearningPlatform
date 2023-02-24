'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Progresses', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			UserId: {
				type: Sequelize.INTEGER,
				references: {
					model: 'Users',
					key: 'id',
				},
			},
			section: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
			module: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
			progress: {
				allowNull: false,
				type: Sequelize.INTEGER,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Progresses');
	},
};
