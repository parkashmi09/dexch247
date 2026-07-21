import StakeButtonValue from '../../model/user/StakeButtonValue.js';

const defaultGameButtons = [
    { label: '1k', value: 1000 },
    { label: '2k', value: 2000 },
    { label: '5k', value: 5000 },
    { label: '10k', value: 10000 },
    { label: '20k', value: 20000 },
    { label: '25k', value: 25000 },
    { label: '50k', value: 50000 },
    { label: '75k', value: 75000 },
];

const defaultCasinoButtons = [
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '500', value: 500 },
    { label: '1000', value: 1000 },
    { label: '', value: 0 },
    { label: '', value: 0 },
];

const StakeButtonValueController = {
    getStakeButtonValues: async (req, res) => {
        try {
            const userId = req.user.account.id;
            let buttonValues = await StakeButtonValue.findOne({ where: { user_id: userId } });

            if (!buttonValues) {
                // Return defaults if not found, but don't create yet to save DB space until they customize
                return res.status(200).json({
                    success: true,
                    data: {
                        game_buttons: defaultGameButtons,
                        casino_buttons: defaultCasinoButtons,
                    },
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    game_buttons: buttonValues.game_buttons || defaultGameButtons,
                    casino_buttons: buttonValues.casino_buttons || defaultCasinoButtons,
                },
            });
        } catch (error) {
            console.error('Error fetching stake button values:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch button values' });
        }
    },

    updateStakeButtonValues: async (req, res) => {
        try {
            const userId = req.user.account.id;
            const { game_buttons, casino_buttons } = req.body;

            if (!game_buttons && !casino_buttons) {
                return res.status(400).json({ success: false, error: 'No data provided to update' });
            }

            let buttonValues = await StakeButtonValue.findOne({ where: { user_id: userId } });

            if (buttonValues) {
                if (game_buttons) buttonValues.game_buttons = game_buttons;
                if (casino_buttons) buttonValues.casino_buttons = casino_buttons;
                await buttonValues.save();
            } else {
                buttonValues = await StakeButtonValue.create({
                    user_id: userId,
                    game_buttons: game_buttons || defaultGameButtons,
                    casino_buttons: casino_buttons || defaultCasinoButtons,
                });
            }

            res.status(200).json({
                success: true,
                message: 'Button values updated successfully',
                data: {
                    game_buttons: buttonValues.game_buttons,
                    casino_buttons: buttonValues.casino_buttons,
                },
            });
        } catch (error) {
            console.error('Error updating stake button values:', error);
            res.status(500).json({ success: false, error: 'Failed to update button values' });
        }
    },
};

export default StakeButtonValueController;
