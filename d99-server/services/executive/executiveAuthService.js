import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Executive from "../../model/Executive.js";

export const ExecutiveAuthService = {
  login: async (username, password) => {
    const executive = await Executive.findOne({
      where: { username }
    });

    if (!executive) {
      throw new Error("Invalid credentials");
    }

    if (!executive.active) {
      throw new Error("Executive account is disabled");
    }

    const isMatch = await bcrypt.compare(password, executive.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        actor: {
          type: "EXECUTIVE",
          id: executive.id
        },
        account: {
          type: executive.parent_type,
          id: executive.parent_id
        },
        role: executive.role,
        permissions: executive.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return the token plus a safe executive object so the frontend can store
    // the permission map without a separate profile call. Never leak the hash.
    return {
      token,
      executive: {
        id: executive.id,
        username: executive.username,
        email: executive.email,
        role: executive.role,
        parent_type: executive.parent_type,
        permissions: executive.permissions || {},
        active: executive.active
      }
    };
  }
};
