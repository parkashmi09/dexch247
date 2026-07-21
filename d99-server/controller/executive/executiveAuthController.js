import { ExecutiveAuthService } from "../../services/executive/executiveAuthService.js";

export const ExecutiveAuthController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username and password are required"
        });
      }

      const { token, executive } = await ExecutiveAuthService.login(username, password);

      return res.json({
        success: true,
        token,
        executive
      });

    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.message
      });
    }
  }
};
