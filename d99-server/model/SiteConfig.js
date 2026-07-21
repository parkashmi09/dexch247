// models/SiteConfig.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // adjust path if needed

const SiteConfig = sequelize.define(
  'SiteConfig',
  {
    registerbonus: { type: DataTypes.NUMERIC, allowNull: false },
    createdat: { type: DataTypes.DATE, allowNull: false },
    updatedat: { type: DataTypes.DATE, allowNull: false },

    sports: { type: DataTypes.BOOLEAN, defaultValue: true },

    affiliatebonus: { type: DataTypes.NUMERIC(20), allowNull: false },
    comissionpercent: { type: DataTypes.NUMERIC(5), allowNull: false },

    inr: { type: DataTypes.BOOLEAN, defaultValue: true },
    mvr: { type: DataTypes.BOOLEAN, defaultValue: true },
    aed: { type: DataTypes.BOOLEAN, defaultValue: true },
    pkr: { type: DataTypes.BOOLEAN, defaultValue: true },
    cryptocoin: { type: DataTypes.BOOLEAN, defaultValue: true },
    bjb: { type: DataTypes.BOOLEAN, defaultValue: true },

    casino: { type: DataTypes.BOOLEAN, defaultValue: true },
    lotto: { type: DataTypes.BOOLEAN, defaultValue: true },
    vipclub: { type: DataTypes.BOOLEAN, defaultValue: true },
    clubmembership: { type: DataTypes.BOOLEAN, defaultValue: true },
    bonus: { type: DataTypes.BOOLEAN, defaultValue: true },
    affiliate: { type: DataTypes.BOOLEAN, defaultValue: true },
    crash: { type: DataTypes.BOOLEAN, defaultValue: true },
    originals: { type: DataTypes.BOOLEAN, defaultValue: true },
    livegames: { type: DataTypes.BOOLEAN, defaultValue: true },
    slotsgames: { type: DataTypes.BOOLEAN, defaultValue: true },
    alllivegames: { type: DataTypes.BOOLEAN, defaultValue: true },
    allslotsgames: { type: DataTypes.BOOLEAN, defaultValue: true },
    lotterygames: { type: DataTypes.BOOLEAN, defaultValue: true },
    indiangames: { type: DataTypes.BOOLEAN, defaultValue: true },
    cards: { type: DataTypes.BOOLEAN, defaultValue: true },
    jilli: { type: DataTypes.BOOLEAN, defaultValue: true },
    bdt: { type: DataTypes.BOOLEAN, defaultValue: true },
    clubrake: { type: DataTypes.NUMERIC, allowNull: true },

    instantgames: { type: DataTypes.BOOLEAN, defaultValue: true },
    btc: { type: DataTypes.BOOLEAN, defaultValue: true },
    eth: { type: DataTypes.BOOLEAN, defaultValue: true },
    ltc: { type: DataTypes.BOOLEAN, defaultValue: true },
    bch: { type: DataTypes.BOOLEAN, defaultValue: true },
    usdt: { type: DataTypes.BOOLEAN, defaultValue: true },
    trx: { type: DataTypes.BOOLEAN, defaultValue: true },
    doge: { type: DataTypes.BOOLEAN, defaultValue: true },
    ada: { type: DataTypes.BOOLEAN, defaultValue: true },
    xrp: { type: DataTypes.BOOLEAN, defaultValue: true },
    bnb: { type: DataTypes.BOOLEAN, defaultValue: true },
    usdp: { type: DataTypes.BOOLEAN, defaultValue: true },
    nexo: { type: DataTypes.BOOLEAN, defaultValue: true },
    mkr: { type: DataTypes.BOOLEAN, defaultValue: true },
    tusd: { type: DataTypes.BOOLEAN, defaultValue: true },
    usdc: { type: DataTypes.BOOLEAN, defaultValue: true },
    busd: { type: DataTypes.BOOLEAN, defaultValue: true },
    nc: { type: DataTypes.BOOLEAN, defaultValue: true },
    npr: { type: DataTypes.BOOLEAN, defaultValue: true },
    shib: { type: DataTypes.BOOLEAN, defaultValue: true },
    matic: { type: DataTypes.BOOLEAN, defaultValue: true },
    sc: { type: DataTypes.BOOLEAN, defaultValue: true },
    spribe: { type: DataTypes.BOOLEAN, defaultValue: true },
    evolution: { type: DataTypes.BOOLEAN, defaultValue: true },
    pragmaticslots: { type: DataTypes.BOOLEAN, defaultValue: true },
    pragmaticlive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ideal: { type: DataTypes.BOOLEAN, defaultValue: true },
    microgaming: { type: DataTypes.BOOLEAN, defaultValue: true },
    pgsoft: { type: DataTypes.BOOLEAN, defaultValue: true },
    hacksawgaming: { type: DataTypes.BOOLEAN, defaultValue: true },
    jili: { type: DataTypes.BOOLEAN, defaultValue: true },
    netent: { type: DataTypes.BOOLEAN, defaultValue: true },
    esports: { type: DataTypes.BOOLEAN, defaultValue: true },
    provablyfair: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    tableName: 'siteconfig',
    timestamps: false,
  }
);

export default SiteConfig;
