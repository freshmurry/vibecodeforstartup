"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSentryRoutes = setupSentryRoutes;
var hono_1 = require("hono");
var tunnelController_1 = require("../controllers/sentry/tunnelController");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
function setupSentryRoutes(app) {
    var sentryRouter = new hono_1.Hono();
    // Sentry tunnel endpoint for frontend events (public - no auth required)
    sentryRouter.post('/tunnel', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(tunnelController_1.SentryTunnelController, tunnelController_1.SentryTunnelController.tunnel));
    // Mount the router under /api/sentry
    app.route('/api/sentry', sentryRouter);
}
