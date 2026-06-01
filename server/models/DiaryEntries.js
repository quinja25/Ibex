module.exports = (sequelize, DataTypes) => {
    const DiaryEntries = sequelize.define("DiaryEntries", {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        topic: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ease: {
            type: DataTypes.FLOAT,
            defaultValue: 2.5,
        },
        interval: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
        },
        due: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        reps: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        indexes: [
            { fields: ['userId'] },
            { fields: ['due'] },
        ],
    });

    DiaryEntries.associate = (models) => {
        DiaryEntries.belongsTo(models.Users, {
            foreignKey: 'userId',
            onDelete: 'CASCADE',
        });
    };

    return DiaryEntries;
};
