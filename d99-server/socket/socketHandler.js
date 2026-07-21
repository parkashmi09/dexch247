import { verifyToken } from '../utils/jwt.js';
import WalletService from '../services/walletService.js';
import { calculateUserNetExposure } from '../helper/netExposureHelper.js';

// Resolve the authoritative user id from a JWT. Mirrors authMiddleware:
// new tokens carry `account.id`, old tokens carry `user_id`. This must match
// the id used by emitBalanceUpdate (req.user.account.id) so the socket joins
// the same `user_<id>` room the server emits to.
const resolveUserIdFromToken = (token) => {
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.account?.id ?? decoded?.user_id ?? null;
};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    // Handle user authentication and join user-specific room.
    // Prefer the token's verified identity (authoritative); fall back to the
    // client-claimed userId for backward compatibility.
    socket.on('authenticate', (data = {}) => {
      let joined = false;
      try {
        const token = socket.handshake.auth?.token || data.token;
        const uid = resolveUserIdFromToken(token);
        if (uid != null) {
          socket.join(`user_${uid}`);
          socket.userId = uid;
          joined = true;
        }
      } catch (err) {
        // Invalid/expired token — fall through to the claimed id below.
      }
      if (!joined && data.userId != null) {
        socket.join(`user_${data.userId}`);
        socket.userId = data.userId;
      }
    });

    // Handle real-time balance request
    socket.on('getBalance', async (data) => {
      try {
        // Get token from socket auth or event data
        const token = socket.handshake.auth.token || data?.token;
        if (!token) {
          socket.emit('balanceUpdate', { error: 'No token provided' });
          return;
        }
        const decoded = verifyToken(token);
        const userId = decoded?.account?.id ?? decoded.user_id;
        const userType = decoded?.account?.type || 'USER';
        const balance = await WalletService.getUserWallet(userId, userType);
        // Net exposure computed the same way the header reads it (clamped,
        // worst-case liability) so the pushed value matches a page refresh.
        const total_exposure = await calculateUserNetExposure(userId);
        const balanceData = {
          userId,
          balance: {
            inr_balance: balance.inr_balance,
            exposure: total_exposure !== null ? total_exposure : null   // total liability across all games combined
          },
          timestamp: new Date().toISOString()
        };
        socket.emit('balanceUpdate', balanceData);
      } catch (err) {
        console.error('Error in getBalance socket event:', err);
        socket.emit('balanceUpdate', { error: 'Failed to fetch balance', details: err.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // User disconnected
    });
  });

  // Add error handling for socket.io
  io.engine.on('connection_error', (err) => {
    console.error('Socket.IO connection error:', err);
  });
}; 


// can use profile in socket which contains all necaesary user data


// import { verifyToken } from '../utils/jwt.js';
// import WalletService from '../services/walletService.js';
// import { getUserTotalExposure } from '../services/ExposureService.js';
// import UserController from '../controller/admin/userController.js'; 

// export const setupSocketHandlers = (io) => {
//   // Middleware to authenticate every socket connection
//   io.use(async (socket, next) => {
//     try {
//       const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

//       if (!token) {
//         return next(new Error('Authentication error: No token provided'));
//       }

//       const decoded = verifyToken(token);
//       if (!decoded || !decoded.user_id) {
//         return next(new Error('Authentication error: Invalid token'));
//       }

//       // Attach user to socket
//       socket.user = decoded; // { user_id, role, etc. }
//       next();
//     } catch (err) {
//       console.error('Socket authentication error:', err.message);
//       next(new Error('Authentication error'));
//     }
//   });

//   io.on('connection', async (socket) => {
//     const userId = socket.user.user_id;
//     const userRole = socket.user.role || 'User';

//     // Join user to their private room
//     socket.join(`user_${userId}`);
//     socket.userId = userId; // for backward compatibility if needed

//     console.log(`User ${userId} connected via socket`);

//     try {
//       // Fetch full user profile using your existing UserController
//       const userProfile = await UserController.getUserById(userId); 
//       // Or if your method is different, e.g.:
//       // const userProfile = await UserController.getUserProfile(userId);

//       if (!userProfile) {
//         socket.emit('error', { message: 'User profile not found' });
//       } else {
//         // Send complete user profile immediately on connect
//         socket.emit('userProfile', {
//           success: true,
//           user: userProfile, // This contains name, email, phone, kyc status, etc.
//           timestamp: new Date().toISOString()
//         });
//       }
//     } catch (err) {
//       console.error('Error fetching user profile on socket connect:', err);
//       socket.emit('error', { message: 'Failed to load user profile' });
//     }

//     // ================================
//     // Keep your existing getBalance handler (secure & working)
//     // ================================
//     socket.on('getBalance', async () => {
//       try {
//         const balance = await WalletService.getBalance(userId, userRole);
//         const total_exposure = await getUserTotalExposure(userId);

//         const balanceData = {
//           userId,
//           balance: {
//             inr_balance: balance.inr_balance,
//             exposure: total_exposure ?? null
//           },
//           timestamp: new Date().toISOString()
//         };

//         socket.emit('balanceUpdate', balanceData);
//       } catch (err) {
//         console.error('Error in getBalance socket event:', err);
//         socket.emit('balanceUpdate', { 
//           error: 'Failed to fetch balance', 
//           details: err.message 
//         });
//       }
//     });

//     // Optional: Re-emit profile on demand
//     socket.on('refreshProfile', async () => {
//       try {
//         const userProfile = await UserController.getUserById(userId);
//         socket.emit('userProfile', {
//           success: true,
//           user: userProfile,
//           timestamp: new Date().toISOString()
//         });
//       } catch (err) {
//         socket.emit('userProfile', { success: false, error: err.message });
//       }
//     });

//     // Handle disconnect
//     socket.on('disconnect', (reason) => {
//       console.log(`User ${userId} disconnected: ${reason}`);
//     });
//   });

//   // Global connection error handling
//   io.engine.on('connection_error', (err) => {
//     console.error('Socket.IO connection error:', err.req, err.code, err.message, err.context);
//   });
// };