module.exports = (sequelize, DataTypes) => {
    const WaitlistEntries = sequelize.define('WaitlistEntries', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('student', 'alumni', 'other'),
            defaultValue: 'student',
        },
        referralCode: {
            type: DataTypes.STRING(10),
            allowNull: true,
            unique: true,
        },
        referredBy: {
            type: DataTypes.STRING(10),
            allowNull: true,
        },
        waitlistCredits: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        subjects: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });

    return WaitlistEntries;
};
