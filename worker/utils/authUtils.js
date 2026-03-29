"use strict";
/**
 * Centralized Authentication Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenExtractionMethod = void 0;
exports.extractSessionId = extractSessionId;
exports.extractToken = extractToken;
exports.extractTokenWithMetadata = extractTokenWithMetadata;
exports.parseCookies = parseCookies;
exports.clearAuthCookie = clearAuthCookie;
exports.clearAuthCookies = clearAuthCookies;
exports.createSecureCookie = createSecureCookie;
exports.setSecureAuthCookies = setSecureAuthCookies;
exports.extractRequestMetadata = extractRequestMetadata;
exports.mapUserResponse = mapUserResponse;
exports.formatAuthResponse = formatAuthResponse;
/**
 * Extract sessionId from cookie
*/
function extractSessionId(request) {
    var cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return null;
    }
    var cookies = parseCookies(cookieHeader);
    return cookies['sessionId'];
}
/**
 * Token extraction priorities and methods
 */
var TokenExtractionMethod;
(function (TokenExtractionMethod) {
    TokenExtractionMethod["AUTHORIZATION_HEADER"] = "authorization_header";
    TokenExtractionMethod["COOKIE"] = "cookie";
    TokenExtractionMethod["QUERY_PARAMETER"] = "query_parameter";
})(TokenExtractionMethod || (exports.TokenExtractionMethod = TokenExtractionMethod = {}));
/**
 * Extract JWT token from request with multiple fallback methods
 * Prioritizes Authorization header, then cookies, then query parameters
 */
function extractToken(request) {
    var result = extractTokenWithMetadata(request);
    return result.token;
}
/**
 * Extract JWT token from request with extraction method metadata
 * Useful for security logging and analysis
 */
function extractTokenWithMetadata(request) {
    // Priority 1: Authorization header (most secure)
    var authHeader = request.headers.get('Authorization');
    if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer ')) {
        var token = authHeader.substring(7);
        if (token && token.length > 0) {
            return {
                token: token,
                method: TokenExtractionMethod.AUTHORIZATION_HEADER,
            };
        }
    }
    // Priority 2: Cookies (secure for browser requests)
    var cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
        var cookies = parseCookies(cookieHeader);
        // Check common cookie names in order of preference
        var cookieNames = ['accessToken', 'auth_token', 'jwt'];
        for (var _i = 0, cookieNames_1 = cookieNames; _i < cookieNames_1.length; _i++) {
            var cookieName = cookieNames_1[_i];
            if (cookies[cookieName]) {
                return {
                    token: cookies[cookieName],
                    method: TokenExtractionMethod.COOKIE,
                    cookieName: cookieName,
                };
            }
        }
    }
    // Priority 3: Query parameter (for WebSocket connections and special cases)
    var url = new URL(request.url);
    var queryToken = url.searchParams.get('token') || url.searchParams.get('access_token');
    if (queryToken && queryToken.length > 0) {
        return {
            token: queryToken,
            method: TokenExtractionMethod.QUERY_PARAMETER,
        };
    }
    return { token: null };
}
/**
 * Parse cookie header into key-value pairs
 */
function parseCookies(cookieHeader) {
    var cookies = {};
    var pairs = cookieHeader.split(';');
    for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
        var pair = pairs_1[_i];
        var _a = pair.trim().split('='), key = _a[0], value = _a[1];
        if (key && value) {
            cookies[key] = decodeURIComponent(value);
        }
    }
    return cookies;
}
/**
 * Clear authentication cookie using secure cookie options
 */
function clearAuthCookie(name) {
    return createSecureCookie({
        name: name,
        value: '',
        maxAge: 0,
    });
}
/**
 * Clear all auth cookies from response using consolidated approach
 */
function clearAuthCookies(response) {
    response.headers.append('Set-Cookie', clearAuthCookie('accessToken'));
    response.headers.append('Set-Cookie', clearAuthCookie('auth_token'));
}
/**
 * Create secure cookie string with all options
 */
function createSecureCookie(options) {
    var name = options.name, value = options.value, _a = options.maxAge, maxAge = _a === void 0 ? 7 * 24 * 60 * 60 : _a, // 7 days default
    _b = options.httpOnly, // 7 days default
    httpOnly = _b === void 0 ? true : _b, _c = options.secure, secure = _c === void 0 ? true : _c, _d = options.sameSite, sameSite = _d === void 0 ? 'Lax' : _d, _e = options.path, path = _e === void 0 ? '/' : _e, domain = options.domain;
    var parts = ["".concat(name, "=").concat(encodeURIComponent(value))];
    if (maxAge > 0)
        parts.push("Max-Age=".concat(maxAge));
    if (path)
        parts.push("Path=".concat(path));
    if (domain)
        parts.push("Domain=".concat(domain));
    if (httpOnly)
        parts.push('HttpOnly');
    if (secure)
        parts.push('Secure');
    if (sameSite)
        parts.push("SameSite=".concat(sameSite));
    return parts.join('; ');
}
/**
 * Set auth cookies with proper security settings
 */
function setSecureAuthCookies(response, tokens) {
    var accessToken = tokens.accessToken, _a = tokens.accessTokenExpiry, accessTokenExpiry = _a === void 0 ? 3 * 24 * 60 * 60 : _a;
    // Set access token cookie
    response.headers.append('Set-Cookie', createSecureCookie({
        name: 'accessToken',
        value: accessToken,
        maxAge: accessTokenExpiry,
        httpOnly: true,
        sameSite: 'Lax',
    }));
}
/**
 * Extract comprehensive request metadata
 */
function extractRequestMetadata(request) {
    var _a, _b;
    var headers = request.headers;
    return {
        ipAddress: headers.get('CF-Connecting-IP') ||
            ((_b = (_a = headers.get('X-Forwarded-For')) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim()) ||
            headers.get('X-Real-IP') ||
            'unknown',
        userAgent: headers.get('User-Agent') || 'unknown',
        referer: headers.get('Referer') || undefined,
        origin: headers.get('Origin') || undefined,
        acceptLanguage: headers.get('Accept-Language') || undefined,
        // Cloudflare-specific
        cfConnectingIp: headers.get('CF-Connecting-IP') || undefined,
        cfRay: headers.get('CF-Ray') || undefined,
        cfCountry: headers.get('CF-IPCountry') || undefined,
        cfTimezone: headers.get('CF-Timezone') || undefined,
    };
}
function mapUserResponse(user) {
    // Handle AuthUser type - already in correct format
    if ('isAnonymous' in user) {
        return user;
    }
    // Map from User schema type
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName || undefined,
        username: user.username || undefined,
        avatarUrl: user.avatarUrl || undefined,
        bio: user.bio || undefined,
        timezone: user.timezone || undefined,
        provider: user.provider || undefined,
        emailVerified: user.emailVerified || undefined,
        createdAt: user.createdAt || undefined,
    };
}
function formatAuthResponse(user, sessionId, expiresAt) {
    var response = { user: user, sessionId: sessionId, expiresAt: expiresAt };
    return response;
}
