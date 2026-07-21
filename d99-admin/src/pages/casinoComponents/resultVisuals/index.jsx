import React from 'react';
import DoliDanaVisual from './Visuals/DoliDana';
import Teen62Visual from './Visuals/Teen62';
import DragonTiger6Visual from './Visuals/DragonTiger6';
import MogamboVisual from './Visuals/Mogambo';
import SuperOverVisual from './Visuals/SuperOver';
import SicboVisual from './Visuals/Sicbo';
import PokerVisual from './Visuals/Poker';
import PoisonVisual from './Visuals/Poison';
import JokerVisual from './Visuals/Joker';

const ResultVisuals = ({ gameType, data, poisonCard, playerA, playerB }) => {
    // Normalize game type
    const normalizedType = gameType?.toLowerCase();

    switch (normalizedType) {
        case 'dolidana':
            return <DoliDanaVisual data={data} />;
        case 'teen62':
        case 'teenpatti62':
        case 'teen20c':
        case 'teen41':
        case 'teen42':
        case 'teen33':
        case 'teen3':
        case 'teen32':
        case 'teen':
        case 'pteen':
        case 'teen20':
        case 'teen20b':
        case 'teen9':
        case 'teen8':
        case 'teen6':
            return <Teen62Visual data={data} />;
        case 'dt6':
            return <DragonTiger6Visual data={data} />;
        case 'poker':
        case 'poker20':
        case 'poker6':
            return <PokerVisual data={data} />;
        case 'mogambo':
            return <MogamboVisual data={data} />;
        case 'superover':
        case 'superover2':
        case 'superover3':
            return <SuperOverVisual data={data} />;
        case 'sicbo':
        case 'sicbo2':
            return <SicboVisual data={data} />;
        case 'poison':
        case 'poison20':
            return <PoisonVisual data={data} poisonCard={poisonCard} playerA={playerA} playerB={playerB} />;
        case 'joker20':
            return <JokerVisual data={data} poisonCard={poisonCard} playerA={playerA} playerB={playerB} />;
        default:
             // Fallback or empty if game not supported
            return null;
    }
};

export default ResultVisuals;
