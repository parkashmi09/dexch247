import Bonus from '../../model/Bonus.js';

const bonusController = {
    getBonuses: async (req, res) => {
        try {
            const bonuses = await Bonus.find();
            res.status(200).json(bonuses);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default bonusController;