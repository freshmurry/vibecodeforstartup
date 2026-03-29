"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthRoutes = setupAuthRoutes;
/**
 * Authentication Routes
 */
var controller_1 = require("../controllers/auth/controller");
var hono_1 = require("hono");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup authentication routes
 */
function setupAuthRoutes(app) {
    // Create a sub-router for auth routes
    var authRouter = new hono_1.Hono();
    // Public authentication routes
    authRouter.get('/csrf-token', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.getCsrfToken));
    authRouter.get('/providers', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.getAuthProviders));
    authRouter.post('/register', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.register));
    authRouter.post('/login', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.login));
    authRouter.post('/verify-email', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.verifyEmail));
    authRouter.post('/resend-verification', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.resendVerificationOtp));
    authRouter.get('/check', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.checkAuth));
    // Protected routes (require authentication) - must come before dynamic OAuth routes
    authRouter.get('/profile', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.getProfile));
    authRouter.put('/profile', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.updateProfile));
    authRouter.post('/logout', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.logout));
    // Session management routes
    authRouter.get('/sessions', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.getActiveSessions));
    authRouter.delete('/sessions/:sessionId', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.revokeSession));
    // // API Keys management routes
    // authRouter.get('/api-keys', createHandler('getApiKeys'), AuthConfig.authenticated);
    // authRouter.post('/api-keys', createHandler('createApiKey'), AuthConfig.authenticated);
    // authRouter.delete('/api-keys/:keyId', createHandler('revokeApiKey'), AuthConfig.authenticated);
    // OAuth routes (under /oauth path to avoid conflicts)
    authRouter.get('/oauth/:provider', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.initiateOAuth));
    authRouter.get('/callback/:provider', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AuthController, controller_1.AuthController.handleOAuthCallback));
    // Mount the auth router under /api/auth
    app.route('/api/auth', authRouter);
}
