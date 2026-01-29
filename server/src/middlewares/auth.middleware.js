import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  // First try to get user from session
  if (req.session && req.session.userId) {
    req.user = { 
      id: req.session.userId, 
      role: req.session.role, 
      email: req.session.email 
    };
    return next();
  }

  // If no session, try JWT token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = {
        id: decoded.userId || decoded.id, // Support both userId and id from JWT
        role: decoded.role,
        email: decoded.email
      };
      return next();
    } catch (err) {
      console.error('[AUTH] JWT verification failed:', err.message);
      return res.status(401).json({ message: "Unauthorized" });
    }
  }

  return res.status(401).json({ message: "Unauthorized" });
}
