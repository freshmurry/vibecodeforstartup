import { AdminController } from '../controllers/admin/adminController';
import { AppEnv } from '../../types/appenv';
import { Hono } from 'hono';
import { AuthConfig, setAuthLevel } from '../../middleware/auth/routeAuth';
import { adaptController } from '../honoAdapter';

export function setupAdminRoutes(app: Hono<AppEnv>): void {
    // Operator usage metering + guardrail configuration (owner email only,
    // enforced inside the controller against ALLOWED_EMAIL).
    app.get('/api/admin/usage', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.getUsage));
    app.put('/api/admin/guardrails', setAuthLevel(AuthConfig.authenticated), adaptController(AdminController, AdminController.updateGuardrail));
}
