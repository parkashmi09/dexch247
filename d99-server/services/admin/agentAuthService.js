// import Agent from '../../model/admin/Agent.js'
// import TokenBlacklist from '../../model/admin/TokenBlacklist.js';
// import PasswordService from '../passwordService.js';
// import jwt from 'jsonwebtoken';

// const AuthService = {
//     login: async (email, password) => {
//         const user = await Agent.findOne({ where: { email } });
//         if (!user) throw new Error('User not found');

//         // Use PasswordService to securely compare passwords
//         const isMatch = await PasswordService.comparePassword(password, user.password);
//         if (!isMatch) throw new Error('Invalid credentials');

//         console.log(user, 'agent------> user id')

//         // Generate a JWT token with user_id and role
//         const token = jwt.sign(
//             { user_id: user.agent_id, role: user.role, username: user.username }, // Ensure user_id is included
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         return token;
//     },

//     logout: async (token) => {
//         // Decode the token to get its expiration time
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // Add the token to the blacklist
//         await TokenBlacklist.create({
//             token,
//             expiresAt: new Date(decoded.exp * 1000), // Convert expiration time to a Date object
//         });
//     },
// };

// export default AuthService;

import Agent from '../../model/admin/Agent.js';
import TokenBlacklist from '../../model/admin/TokenBlacklist.js';
import PasswordService from '../passwordService.js';
import jwt from 'jsonwebtoken';

const AuthService = {
    login: async (email, password) => {
        const user = await Agent.findOne({ where: { email } });
        if (!user) throw new Error('User not found');

        const isMatch = await PasswordService.comparePassword(password, user.password);
        if (!isMatch) throw new Error('Invalid credentials');

        console.log('Agent login user →', user.agent_id);

        const username = user.username || user.name || user.agent_name;

        const token = jwt.sign(
            { 
                user_id: user.agent_id, 
                role: user.role, 
                username 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        return token;
    },

    logout: async (token) => {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await TokenBlacklist.create({
            token,
            expiresAt: new Date(decoded.exp * 1000),
        });
    },
};

export default AuthService;
