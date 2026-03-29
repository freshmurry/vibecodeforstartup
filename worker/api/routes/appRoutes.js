"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAppRoutes = setupAppRoutes;
var controller_1 = require("../controllers/apps/controller");
var controller_2 = require("../controllers/appView/controller");
var hono_1 = require("hono");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup app management routes
 */
function setupAppRoutes(app) {
    // Create a sub-router for app routes
    var appRouter = new hono_1.Hono();
    // ========================================
    // PUBLIC ROUTES (Unauthenticated users can access)
    // ========================================
    // FIXED: Main apps listing - PUBLIC for /apps frontend route
    // This powers the main /apps page that shows all public apps
    appRouter.get('/public', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.getPublicApps));
    // ========================================
    // AUTHENTICATED USER ROUTES (Personal dashboard routes)
    // ========================================
    // Get user's personal apps - requires authentication (for dashboard/profile)
    appRouter.get('/', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.getUserApps));
    // Get recent apps - requires authentication (for dashboard)
    appRouter.get('/recent', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.getRecentApps));
    // Get favorite apps - requires authentication (for dashboard)
    appRouter.get('/favorites', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.getFavoriteApps));
    // ========================================
    // AUTHENTICATED INTERACTION ROUTES
    // ========================================
    // Star/bookmark ANY app - requires authentication (can star others' public apps)
    appRouter.post('/:id/star', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_2.AppViewController, controller_2.AppViewController.toggleAppStar));
    // // Fork ANY public app - requires authentication (can fork others' public apps)
    // DISABLED: Has been disabled for initial alpha release, for security reasons
    // appRouter.post('/:id/fork', setAuthLevel(AuthConfig.authenticated), adaptController(AppViewController, AppViewController.forkApp));
    // Toggle favorite status - requires authentication  
    appRouter.post('/:id/favorite', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.toggleFavorite));
    // ========================================
    // PUBLIC APP DETAILS (placed after specific routes to avoid conflicts)
    // ========================================
    // App details view - PUBLIC for /app/:id frontend route  
    // Allows unauthenticated users to view and preview apps
    appRouter.get('/:id', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_2.AppViewController, controller_2.AppViewController.getAppDetails));
    // ========================================
    // OWNER-ONLY ROUTES (App modification)
    // ========================================
    // Update app visibility - OWNER ONLY
    appRouter.put('/:id/visibility', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.ownerOnly), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.updateAppVisibility));
    // Delete app - OWNER ONLY
    appRouter.delete('/:id', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.ownerOnly), (0, honoAdapter_1.adaptController)(controller_1.AppController, controller_1.AppController.deleteApp));
    // Mount the app router under /api/apps
    app.route('/api/apps', appRouter);
}
