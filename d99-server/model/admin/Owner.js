    import { DataTypes } from 'sequelize';
    import sequelize from '../../config/db.js';


    const Owner = sequelize.define('Owner', {
        owner_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        website_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        domain_name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        website_ui: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        logo: {
            type: DataTypes.STRING, // Store the file path or URL
            allowNull: false,
        },
        favicon: {
            type: DataTypes.STRING, // Store the file path or URL
            allowNull: false,
        },
        game_providers: {
            type: DataTypes.JSON, // Store as JSON for multiple providers
            allowNull: false,
        },
        subscription_plan: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        platform_configurations: {
            type: DataTypes.JSON, // Store as JSON for multiple configurations
            allowNull: false,
        },
        payment_methods: {
            type: DataTypes.JSON, // Store as JSON for multiple payment methods
            allowNull: false,
        },
        site_email_address: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure email is unique
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        platform_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('OWNER'),
            allowNull: false,
        },
        account_status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        unlimited_balance: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            comment: 'If true, owner has unlimited balance and no deductions occur. If false, balance is deducted.',
        },
        first_login: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        transaction_password: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Stored as plain text',
        },
        telegramChatId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        telegram2FAEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        login_id: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Unique ID for the current active login session (single-session enforcement)',
        },
    },

    );

    export default Owner;