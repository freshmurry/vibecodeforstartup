"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRegenerationOperation = void 0;
var common_1 = require("../operations/common");
var realtimeCodeFixer_1 = require("../assistants/realtimeCodeFixer");
var config_1 = require("../inferutils/config");
var SYSTEM_PROMPT = "You are a Senior Software Engineer at Cloudflare specializing in surgical code fixes. Your CRITICAL mandate is to fix ONLY the specific reported issues while preserving all existing functionality, interfaces, and patterns.\n\n## CORE PRINCIPLES:\n1. **MINIMAL CHANGE POLICY** - Make isolated, small changes to fix the issue\n2. **PRESERVE EXISTING BEHAVIOR** - Never alter working code, only fix broken code\n3. **NO NEW FEATURES** - Do not add functionality, only repair existing functionality as explicitly requested\n4. **MAINTAIN INTERFACES** - Keep all exports, imports, and function signatures identical\n\n## FORBIDDEN ACTIONS (Will cause new issues):\n- Adding new dependencies or imports not already present\n- Changing function signatures or return types\n- Modifying working components to \"improve\" them\n- Refactoring code structure or patterns\n- Adding new state management or effects\n- Changing existing CSS classes or styling approaches\n\n## REQUIRED SAFETY CHECKS:\n- Verify the reported issue actually exists in current code\n- Ensure your fix targets the exact problem described\n- Maintain all existing error boundaries and null checks\n- Preserve existing React patterns (hooks, effects, state)\n- Keep the same component structure and props\n\nYour goal is zero regression - fix the issue without breaking anything else.";
var USER_PROMPT = "<SURGICAL_FIX_REQUEST: {{filePath}}>\n\n<CONTEXT>\nUser Query: {{query}}\nFile Path: {{filePath}}\nFile Purpose: {{filePurpose}}\n</CONTEXT>\n\n<CURRENT_FILE_CONTENTS>\n{{fileContents}}\n</CURRENT_FILE_CONTENTS>\n\n<SPECIFIC_ISSUES_TO_FIX>\n{{issues}}\n</SPECIFIC_ISSUES_TO_FIX>\n\n<FIX_PROTOCOL>\n## Step 1: Validate Issue Exists\n- Confirm each reported issue is present in the current file contents\n- SKIP issues that don't match the current code\n- SKIP issues about code that has already been changed\n\n## Step 2: Minimal Fix Identification  \n- Identify the smallest possible change to fix each valid issue\n- Avoid touching any working code\n- Preserve all existing patterns and structures\n\n## Step 3: Apply Surgical Fixes\nUse this exact format for each fix:\n\n**Example - Null Safety Fix:**\nIssue: \"Cannot read property 'items' of undefined\"\n<fix>\n# Add null check to prevent undefined access\n\n```\n<<<<<<< SEARCH\nconst total = data.items.length;\n=======\nconst total = data?.items?.length || 0;\n>>>>>>> REPLACE\n```\n</fix>\n\n**Example - Render Loop Fix:**\nIssue: \"Maximum update depth exceeded in useEffect\"\n<fix>\n# Add missing dependency array to prevent infinite loop\n\n```\n<<<<<<< SEARCH\nuseEffect(() => {\n  setState(newValue);\n});\n=======\nuseEffect(() => {\n  setState(newValue);\n}, [newValue]);\n>>>>>>> REPLACE\n```\n</fix>\n\n## SAFETY CONSTRAINTS:\n- SEARCH block must match existing code character-for-character\n- Only fix the exact reported problem\n- Never modify imports, exports, or function signatures\n- Preserve all existing error handling\n- Do not add new dependencies or change existing patterns\n- If an issue cannot be fixed surgically, explain why instead of forcing a fix\n</FIX_PROTOCOL>";
var FileRegenerationOperation = /** @class */ (function (_super) {
    __extends(FileRegenerationOperation, _super);
    function FileRegenerationOperation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileRegenerationOperation.prototype.execute = function (inputs, options) {
        return __awaiter(this, void 0, void 0, function () {
            var realtimeCodeFixer, fixedFile, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        realtimeCodeFixer = new realtimeCodeFixer_1.RealtimeCodeFixer(options.env, options.inferenceContext, false, undefined, config_1.AGENT_CONFIG.fileRegeneration, SYSTEM_PROMPT, USER_PROMPT);
                        return [4 /*yield*/, realtimeCodeFixer.run(inputs.file, {
                                previousFiles: options.context.allFiles,
                                query: options.context.query,
                                template: options.context.templateDetails
                            }, undefined, inputs.issues, 5)];
                    case 1:
                        fixedFile = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, fixedFile), { format: "full_content" })];
                    case 2:
                        error_1 = _a.sent();
                        options.logger.error("Error fixing file ".concat(inputs.file.filePath, ":"), error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return FileRegenerationOperation;
}(common_1.AgentOperation));
exports.FileRegenerationOperation = FileRegenerationOperation;
