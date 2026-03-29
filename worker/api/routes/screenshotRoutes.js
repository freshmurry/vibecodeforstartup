"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupScreenshotRoutes = setupScreenshotRoutes;
var hono_1 = require("hono");
var controller_1 = require("../controllers/screenshots/controller");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
function setupScreenshotRoutes(app) {
    var router = new hono_1.Hono();
    // Publicly serve screenshots (they are non-sensitive previews of generated apps)
    router.get('/:id/:file', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ScreenshotsController, controller_1.ScreenshotsController.serveScreenshot));
    app.route('/api/screenshots', router);
}
