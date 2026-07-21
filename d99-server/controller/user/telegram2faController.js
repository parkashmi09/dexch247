
import { nanoid } from 'nanoid';
import User from '../../model/user/User.js';
import Staff from '../../model/admin/Staff.js';
import Owner from '../../model/admin/Owner.js';
import TelegramBotService from '../../services/user/TelegramBotService.js';
import PasswordService from '../../services/passwordService.js';

const pendingCodes = {}; // { code: { userId, role, expires } }

// Helper to get Model and ID based on req.user
const getUserModelAndId = async (req) => {
    if (req.user.user_id ?? req?.user?.account?.id) return { Model: User, id: req.user.user_id ?? req?.user?.account?.id, role: 'USER', idField: 'id' };
    // if (req.user.staff_id) return { Model: Staff, id: req.user.staff_id, role: 'STAFF', idField: 'staff_id' };
    // if (req.user.owner_id) return { Model: Owner, id: req.user.owner_id, role: 'OWNER', idField: 'owner_id' };
    return null;
};

const Telegram2FAController = {
    // 🔗 Generate Link Code
    // 🔐 Verify Password (Step 1)
    verifyPassword: async (req, res) => {
        try {
            const { password } = req.body;
            if (!password) return res.status(400).json({ success: false, error: 'Password is required' });

            const meta = await getUserModelAndId(req);
            if (!meta) return res.status(401).json({ success: false, error: 'Unauthorized type' });

            const user = await meta.Model.findByPk(meta.id);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const isMatch = await PasswordService.comparePassword(password, user.password);
            if (!isMatch) return res.status(400).json({ success: false, error: 'Invalid password' });

            res.json({ success: true });
        } catch (error) {
            console.error('Verify Password Error:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    },

    // 🔗 Generate Link Code (Step 2)
    generateLinkCode: async (req, res) => {
        try {
            const meta = await getUserModelAndId(req);
            if (!meta) return res.status(401).json({ success: false, error: 'Unauthorized' });

            // Clean expired codes
            const now = Date.now();
            for (const c in pendingCodes) {
                if (pendingCodes[c].expires < now) delete pendingCodes[c];
            }

            const code = nanoid(8).toUpperCase();
            pendingCodes[code] = {
                userId: meta.id,
                role: meta.role,
                expires: now + 10 * 60 * 1000
            };

            res.status(200).json({ success: true, code });
        } catch (error) {
            console.error('❌ Generate Link Code Error:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    },

    // 🤖 Webhook for Bot to Verify Link
    verifyLinkWebhook: async (req, res) => {
        try {
            const { code, telegramId, username } = req.body;
            console.log(code, telegramId, 'VERIFY LIINK WEBHOOK ++++++++++++++++++')
            if (!code || !telegramId) {
                return res.status(400).json({ success: false, error: 'Missing data' });
            }

            const record = pendingCodes[code.toUpperCase()];

            console.log( '🔥record from webhook link', record)

            if (!record) {
                return res.status(400).json({ success: false, error: 'Invalid or expired code 1' });
            }

            console.log(`✅ Valid code found for ${record.role} ID ${record.userId}`);

            const Model = record.role === 'USER' ? User : (record.role === 'STAFF' ? Staff : Owner);
            const idField = record.role === 'USER' ? 'user_id' : (record.role === 'STAFF' ? 'staff_id' : 'owner_id');

            // Update User/Staff/Owner
            await Model.update({
                telegramChatId: telegramId.toString(),
                telegram2FAEnabled: true
            }, { where: { [idField]: record.userId } });

            // Notify User via Bot
            await TelegramBotService.sendMessage(telegramId, `✅ <b>Successfully Linked!</b>\nYour account is now receiving 2FA codes on this chat.`);

            // Cleanup
            delete pendingCodes[code.toUpperCase()];

            res.status(200).json({ success: true, message: 'Linked successfully' });
        } catch (error) {
            console.error('❌ Verify Link Webhook Error:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    },

    //  Send Disable Code
    sendDisableCode: async (req, res) => {
        try {
            const meta = await getUserModelAndId(req);
            if (!meta) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const user = await meta.Model.findByPk(meta.id);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            if (!user.telegramChatId || !user.telegram2FAEnabled) return res.status(400).json({ success: false, error: '2FA not enabled' });

            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Prefix key with type to avoid collision if IDs overlap (though unlikely across diff tables vs diff cache keys)
            // But verify2FA usually checks by ID.
            // For disable, we use the same cache key convention or just ID if we separate handling.
            // Let's use a consistent key: `${role}_${id}`?
            // Existing USER logic uses just ID. We should stick to that for USER to avoid breaking changes,
            // or update USER logic too.
            // BUT: modify existing code minimally.
            // If I change cache key logic for USER, I break login verify.

            // Let's use specific keys for admin types, and keep simple ID for USER if that's what was used.
            // Wait, I updated StaffAuthService to use `staff_${id}`.

            let cacheKey = user[meta.idField];
            if (meta.role === 'STAFF') cacheKey = `staff_${cacheKey}`;
            if (meta.role === 'OWNER') cacheKey = `owner_${cacheKey}`;

            global.otpCache = global.otpCache || {};
            global.otpCache[cacheKey] = { otp, expires: Date.now() + 5 * 60 * 1000 };

            await TelegramBotService.sendMessage(user.telegramChatId, `🔐 *Disable 2FA Request*\nYour OTP is: <b>${otp}</b>\nValid for 5 minutes.`);

            res.json({ success: true, message: 'OTP sent to Telegram' });
        } catch (error) {
            console.error('Send Disable Code Error:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    },

    // 🛑 Disable 2FA
    disable2FA: async (req, res) => {
        try {
            const { otp } = req.body;
            if (!otp) return res.status(400).json({ success: false, error: 'OTP is required' });

            const meta = await getUserModelAndId(req);
            if (!meta) return res.status(401).json({ success: false, error: 'Unauthorized' });

            let cacheKey = meta.id;
            if (meta.role === 'STAFF') cacheKey = `staff_${cacheKey}`;
            if (meta.role === 'OWNER') cacheKey = `owner_${cacheKey}`;

            const record = global.otpCache && global.otpCache[cacheKey];

            if (!record) return res.status(400).json({ success: false, error: 'OTP expired or not requested' });
            if (record.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });

            await meta.Model.update({ telegram2FAEnabled: false, telegramChatId: null }, { where: { [meta.idField]: meta.id } });

            delete global.otpCache[cacheKey]; // Cleanup

            res.json({ success: true, message: '2FA Disabled successfully' });
        } catch (error) {
            console.error('Disable 2FA Error:', error);
            res.status(500).json({ success: false, error: 'Server error' });
        }
    }
};

export default Telegram2FAController;
