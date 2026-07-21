// import User from '../../model/user/User.js';
// import Wallet from '../../model/admin/Wallet.js';

// const getUserProfileWithWallet = async (req, res) => {
//   if(!req?.user) return res.status(404).json({ error: 'login again ' });
//   try {
//     const userId = req?.user?.id; //  authMiddleware sets req.user
//     const user = await User.findOne({ where: { user_id: userId } });
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const wallet = await Wallet.findOne({ where: { user_id: userId, user_type: 'User' } });
//     res.json({ user, wallet });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export default { getUserProfileWithWallet }; 