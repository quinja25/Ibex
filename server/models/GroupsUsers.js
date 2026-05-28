module.exports = (sequelize, DataTypes) => {
    const GroupsUsers = sequelize.define("Groups_Users", {}, { timestamps: false });

    GroupsUsers.associate = (models) => {
        // Define associations here
        models.Users.belongsToMany(models.Groups, { through: GroupsUsers });
        models.Groups.belongsToMany(models.Users, { through: GroupsUsers });
    };

    return GroupsUsers;
};