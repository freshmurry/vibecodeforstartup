"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRegistry = void 0;
exports.formatSchemaAsMarkdown = formatSchemaAsMarkdown;
exports.parseMarkdownContent = parseMarkdownContent;
exports.generateTemplateForSchema = generateTemplateForSchema;
exports.parseContentForSchema = parseContentForSchema;
var zod_1 = require("zod");
// Markdown Parser: unified/remark
var unified_1 = require("unified");
var remark_parse_1 = require("remark-parse");
var remark_gfm_1 = require("remark-gfm");
var mdast_util_to_string_1 = require("mdast-util-to-string");
var logger_1 = require("../../logger");
// ReturnType<typeof createLogger> removed - using structured logger throughout
var logger = (0, logger_1.createLogger)('SchemaFormatter');
// --- Helper: Simple Singularization ---
/**
 * Basic singularization heuristic. Converts plural nouns ending in 's' to singular.
 * Handles simple cases like 'files' -> 'File', 'phases' -> 'Phase'.
 * Capitalizes the first letter. Returns capitalized original if no 's' ending.
 * @param word The plural word (usually the Zod key).
 * @returns The singularized and capitalized word.
 */
function singularize(word) {
    var singularBase = word;
    // Basic heuristic: remove trailing 's' if it's likely plural and not possessive/double-s
    if (word.toLowerCase().endsWith('s') && !word.toLowerCase().endsWith('ss') && word.length > 1) {
        // Avoid removing 's' if the word before it is also 's' (e.g. 'process') - simple check
        if (word.length < 2 || word.charAt(word.length - 2).toLowerCase() !== 's') {
            singularBase = word.slice(0, -1);
        }
    }
    // Capitalize the first letter
    return singularBase.charAt(0).toUpperCase() + singularBase.slice(1);
}
// --- UPDATED Markdown Formatter ---
function formatSchemaAsMarkdown(schema, options) {
    if (options === void 0) { options = {}; }
    var headingLevel = options.headingLevel || 2;
    var headingMarker = '#'.repeat(headingLevel);
    // Add instructions preamble
    //     const instructions = `# Instructions for Generation
    // Please fill out the following structure.
    // - Use the headings provided (e.g., \`## name\`, \`#### filePath\`).
    // - Place the value for each field inside triple backticks (\`\`\`) on the line(s) following the heading and description.
    // - For arrays (like \`files\`), use a heading like \`### File 1\`, \`### File 2\`, etc., for each item in the list, where "File" is the singular form of the array name.
    // - Provide all required fields. Optional sections can be omitted entirely or have an empty code block if explicitly empty.
    // - Ensure the content within the code blocks is raw text/code as appropriate for the field.
    // ---
    // `;
    return formatZodSchemaAsMarkdownFields(schema, headingMarker, undefined, false, 'template');
}
/**
 * Formats a JavaScript object into a Markdown string based on a Zod schema.
 * @param data The JavaScript object/data to format.
 * @param schema The Zod schema defining the structure.
 * @param options Formatting options.
 * @returns A Markdown string representing the data.
 */
function formatDataAsMarkdown(data, schema, options) {
    var _a;
    if (options === void 0) { options = {}; }
    var headingLevel = options.headingLevel || 2;
    var headingMarker = '#'.repeat(headingLevel);
    var debug = (_a = options.debug) !== null && _a !== void 0 ? _a : false;
    if (debug)
        logger.debug("--- Starting Data Formatting to Markdown ---");
    // Validate (for logging/diagnostics only). We intentionally avoid merging defaults
    // so that serialization does not introduce placeholder/template scaffolding.
    var validation = schema.safeParse(data);
    if (!validation.success) {
        logger.error("Input data failed Zod validation before formatting:", validation.error);
        logger.error("Original data:", data);
    }
    // Always serialize using the provided data object (no default merging),
    // and render in strict data mode (no template placeholders).
    return formatZodSchemaAsMarkdownFields(schema, headingMarker, data, debug, 'data');
}
/**
 * Recursive helper to format fields of an object.
 */
function formatZodSchemaAsMarkdownFields(schema, headingPrefix, dataObject, debug, mode) {
    if (debug === void 0) { debug = false; }
    if (mode === void 0) { mode = dataObject ? 'data' : 'template'; }
    var shape = schema._def.shape();
    var result = '';
    if (debug)
        logger.debug("[Format Data Path: object] Formatting object with keys: ".concat(Object.keys(shape).join(', ')));
    // Iterate through the keys defined in the SCHEMA's shape
    for (var _i = 0, _a = Object.keys(shape); _i < _a.length; _i++) {
        var key = _a[_i];
        var fieldSchema = shape[key];
        var value = dataObject ? dataObject[key] : undefined; // Get value from data
        if (debug)
            logger.debug("[Format Data Path: object.".concat(key, "] Processing key \"").concat(key, "\""));
        if (dataObject) {
            // Skip formatting optional fields if the value is undefined
            var isOptional = false;
            var checkSchema = fieldSchema;
            while (checkSchema instanceof zod_1.z.ZodOptional || checkSchema instanceof zod_1.z.ZodNullable || checkSchema instanceof zod_1.z.ZodDefault) {
                if (checkSchema instanceof zod_1.z.ZodOptional)
                    isOptional = true;
                if (checkSchema instanceof zod_1.z.ZodNullable)
                    isOptional = true;
                // Consider Default as optional for skipping if value is exactly undefined
                if (checkSchema instanceof zod_1.z.ZodDefault && value === undefined)
                    isOptional = true;
                checkSchema = checkSchema._def.innerType;
            }
            if (isOptional && (value === undefined || value === null || value === '')) {
                if (debug)
                    logger.debug("[Format Data Path: object.".concat(key, "] Skipping optional field with undefined value."));
                continue; // Skip this field entirely
            }
        }
        result += formatZodTypeAsMarkdown(key, fieldSchema, headingPrefix, value, mode);
    }
    return result;
}
function getMarkdownPlaceholderValue(key, field, headingPrefix) {
    var _a, _b, _c, _d;
    var value = '';
    // Base type formatting
    if (field instanceof zod_1.z.ZodArray) {
        var innerType = field._def.type;
        var example = '';
        // *** CHANGE: Use singularize for item name ***
        var singularKeyName = singularize(key);
        var itemHeadingPrefix = headingPrefix + '#'; // Increase heading level for items
        if (innerType instanceof zod_1.z.ZodObject) {
            // Generate example items using the singularized name
            example = "".concat(itemHeadingPrefix, " ").concat(singularKeyName, " 1\n\n").concat(formatZodSchemaAsMarkdownFields(innerType, itemHeadingPrefix + '#'), "\n"); // Note: recursive call uses deeper heading
            example += "".concat(itemHeadingPrefix, " ").concat(singularKeyName, " 2\n\n").concat(formatZodSchemaAsMarkdownFields(innerType, itemHeadingPrefix + '#'), "\n");
        }
        else {
            // Example for arrays of primitives
            var simpleDesc = getSimpleTypeDescription(innerType);
            example = "\n\nExample items (one per line or in code block):\n\n";
            example += "- [".concat(simpleDesc, " 1]\n");
            example += "- [".concat(simpleDesc, " 2]\n\n");
            example += "Or for multi-line content, use code blocks like this:\n\n";
            example += "```\n[Multi-line content for item 1]\n```\n\n";
            example += "```\n[Multi-line content for item 2]\n```\n";
        }
        // Add extra newline after array example for spacing
        // return `${heading}${description}\n\n${example}\n`;
        return example;
    }
    else if (field instanceof zod_1.z.ZodObject) {
        // Recurse with increased heading level
        return formatZodSchemaAsMarkdownFields(field, headingPrefix + '#');
    }
    else if (field instanceof zod_1.z.ZodString) {
        value = ((_a = field._def.checks) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.kind === 'uuid'; })) ? '[UUID string]' :
            ((_b = field._def.checks) === null || _b === void 0 ? void 0 : _b.find(function (c) { return c.kind === 'email'; })) ? '[email string]' :
                ((_c = field._def.checks) === null || _c === void 0 ? void 0 : _c.find(function (c) { return c.kind === 'url'; })) ? 'https://example.com/string' :
                    '[String content]';
    }
    else if (field instanceof zod_1.z.ZodNumber) {
        value = ((_d = field._def.checks) === null || _d === void 0 ? void 0 : _d.some(function (c) { return c.kind === 'int'; })) ? '[Integer value]' : '[Numeric value]';
    }
    else if (field instanceof zod_1.z.ZodBoolean) {
        value = 'true or false';
    }
    else if (field instanceof zod_1.z.ZodEnum || field instanceof zod_1.z.ZodNativeEnum) {
        var values = field._def.values;
        var placeholder = "[One of: ".concat(values.join(', '), "]");
        value = placeholder;
    }
    else if (field instanceof zod_1.z.ZodUnion) {
        value = '[Content based on one of the allowed types]';
    }
    else if (field instanceof zod_1.z.ZodOptional) {
        // Handle optional fields
        var innerType = field._def.innerType;
        if (innerType instanceof zod_1.z.ZodObject) {
            return formatZodSchemaAsMarkdownFields(innerType, headingPrefix + '#');
        }
        else {
            value = "[Optional content for ".concat(key, "]");
        }
    }
    else {
        // Fallback for other types
        value = "[Content for ".concat(key, "]");
    }
    return "```\n".concat(value, "\n```\n");
}
function formatZodTypeAsMarkdown(key, field, headingPrefix, value, mode) {
    if (headingPrefix === void 0) { headingPrefix = '##'; }
    if (mode === void 0) { mode = 'template'; }
    var optionalMarker = '';
    var baseField = field;
    var isOptional = false;
    // Determine optionality and get base type
    while (baseField instanceof zod_1.z.ZodOptional || baseField instanceof zod_1.z.ZodNullable || baseField instanceof zod_1.z.ZodDefault) {
        // Treat Nullable and Default as optional in the schema representation for clarity to the LLM
        if (baseField instanceof zod_1.z.ZodOptional || baseField instanceof zod_1.z.ZodDefault || baseField instanceof zod_1.z.ZodNullable) {
            isOptional = true;
        }
        baseField = baseField._def.innerType;
    }
    // Add the marker directly to the heading text if optional
    if (isOptional && mode === 'template') {
        // Show optional marker only in template mode
        optionalMarker = ' (Optional section)';
    }
    // Determine if the field actually has a value (type-aware)
    var hasValue;
    if (value === undefined || value === null) {
        hasValue = false;
    }
    else if (baseField instanceof zod_1.z.ZodString) {
        hasValue = String(value).trim().length > 0;
    }
    else if (baseField instanceof zod_1.z.ZodArray) {
        hasValue = Array.isArray(value) && value.length > 0;
    }
    else {
        // Numbers, booleans, enums, objects, etc. are considered present if not null/undefined
        hasValue = true;
    }
    // Only include schema field descriptions when generating templates
    var description = (mode === 'template' && !hasValue && field.description) ? "\n\n*Description: ".concat(field.description, "*") : '';
    // Generate heading
    var heading = "".concat(headingPrefix, " ").concat(key).concat(optionalMarker); // Optional marker added here
    if (!hasValue) {
        // Template mode -> emit helpful placeholders. Data mode -> avoid scaffolding
        if (mode === 'template') {
            var placeholder = getMarkdownPlaceholderValue(key, field, headingPrefix);
            return "".concat(heading).concat(description, "\n\n").concat(placeholder, "\n");
        }
        // DATA MODE
        // - For arrays/objects with no content, skip the entire section
        if (baseField instanceof zod_1.z.ZodArray || baseField instanceof zod_1.z.ZodObject) {
            return '';
        }
        // - For primitives, emit an empty code fence to represent "no value" without placeholders
        return "".concat(heading, "\n\n```\n\n```\n\n");
    }
    else if (baseField instanceof zod_1.z.ZodObject) {
        if (typeof value === 'object') {
            // logger.debug(`[Format Data Path: ...${key}] Formatting object with ${Object.keys(value).length} keys.`);
            // Ensure value is not null before recursing
            return "".concat(heading).concat(description, "\n\n").concat(formatZodSchemaAsMarkdownFields(baseField, headingPrefix + '#', value, false, mode), "\n");
        }
        else {
            // Handle cases where data is missing or not an object for a required object schema
            if (mode === 'template') {
                logger.warn("[Format Data Path: ...".concat(key, "] Expected object but got ").concat(typeof value, ". Rendering empty section."));
                return "".concat(heading).concat(description, "\n\n```\n[Missing or invalid object data]\n```\n\n");
            }
            // Data mode: skip invalid object sections
            return '';
        }
    }
    // --- Array Formatting ---
    else if (baseField instanceof zod_1.z.ZodArray) {
        var itemSchema_1 = baseField._def.type;
        var singularKeyName_1 = singularize(key);
        var itemHeadingPrefix_1 = headingPrefix + '#';
        var itemsMarkdown_1 = '';
        // logger.debug(`[Format Data Path: ...${key}] Formatting array with ${Array.isArray(value) ? value.length : 0} items.`);
        if (Array.isArray(value) && value.length > 0) {
            itemsMarkdown_1 += "\n";
            value.forEach(function (item, index) {
                var itemHeading = "".concat(itemHeadingPrefix_1, " ").concat(singularKeyName_1, " ").concat(index + 1);
                // logger.debug(`[Format Data Path: ...${key}[${index}]] Formatting object item: ${item}, schema: ${itemSchema}, heading: ${itemHeading}`);
                // Check if array items are objects
                if (itemSchema_1 instanceof zod_1.z.ZodObject) {
                    if (item && typeof item === 'object') {
                        // console.debug(`[Format Data Path: ...${key}[${index}]] Formatting object item with ${Object.keys(item).length} keys.`);
                        itemsMarkdown_1 += "".concat(itemHeading, "\n\n").concat(formatZodSchemaAsMarkdownFields(itemSchema_1, itemHeadingPrefix_1 + '#', item, false, mode), "\n");
                    }
                    else {
                        if (mode === 'template') {
                            logger.warn("[Format Data Path: ...".concat(key, "[").concat(index, "]] Expected object item but got ").concat(typeof item, ". Rendering empty item."));
                            itemsMarkdown_1 += "".concat(itemHeading, "\n\n```\n[Missing or invalid object item data]\n```\n\n");
                        }
                    }
                }
                else {
                    // Handle arrays of primitives (e.g., strings, numbers)
                    // Option: Format as a list or multi-line code block
                    // Current choice: Format each primitive item in its own section (less ideal, but fits pattern)
                    // Better: Format as list or single code block
                    // logger.warn(`[Format Data Path: ...${key}[${index}]] Formatting array of primitives - current output might be suboptimal.`);
                    // Simple primitive formatting (could be improved to list/code block)
                    var primitiveValueStr = String(item !== null && item !== void 0 ? item : ''); // Handle null/undefined primitives
                    // itemsMarkdown += `${itemHeading}\n\n*Description: ${itemSchema.description ?? `Value for ${singularKeyName} ${index + 1}`}*\n\n\`\`\`\n${primitiveValueStr}\n\`\`\`\n\n`;
                    itemsMarkdown_1 += "- ".concat(primitiveValueStr, "\n");
                }
            });
        }
        else {
            // Template mode may include a helpful note; Data mode omits empty arrays entirely
            if (mode === 'template') {
                itemsMarkdown_1 = '\n\n[No items provided for this list]\n\n';
            }
            else {
                return '';
            }
        }
        return "".concat(heading).concat(description, "\n").concat(itemsMarkdown_1, "\n"); // Add extra newline after array section
    }
    else {
        // Handle null specifically for nullable fields
        var valueStr = String(value !== null && value !== void 0 ? value : '');
        return "".concat(heading).concat(description, "\n\n```\n").concat(valueStr, "\n```\n\n");
    }
}
function getSimpleTypeDescription(field) {
    if (field instanceof zod_1.z.ZodString)
        return 'string value';
    if (field instanceof zod_1.z.ZodNumber)
        return 'numeric value';
    if (field instanceof zod_1.z.ZodBoolean)
        return 'true or false';
    if (field instanceof zod_1.z.ZodEnum || field instanceof zod_1.z.ZodNativeEnum)
        return 'enum value';
    if (field instanceof zod_1.z.ZodOptional || field instanceof zod_1.z.ZodNullable || field instanceof zod_1.z.ZodDefault) {
        return getSimpleTypeDescription(field._def.innerType) + " (optional/nullable)";
    }
    return 'value';
}
// --- Shared Helper Functions ---
function getDefaultValue(field) {
    if (field instanceof zod_1.z.ZodOptional)
        return undefined;
    if (field instanceof zod_1.z.ZodNullable)
        return null;
    if (field instanceof zod_1.z.ZodDefault) {
        try {
            var defaultValue = field._def.defaultValue;
            return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        }
        catch (e) {
            logger.warn("Error getting default value for field: ".concat(e instanceof Error ? e.message : String(e)));
            var inner = field._def.innerType;
            while (inner instanceof zod_1.z.ZodDefault)
                inner = inner._def.innerType;
            return getDefaultValue(inner); // Try getting default from inner type
        }
    }
    // Base type defaults
    if (field instanceof zod_1.z.ZodString)
        return '';
    if (field instanceof zod_1.z.ZodNumber)
        return 0;
    if (field instanceof zod_1.z.ZodBoolean)
        return false;
    if (field instanceof zod_1.z.ZodArray)
        return [];
    if (field instanceof zod_1.z.ZodObject) {
        var shape = field._def.shape();
        var defaultObj = {};
        for (var key in shape) {
            // Use the actual field definition from the shape to get the correct default
            defaultObj[key] = getDefaultValue(shape[key]);
        }
        return defaultObj;
    }
    // Enums, Unions, etc., don't have a clear universal default
    if (field instanceof zod_1.z.ZodEnum || field instanceof zod_1.z.ZodNativeEnum)
        return undefined;
    if (field instanceof zod_1.z.ZodUnion)
        return undefined;
    // Add other types as needed
    return undefined;
}
function convertToPrimitive(value, schema, debugInfo) {
    var _a = debugInfo || {}, _b = _a.path, path = _b === void 0 ? '?' : _b, _c = _a.logger, currentLogger = _c === void 0 ? logger : _c, _d = _a.debug, debug = _d === void 0 ? false : _d;
    var pathStr = Array.isArray(path) ? path.join('.') : path; // Ensure path is string for logs
    // 1. Handle non-string inputs (pass-through or basic conversion)
    if (typeof value !== 'string') {
        if (debug)
            currentLogger.debug("[Convert Path: ".concat(pathStr, "] Input is not a string (").concat(typeof value, "). Value: ").concat(JSON.stringify(value)));
        // Allow null/undefined through if schema permits
        if (value === null && schema instanceof zod_1.z.ZodNullable)
            return null;
        if (value === undefined && schema instanceof zod_1.z.ZodOptional)
            return undefined;
        if (value === null && schema instanceof zod_1.z.ZodOptional)
            return undefined; // Treat null as undefined for optional
        // Handle defaults if input is null/undefined
        if ((value === null || value === undefined) && schema instanceof zod_1.z.ZodDefault) {
            if (debug)
                currentLogger.debug("[Convert Path: ".concat(pathStr, "] Non-string null/undefined for ZodDefault. Returning default."));
            return getDefaultValue(schema);
        }
        // Handle null for ZodNullable when input is undefined
        if (value === undefined && schema instanceof zod_1.z.ZodNullable) {
            if (debug)
                currentLogger.debug("[Convert Path: ".concat(pathStr, "] Non-string undefined for ZodNullable. Returning null."));
            return null;
        }
        // If type already matches base schema type, pass through (validation happens later)
        var baseSchema = schema;
        while (baseSchema instanceof zod_1.z.ZodOptional || baseSchema instanceof zod_1.z.ZodNullable || baseSchema instanceof zod_1.z.ZodDefault) {
            baseSchema = baseSchema._def.innerType;
        }
        if (baseSchema instanceof zod_1.z.ZodString && typeof value === 'string')
            return value; // Already handled string case above
        if (baseSchema instanceof zod_1.z.ZodNumber && typeof value === 'number')
            return value;
        if (baseSchema instanceof zod_1.z.ZodBoolean && typeof value === 'boolean')
            return value;
        // If type doesn't match, convert to string and proceed with string parsing logic
        if (debug)
            currentLogger.debug("[Convert Path: ".concat(pathStr, "] Non-string type (").concat(typeof value, ") doesn't match schema ").concat(baseSchema.constructor.name, ". Converting to string."));
        value = String(value); // Convert to string for further processing
    }
    // 2. Handle string input (trimming)
    var stringValue = value.trim();
    if (debug)
        currentLogger.debug("[Convert Path: ".concat(pathStr, "] Processing trimmed string value: \"").concat(stringValue.substring(0, 100), "...\""));
    // 3. Unwrap Zod modifiers (Optional, Nullable, Default) for processing empty/nullish strings
    if (schema instanceof zod_1.z.ZodOptional || schema instanceof zod_1.z.ZodNullable || schema instanceof zod_1.z.ZodDefault) {
        var innerSchema = schema._def.innerType;
        var isEmpty = stringValue === '';
        // More robust check for common "empty" values from LLMs
        var isNullish = isEmpty || ['null', 'none', 'n/a', 'undefined', 'nil', 'empty', 'missing', '[no value]', '[not applicable]'].includes(stringValue.toLowerCase());
        if (debug)
            currentLogger.debug("[Convert Path: ".concat(pathStr, "] Checking modifiers: Optional=").concat(schema instanceof zod_1.z.ZodOptional, ", Nullable=").concat(schema instanceof zod_1.z.ZodNullable, ", Default=").concat(schema instanceof zod_1.z.ZodDefault, ". IsEmpty=").concat(isEmpty, ", IsNullish=").concat(isNullish));
        // Handle based on the *outer* modifier first if the string is considered nullish
        if (isNullish) {
            if (schema instanceof zod_1.z.ZodDefault) {
                if (debug)
                    currentLogger.debug("[Convert Path: ".concat(pathStr, "] Empty/nullish string for ZodDefault. Returning default value."));
                return getDefaultValue(schema); // Return default *before* attempting inner parse
            }
            if (schema instanceof zod_1.z.ZodOptional) {
                if (debug)
                    currentLogger.debug("[Convert Path: ".concat(pathStr, "] Empty/nullish string for ZodOptional. Returning undefined."));
                return undefined;
            }
            if (schema instanceof zod_1.z.ZodNullable) {
                if (debug)
                    currentLogger.debug("[Convert Path: ".concat(pathStr, "] Empty/nullish string for ZodNullable. Returning null."));
                return null;
            }
        }
        // If not empty/nullish, or if modifiers didn't result in a return, parse using the inner type
        if (debug)
            currentLogger.debug("[Convert Path: ".concat(pathStr, "] Passing value to inner schema: ").concat(innerSchema.constructor.name));
        return convertToPrimitive(stringValue, innerSchema, debugInfo);
    }
    // 4. Base type conversions from non-empty string
    if (schema instanceof zod_1.z.ZodString) {
        // Basic XML unescape - harmless for plain text
        var unescaped = stringValue
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        if (debug)
            currentLogger.debug("[Convert Path: ".concat(pathStr, "] Returning string value: \"").concat(unescaped.substring(0, 100), "...\""));
        return unescaped;
    }
    else if (schema instanceof zod_1.z.ZodNumber) {
        var cleanValue = stringValue.replace(/[, $£€]/g, ''); // Remove common currency/grouping chars
        if (cleanValue === '') {
            // This case should ideally be caught by ZodOptional/Nullable/Default handling above
            if (debug)
                currentLogger.warn("[Convert Path: ".concat(pathStr, "] Empty string reached number conversion. Returning default (0)."));
            return getDefaultValue(zod_1.z.number()); // Use number default (0) - pass base type
        }
        var num = Number(cleanValue);
        if (debug)
            currentLogger.debug("[Convert Path: ".concat(pathStr, "] Parsed number: ").concat(num));
        // Let Zod handle NaN/Infinity validation during the final parse step
        return num;
    }
    else if (schema instanceof zod_1.z.ZodBoolean) {
        var lower = stringValue.toLowerCase();
        if (['true', 'yes', '1', 'on'].includes(lower)) { // Added 'on'
            if (debug)
                currentLogger.debug("[Convert Path: ".concat(pathStr, "] Parsed boolean: true"));
            return true;
        }
        if (['false', 'no', '0', 'off'].includes(lower)) { // Added 'off'
            if (debug)
                currentLogger.debug("[Convert Path: ".concat(pathStr, "] Parsed boolean: false"));
            return false;
        }
        // This case should ideally be caught by ZodOptional/Nullable/Default handling above
        if (debug)
            currentLogger.warn("[Convert Path: ".concat(pathStr, "] Could not parse \"").concat(stringValue, "\" as boolean. Returning default (false)."));
        return getDefaultValue(zod_1.z.boolean()); // Use boolean default (false) - pass base type
    }
    else if (schema instanceof zod_1.z.ZodEnum || schema instanceof zod_1.z.ZodNativeEnum) {
        var enumValues = schema._def.values;
        // Try direct match first
        if (enumValues.includes(stringValue))
            return stringValue;
        // Try matching number value
        var numValue = Number(stringValue);
        if (!isNaN(numValue) && enumValues.includes(numValue))
            return numValue;
        // Try case-insensitive match for string enums
        var lowerValue_1 = stringValue.toLowerCase();
        var matchedEnum = enumValues.find(function (enumVal) { return typeof enumVal === 'string' && enumVal.toLowerCase() === lowerValue_1; });
        if (matchedEnum !== undefined)
            return matchedEnum;
        if (debug)
            currentLogger.warn("[Convert Path: ".concat(pathStr, "] Value \"").concat(stringValue, "\" not in enum [").concat(enumValues.join(', '), "]. Returning undefined."));
        return undefined; // No clear default for enum, let Zod validation handle it
    }
    else {
        // Fallback for unknown Zod types during conversion
        if (debug)
            currentLogger.warn("[Convert Path: ".concat(pathStr, "] Unhandled Zod type ").concat(schema.constructor.name, " in convertToPrimitive. Returning raw string value."));
        return stringValue;
    }
}
// Setup Markdown parser (unified/remark)
var mdParser = (0, unified_1.unified)().use(remark_parse_1.default).use(remark_gfm_1.default);
/* Helper: Get last element of array */
var last = function (arr) {
    return arr.length ? arr[arr.length - 1] : undefined;
};
function normalize(text) {
    if (!text)
        return '';
    var normalized = text.toLowerCase();
    // Remove common parenthetical modifiers from the end of the string.
    // This helps treat "heading (optional)" as "heading".
    // Extend the list of keywords in the regex as needed.
    var commonModifiersRegex = /\s*\((?:optional|required|note|info|beta|new|deprecated|experimental|advanced|basic|default|example|eg|ie|important|warning|tip|hint|faq|todo|fixme|bug|issue|ref|see|compare|contrast|aka|viz|etc|misc|other)\)\s*$/i;
    normalized = normalized.replace(commonModifiersRegex, '');
    // General punctuation removal (keeps alphanumeric, underscores, and spaces)
    // \w in JavaScript regex includes [A-Za-z0-9_], so underscores are preserved.
    normalized = normalized
        .replace(/[^\w\s]/g, '') // Remove characters that are NOT word characters or whitespace.
        .replace(/\s+/g, ' ') // Normalize multiple spaces to a single space
        .trim();
    return normalized;
}
/* Helper: Type guards for mdast nodes */
function isCode(node) {
    return node.type === 'code';
}
function isList(node) {
    return node.type === 'list';
}
function isListItem(node) {
    return node.type === 'listItem';
}
function isHeading(node) {
    return node.type === 'heading';
}
function isThematicBreak(node) {
    return node.type === 'thematicBreak';
}
/* Helper: Extract primitive value from a section's nodes */
function extractPrimitiveValueFromNodes(nodes, debugInfo) {
    var _a = debugInfo || {}, _b = _a.path, path = _b === void 0 ? '?' : _b, _c = _a.logger, currentLogger = _c === void 0 ? logger : _c, _d = _a.debug, debug = _d === void 0 ? false : _d;
    if (!nodes || nodes.length === 0) {
        if (debug)
            currentLogger.debug("[Extract Path: ".concat(path, "] No nodes provided."));
        return '';
    }
    // Strategy 1: Find the *first* code block and return its value.
    var firstCodeBlock = nodes.find(isCode);
    if (firstCodeBlock) {
        if (debug)
            currentLogger.debug("[Extract Path: ".concat(path, "] Strategy 1: Found code block. Returning its value."));
        return firstCodeBlock.value.trim();
    }
    // Strategy 2: If no code block, look for a single list (less common for primitives, but possible).
    var listNodes = nodes.filter(isList);
    if (nodes.length === 1 && listNodes.length === 1) {
        if (debug)
            currentLogger.debug("[Extract Path: ".concat(path, "] Strategy 2: Found a single list node."));
        var list = listNodes[0];
        // Join list items, assuming primitive content within them
        return list.children.map(function (li) { return (0, mdast_util_to_string_1.toString)(li).trim(); }).join('\n');
    }
    // Strategy 3: If no code block and not a single list, stringify all paragraph/text content.
    // Filter out descriptions/instructions if possible (heuristics)
    if (debug)
        currentLogger.debug("[Extract Path: ".concat(path, "] Strategy 3: No code block or single list found. Stringifying relevant nodes."));
    var relevantNodes = nodes.filter(function (node) {
        return node.type === 'paragraph' || node.type === 'text' || node.type === 'inlineCode';
    }
    // Avoid including descriptions that might be paragraphs
    // This simple check assumes descriptions are italicized paragraphs
    // !(node.type === 'paragraph' && node.children?.[0]?.type === 'emphasis')
    );
    var tempRoot = { type: 'root', children: relevantNodes };
    var stringified = (0, mdast_util_to_string_1.toString)(tempRoot).trim();
    // Avoid returning just the description if it was the only paragraph
    if (stringified.startsWith('Description:')) {
        if (debug)
            currentLogger.debug("[Extract Path: ".concat(path, "] Stringified value seems to be only the description. Returning empty string."));
        return '';
    }
    if (debug)
        currentLogger.debug("[Extract Path: ".concat(path, "] Stringified value: \"").concat(stringified.substring(0, 100), "...\""));
    return stringified;
}
function buildSectionTree(root) {
    var _a, _b;
    var top = { heading: null, nodes: [], children: [] };
    var stack = [top];
    for (var _i = 0, _c = root.children; _i < _c.length; _i++) {
        var node = _c[_i];
        if (isHeading(node)) { // Use type guard
            var headingNode = node;
            var headingText = (0, mdast_util_to_string_1.toString)(headingNode);
            // Ignore headings that are empty or just whitespace/markers after normalization
            if (normalize(headingText) === '') {
                continue;
            }
            var sec = { heading: headingNode, nodes: [], children: [] };
            // Adjust stack based on heading depth
            while (stack.length > 1 && ((_b = (_a = last(stack).heading) === null || _a === void 0 ? void 0 : _a.depth) !== null && _b !== void 0 ? _b : 0) >= headingNode.depth) {
                stack.pop();
            }
            // Add section to the correct parent
            if (stack.length > 0) {
                last(stack).children.push(sec);
                stack.push(sec); // Push the new section onto the stack
            }
            else {
                // This case should ideally not happen with a valid root node
                logger.error("Stack became empty unexpectedly during tree build for heading:", headingText);
                stack.push(top); // Attempt recovery?
                top.children.push(sec);
                stack.push(sec);
            }
        }
        else {
            // Add non-heading nodes to the current section at the top of the stack
            if (stack.length > 0) {
                // Ignore nodes that are just whitespace or thematic breaks between sections
                var nodeString = (0, mdast_util_to_string_1.toString)(node).trim();
                if (nodeString !== '' && !isThematicBreak(node)) {
                    last(stack).nodes.push(node);
                }
            }
            else {
                // Content before the first heading
                var nodeString = (0, mdast_util_to_string_1.toString)(node).trim();
                if (nodeString !== '' && !isThematicBreak(node)) {
                    logger.warn("Node found outside any section (before first heading?)", {
                        nodeType: node.type,
                        content: nodeString.substring(0, 50)
                    });
                    top.nodes.push(node); // Add to the top-level node list
                }
            }
        }
    }
    return top;
}
/* --- Preprocessing Function --- */
function preprocessMarkdown(markdown, debug) {
    if (debug)
        logger.debug("--- Preprocessing Markdown ---");
    var processed = markdown.trim();
    // Remove outer ```markdown ... ``` fences or similar
    // Make language tag optional and handle potential leading/trailing whitespace better
    var outerFenceRegex = /^```(?:\w*\s*)?\n([\s\S]*?)\n```$/i;
    var match = processed.match(outerFenceRegex);
    if (match && match[1]) {
        // Heuristic: Only strip if content looks like our structured markdown (contains ##)
        // This avoids stripping fences from single code block outputs meant for a simple string field.
        if (match[1].includes('##')) {
            if (debug)
                logger.debug("Removed outer ```...``` fences (heuristic match).");
            processed = match[1].trim();
        }
        else {
            if (debug)
                logger.debug("Outer ```...``` fences found, but content doesn't look like markdown structure. Keeping fences.");
        }
    }
    // Remove potential preamble (like the instructions) before the first real heading
    // Make this more robust: find the first line starting with ##
    var lines = processed.split('\n');
    var firstHeadingIndex = lines.findIndex(function (line) { return line.trim().startsWith('##'); });
    if (firstHeadingIndex > 0) {
        // Check if lines *before* the first heading contain other headings - if so, don't strip
        var preamble = lines.slice(0, firstHeadingIndex).join('\n');
        if (!preamble.includes('\n##')) {
            if (debug)
                logger.debug("Removing potential preamble before first H2 heading.");
            processed = lines.slice(firstHeadingIndex).join('\n');
        }
        else {
            if (debug)
                logger.debug("Content found before first H2, but it contains other headings. Not removing preamble.");
        }
    }
    else if (firstHeadingIndex === -1 && processed.length > 0 && !processed.startsWith('##')) {
        // Handle case where there's content but NO H2 headings at all (might be invalid input)
        if (debug)
            logger.debug("No H2 headings found in input. Preprocessing might not apply.");
    }
    // Optional: Uncomment headings within code fences (use with caution)
    // processed = processed.replace(/```\s*(##+.*)\s*```/g, '$1');
    if (debug)
        logger.debug("--- Preprocessing Complete ---");
    return processed;
}
/* --- Public Markdown Parser Entry Point --- */
function parseMarkdownContent(markdownInput, schema, options) {
    if (options === void 0) { options = {}; }
    var _a = options.debug, debug = _a === void 0 ? false : _a;
    // Pass debug flag to logger if necessary (or handle globally)
    // logger.setDebug(debug); // Example if logger supports it
    if (debug)
        logger.debug("--- Starting Markdown Parsing ---");
    // 1. Preprocess Markdown
    var cleanedMarkdown = preprocessMarkdown(markdownInput, debug);
    if (debug) {
        logger.debug("--- Cleaned Markdown Input ---");
        console.log(cleanedMarkdown); // Use console.log for multi-line visibility
        logger.debug("--- End Cleaned Markdown Input ---");
    }
    // 2. Parse Markdown to AST
    var root;
    try {
        root = mdParser.parse(cleanedMarkdown);
        if (debug) {
            logger.debug("--- MDAST Root ---");
            // console.log(JSON.stringify(root, null, 2)); // Full AST can be huge
            console.log(JSON.stringify(root, function (key, value) { return key === 'position' ? undefined : value; }, 2)); // Cleaner log
            logger.debug("--- End MDAST Root ---");
        }
    }
    catch (error) {
        logger.error("Markdown parsing failed:", error);
        // Return default value of the schema on critical parsing failure
        return getDefaultValue(schema);
    }
    // 3. Build Section Tree
    var sectionTree;
    try {
        sectionTree = buildSectionTree(root);
        if (debug) {
            logger.debug("--- Section Tree ---");
            // console.log(JSON.stringify(sectionTree, null, 2)); // Full tree can be huge
            console.log(JSON.stringify(sectionTree, function (key, value) { return key === 'position' ? undefined : value; }, 2)); // Cleaner log
            logger.debug("--- End Section Tree ---");
        }
    }
    catch (error) {
        logger.error("Building section tree failed:", error);
        return getDefaultValue(schema);
    }
    // 4. Map AST/Tree to Zod Schema Structure
    var draftData;
    try {
        // Pass the original schema (including wrappers) to the mapping function
        draftData = mapSectionToSchema(sectionTree, schema, [], debug, schema); // Pass root schema
        if (debug) {
            logger.debug("--- Draft Data (Before Validation) ---");
            console.log(JSON.stringify(draftData, null, 2));
            logger.debug("--- End Draft Data ---");
        }
    }
    catch (error) {
        logger.error("Mapping section tree to schema failed:", error);
        // Return partially parsed data if available, otherwise default
        return draftData !== null && draftData !== void 0 ? draftData : getDefaultValue(schema);
    }
    // 5. Validate with Zod Schema
    var validationResult = schema.safeParse(draftData);
    if (!validationResult.success) {
        logger.warn('--- Zod Validation Failed ---');
        // Use console.error for better visibility of the error object
        console.error(JSON.stringify(validationResult.error.format(), null, 2));
        logger.warn('--- End Zod Validation Failure ---');
        // Return the draft data even if validation fails, allowing partial results
        return draftData;
    }
    if (debug)
        logger.debug('--- Markdown Parsed & Validated Successfully ---');
    return validationResult.data;
}
/**
 * A list of common English stop words.
 * This list can be expanded for better results.
 */
var STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'i', 'you', 'me', 'my', 'your', 'they', 'them', 'their',
    'this', 'these', 'those', 'am', 'if', 'or', 'but', 'not', 's', 't', 'can',
    'mr', 'mrs', 'ms', 'dr', 'prof'
    // Add more domain-specific stop words if necessary
]);
/**
 * Performs basic stemming on a word.
 * This is a very simplified stemmer. For more accuracy, a proper stemming algorithm
 * (like Porter stemmer) would be needed, but that adds complexity/dependencies.
 * @param word The input word.
 * @returns The stemmed word.
 */
function simpleStem(word) {
    if (word.length < 3)
        return word;
    var suffixes = ['s', 'es', 'ed', 'ing', 'ly', 'er', 'est'];
    for (var _i = 0, suffixes_1 = suffixes; _i < suffixes_1.length; _i++) {
        var suffix = suffixes_1[_i];
        if (word.endsWith(suffix)) {
            // Be careful not to over-stem, e.g., "address" -> "addre" if "ss" is a suffix
            // This simple version just removes it if the remaining part is long enough.
            if (word.length - suffix.length >= 2) {
                return word.slice(0, -suffix.length);
            }
        }
    }
    // A common case: plural 's'
    if (word.endsWith('s') && word.length > 1 && !word.endsWith('ss') && !word.endsWith('us')) {
        return word.slice(0, -1);
    }
    return word;
}
/**
 * Tokenizes a string into words, removes stop words, and optionally stems them.
 * @param text The input string (should be pre-normalized).
 * @param useStemming Whether to apply simple stemming.
 * @returns An array of processed tokens.
 */
function preprocessText(text, useStemming) {
    if (useStemming === void 0) { useStemming = true; }
    if (!text)
        return [];
    return text
        .split(' ')
        .filter(function (token) { return token.length > 0 && !STOP_WORDS.has(token); })
        .map(function (token) { return (useStemming ? simpleStem(token) : token); });
}
/**
 * Generates N-grams from an array of tokens.
 * @param tokens The input array of tokens.
 * @param n The size of the N-grams (e.g., 1 for unigrams, 2 for bigrams).
 * @returns A Set of N-grams.
 */
function generateNgrams(tokens, n) {
    var ngrams = new Set();
    if (n <= 0 || tokens.length === 0)
        return ngrams;
    for (var i = 0; i <= tokens.length - n; i++) {
        ngrams.add(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
}
/**
 * Calculates the Jaccard Index between two sets.
 * Jaccard Index = |Intersection(A, B)| / |Union(A, B)|
 * @param setA The first set.
 * @param setB The second set.
 * @returns The Jaccard Index (a value between 0 and 1).
 */
function jaccardIndex(setA, setB) {
    if (setA.size === 0 && setB.size === 0)
        return 1.0; // Both empty, considered identical
    if (setA.size === 0 || setB.size === 0)
        return 0.0; // One empty, no similarity
    var intersection = new Set();
    setA.forEach(function (elem) {
        if (setB.has(elem)) {
            intersection.add(elem);
        }
    });
    var unionSize = setA.size + setB.size - intersection.size;
    return intersection.size / unionSize;
}
/**
 * Calculates a semantic similarity score between two text strings.
 * This implementation is fast and does not use LLMs.
 * It relies on normalization, stop word removal, N-grams, and Jaccard index.
 *
 * @param text1 The first text string.
 * @param text2 The second text string.
 * @param options Optional configuration for the similarity calculation.
 * @returns A similarity score between 0 (no similarity) and 1 (identical).
 */
function getSemanticSimilarity(text1, text2, options) {
    var _a, _b, _c;
    // Default options
    var config = {
        useStemming: (_a = options === null || options === void 0 ? void 0 : options.useStemming) !== null && _a !== void 0 ? _a : true,
        ngramMinSize: (_b = options === null || options === void 0 ? void 0 : options.ngramMinSize) !== null && _b !== void 0 ? _b : 1,
        ngramMaxSize: (_c = options === null || options === void 0 ? void 0 : options.ngramMaxSize) !== null && _c !== void 0 ? _c : 2,
        weights: options === null || options === void 0 ? void 0 : options.weights // If not provided, will average scores or use only max N-gram
    };
    if (!text1 && !text2)
        return 1.0; // Both empty, consider them identical
    if (!text1 || !text2)
        return 0.0; // One is empty, no similarity
    // 1. Normalize text
    var normalizedText1 = normalize(text1);
    var normalizedText2 = normalize(text2);
    if (normalizedText1 === normalizedText2)
        return 1.0; // Identical after normalization
    // 2. Preprocess (tokenize, remove stop words, optionally stem)
    var tokens1 = preprocessText(normalizedText1, config.useStemming);
    var tokens2 = preprocessText(normalizedText2, config.useStemming);
    if (tokens1.length === 0 && tokens2.length === 0)
        return 1.0; // Both become empty after preprocessing
    if (tokens1.length === 0 || tokens2.length === 0)
        return 0.0; // One becomes empty
    var totalSimilarityScore = 0;
    var totalWeight = 0;
    var scoresByNgramSize = {};
    // 3. Generate N-grams and calculate Jaccard Index for each N-gram size
    for (var n = config.ngramMinSize; n <= config.ngramMaxSize; n++) {
        if (n <= 0)
            continue; // Skip invalid N-gram sizes
        var ngrams1 = generateNgrams(tokens1, n);
        var ngrams2 = generateNgrams(tokens2, n);
        var similarity = jaccardIndex(ngrams1, ngrams2);
        scoresByNgramSize[n] = similarity;
        // Apply weighting if provided
        if (config.weights) {
            var weightKey = n === 1 ? 'unigram' : n === 2 ? 'bigram' : "ngram".concat(n);
            var weight = config.weights[weightKey] || (n === config.ngramMaxSize ? 1 : 0); // Default to weight 1 for max N-gram if not specified
            totalSimilarityScore += similarity * weight;
            totalWeight += weight;
        }
    }
    if (config.weights) {
        return totalWeight > 0 ? totalSimilarityScore / totalWeight : 0;
    }
    else {
        // If no weights, average the scores of the N-grams calculated,
        // or simply return the score for the largest N-gram size if only one size is effectively used.
        // For simplicity, let's average if multiple N-gram sizes were processed.
        var NgramSizesProcessed = Object.keys(scoresByNgramSize).length;
        if (NgramSizesProcessed === 0)
            return 0.0;
        var sumOfScores = 0;
        for (var n in scoresByNgramSize) {
            sumOfScores += scoresByNgramSize[n];
        }
        return sumOfScores / NgramSizesProcessed;
    }
}
/* --- Core Recursive Mapper: Section Tree -> Zod Schema (REVISED) --- */
function mapSectionToSchema(section, schema, // The schema for the *current* level being processed
path, debug, rootSchema // Keep a reference to the top-level schema if needed
) {
    var currentPath = path.join('.') || '<root>';
    var sectionHeadingText = section.heading ? (0, mdast_util_to_string_1.toString)(section.heading) : '<root>'; // Use <root> for top level
    if (debug)
        logger.debug("[Map Path: ".concat(currentPath, "] > Section: \"").concat(sectionHeadingText, "\", Target Schema: ").concat(schema.constructor.name));
    // --- 1. Handle Schema Modifiers (Extract Base Schema) ---
    var baseSchema = schema;
    var isOptional = false;
    var isNullable = false;
    var hasDefault = false;
    // Need to check the original schema for modifiers
    var checkSchema = schema;
    while (checkSchema instanceof zod_1.z.ZodOptional || checkSchema instanceof zod_1.z.ZodNullable || checkSchema instanceof zod_1.z.ZodDefault) {
        if (checkSchema instanceof zod_1.z.ZodOptional)
            isOptional = true;
        if (checkSchema instanceof zod_1.z.ZodNullable)
            isNullable = true;
        if (checkSchema instanceof zod_1.z.ZodDefault)
            hasDefault = true;
        baseSchema = checkSchema._def.innerType; // Keep updating baseSchema here
        checkSchema = checkSchema._def.innerType; // Continue unwrapping checkSchema
    }
    // If no modifiers were found, baseSchema is the same as the original schema
    if (!isOptional && !isNullable && !hasDefault) {
        baseSchema = schema;
    }
    var schemaInfo = "Base: ".concat(baseSchema.constructor.name, ", Optional=").concat(isOptional, ", Nullable=").concat(isNullable, ", Default=").concat(hasDefault);
    if (debug && baseSchema !== schema)
        logger.debug("[Map Path: ".concat(currentPath, "] Schema Info: ").concat(schemaInfo));
    // --- 2. Handle Base Schema Types ---
    /* --- 2a. ZodObject --- */
    if (baseSchema instanceof zod_1.z.ZodObject) {
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] Handling ZodObject."));
        var shape = baseSchema.shape;
        var outputObject = {};
        // Initialize with default values for all keys in the schema
        // Important: Use the field definition from the shape for getDefaultValue
        var remainingKeys = {};
        for (var _i = 0, _a = Object.keys(shape); _i < _a.length; _i++) {
            var key = _a[_i];
            remainingKeys[key] = true; // Track remaining keys
        }
        for (var _b = 0, _c = Object.keys(shape); _b < _c.length; _b++) {
            var key = _c[_b];
            outputObject[key] = getDefaultValue(shape[key]);
        }
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] Initialized object with defaults"), {
                path: currentPath,
                defaults: outputObject
            });
        // Iterate through the *actual* children found in the Markdown section
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] Iterating through ").concat(section.children.length, " children of section \"").concat(sectionHeadingText, "\" to find matches..."));
        for (var _d = 0, _e = section.children; _d < _e.length; _d++) {
            var childSection = _e[_d];
            if (childSection.heading) {
                var childHeadingText = (0, mdast_util_to_string_1.toString)(childSection.heading);
                var normalizedChildHeading = normalize(childHeadingText); // Normalize here
                if (debug)
                    logger.debug("[Map Path: ".concat(currentPath, "]  -- Checking child heading: \"").concat(childHeadingText, "\" (Normalized: \"").concat(normalizedChildHeading, "\")"));
                // Find the corresponding key in the Zod schema shape (case-insensitive on normalized)
                var matchedKey = undefined;
                // --- Fuzzy Matching Logic (Optional but Recommended) ---
                var minDistance = 3; // Example threshold
                for (var _f = 0, _g = Object.keys(remainingKeys); _f < _g.length; _f++) {
                    var key = _g[_f];
                    // Ignore already matched keys
                    // const keyDistance = levenshtein.get(normalize(key), normalizedChildHeading);
                    var keyDistance = 1.0 - getSemanticSimilarity(normalize(key), normalizedChildHeading, {
                        useStemming: true,
                        ngramMinSize: 1,
                        ngramMaxSize: 2,
                        // weights: { unigram: 0.4, bigram: 0.6 }
                    });
                    if (debug)
                        logger.debug("[Map Path: ".concat(currentPath, "]   - Comparing \"").concat(key, "\" (Normalized: \"").concat(normalize(key), "\") with \"").concat(normalizedChildHeading, "\". Distance: ").concat(keyDistance));
                    if (keyDistance < minDistance) {
                        minDistance = keyDistance;
                        matchedKey = key;
                    }
                    else if (normalize(key) === normalizedChildHeading && keyDistance === 0) {
                        // Prioritize exact match even if a fuzzy match was found earlier
                        matchedKey = key;
                        break;
                    }
                }
                if (matchedKey) {
                    var fieldPath = __spreadArray(__spreadArray([], path, true), [matchedKey], false);
                    var fieldPathStr = fieldPath.join('.');
                    if (debug)
                        logger.debug("[Map Path: ".concat(fieldPathStr, "]   -- Normalized heading \"").concat(normalizedChildHeading, "\" matches schema key \"").concat(matchedKey, "\". Recursing."));
                    // Recurse and update the output object, overwriting the default
                    // Pass the specific field schema from the shape
                    outputObject[matchedKey] = mapSectionToSchema(childSection, shape[matchedKey], fieldPath, debug, rootSchema);
                    // Remove the matched key from remainingKeys to avoid duplicates
                    delete remainingKeys[matchedKey];
                }
                else {
                    if (debug)
                        logger.debug("[Map Path: ".concat(currentPath, "] Normalized heading does not match schema shape"), {
                            path: currentPath,
                            normalizedHeading: normalizedChildHeading
                        });
                }
            }
            else {
                if (debug)
                    logger.debug("[Map Path: ".concat(currentPath, "]  -- Skipping child section with no heading."));
            }
        }
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] Finished processing children"), {
                path: currentPath,
                outputObject: outputObject
            });
        return outputObject;
    }
    /* --- 2b. ZodArray --- */
    if (baseSchema instanceof zod_1.z.ZodArray) {
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] Handling ZodArray."));
        var itemSchema_2 = baseSchema._def.type;
        var results_1 = [];
        // *** CHANGE: Use singularize for item name matching ***
        var arrayKey = path.length > 0 ? path[path.length - 1] : ''; // Get the key name for this array
        var singularKeyName = singularize(arrayKey); // e.g., "File", "Phase"
        // Create a regex to match headings like "File 1", "File #2", "File" (optional number)
        // Make it case-insensitive
        var itemHeadingRegex = new RegExp("^".concat(singularKeyName.toLowerCase(), "(?:\\s*(?:#|\\d+))?$"), 'i');
        // Strategy ①: Look for Markdown list items directly within the current section's nodes
        // This is less likely with the new format but kept as a fallback for simple arrays
        var directList = section.nodes.find(isList);
        if (directList && !(itemSchema_2 instanceof zod_1.z.ZodObject)) { // Only use for primitive arrays
            if (debug)
                logger.debug("[Map Path: ".concat(currentPath, "] Strategy 1: Found direct list in section nodes for primitive array (").concat(directList.children.length, " items)."));
            directList.children.forEach(function (listItem, i) {
                if (isListItem(listItem)) {
                    var itemPath = __spreadArray(__spreadArray([], path, true), [String(i)], false);
                    // Create a temporary section for the list item content
                    var itemSection = { heading: null, nodes: listItem.children, children: [] };
                    if (debug)
                        logger.debug("[Map Path: ".concat(itemPath.join('.'), "] Mapping list item ").concat(i, "."));
                    // Pass the itemSchema for the primitive type
                    results_1.push(mapSectionToSchema(itemSection, itemSchema_2, itemPath, debug, rootSchema));
                }
            });
            if (results_1.length > 0) {
                if (debug)
                    logger.debug("[Map Path: ".concat(currentPath, "] Returning ").concat(results_1.length, " items from direct list."));
                return results_1;
            }
        }
        // Strategy ②: Look for child sections indicating items (e.g., "### File 1", "### Phase 2")
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] Strategy 2: Looking for item sections matching regex: ").concat(itemHeadingRegex));
        var itemSections = [];
        var itemMatchPath = currentPath + "[".concat(singularKeyName, " items]"); // For logging
        if (debug)
            logger.debug("[ItemMatching Path: ".concat(itemMatchPath, "] Searching in parent section \"").concat(sectionHeadingText, "\" with ").concat(section.children.length, " children."));
        for (var _h = 0, _j = section.children; _h < _j.length; _h++) {
            var childSection = _j[_h];
            if (childSection.heading) {
                var headingText = (0, mdast_util_to_string_1.toString)(childSection.heading);
                // No need to normalize here, regex handles variations
                var match = itemHeadingRegex.test(headingText.trim()); // Test raw heading text
                if (debug)
                    logger.debug("[ItemMatching Path: ".concat(itemMatchPath, "]   - Checking child heading: \"").concat(headingText, "\". Regex match result: ").concat(match));
                if (match) {
                    itemSections.push(childSection);
                }
            }
            else {
                if (debug)
                    logger.debug("[ItemMatching Path: ".concat(itemMatchPath, "]   - Child section has no heading. Skipping."));
            }
        }
        if (itemSections.length > 0) {
            if (debug)
                logger.debug("[Map Path: ".concat(currentPath, "] Strategy 2: Found ").concat(itemSections.length, " item sections based on headings matching '").concat(singularKeyName, " X'."));
            return itemSections.map(function (itemSec, i) {
                var itemPath = __spreadArray(__spreadArray([], path, true), [String(i)], false);
                if (debug)
                    logger.debug("[Map Path: ".concat(itemPath.join('.'), "] Mapping item section ").concat(i, " with heading \"").concat((0, mdast_util_to_string_1.toString)(itemSec.heading), "\"."));
                // Pass the item's section and the itemSchema for recursion
                return mapSectionToSchema(itemSec, itemSchema_2, itemPath, debug, rootSchema);
            });
        }
        // Strategy ③: Thematic breaks (---) separating items (Less likely with new format, but kept)
        var slices = [];
        var currentSlice = [];
        for (var _k = 0, _l = section.nodes; _k < _l.length; _k++) {
            var node = _l[_k];
            if (isThematicBreak(node)) { // Use type guard
                // Only push if the slice has meaningful content (not just whitespace/description)
                var sliceContent = (0, mdast_util_to_string_1.toString)({ type: 'root', children: currentSlice }).trim();
                if (currentSlice.length > 0 && sliceContent !== '' && !sliceContent.startsWith('*Description:')) {
                    slices.push(currentSlice);
                }
                currentSlice = [];
            }
            else {
                currentSlice.push(node);
            }
        }
        var lastSliceContent = (0, mdast_util_to_string_1.toString)({ type: 'root', children: currentSlice }).trim();
        if (currentSlice.length > 0 && lastSliceContent !== '' && !lastSliceContent.startsWith('*Description:')) {
            slices.push(currentSlice);
        }
        if (slices.length > 0) {
            if (debug)
                logger.debug("[Map Path: ".concat(currentPath, "] Strategy 3: Found ").concat(slices.length, " items based on thematic breaks."));
            return slices.map(function (sliceNodes, i) {
                var itemPath = __spreadArray(__spreadArray([], path, true), [String(i)], false);
                var itemSection = { heading: null, nodes: sliceNodes, children: [] };
                if (debug)
                    logger.debug("[Map Path: ".concat(itemPath.join('.'), "] Mapping thematic break slice ").concat(i, "."));
                return mapSectionToSchema(itemSection, itemSchema_2, itemPath, debug, rootSchema);
            });
        }
        // Strategy ④: Primitive Array Fallback (if itemSchema is not Object)
        if (!(itemSchema_2 instanceof zod_1.z.ZodObject)) {
            if (debug)
                logger.debug("[Map Path: ".concat(currentPath, "] Strategy 4: Handling array of primitives fallback."));
            // Extract value considering it might just be lines of text or a list
            var contentString = extractPrimitiveValueFromNodes(section.nodes, { path: currentPath, logger: logger, debug: debug });
            if (!contentString) {
                if (debug)
                    logger.debug("[Map Path: ".concat(currentPath, "] No content found for primitive array. Returning empty array."));
                return [];
            }
            // Split by newline, trim, and filter empty lines
            var lines = contentString.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);
            // Check if it looks like a markdown list
            var looksLikeList = lines.length > 0 && lines.every(function (l) { return /^\s*[-*+]\s/.test(l); });
            if (looksLikeList) {
                if (debug)
                    logger.debug("[Map Path: ".concat(currentPath, "] Parsing primitive array from ").concat(lines.length, " list-like lines."));
                return lines.map(function (ln, i) {
                    var itemPath = __spreadArray(__spreadArray([], path, true), [String(i)], false);
                    var itemContent = ln.replace(/^\s*[-*+]\s+/, '').trim(); // Extract content from list item
                    return convertToPrimitive(itemContent, itemSchema_2, { path: itemPath, logger: logger, debug: debug });
                });
            }
            else if (lines.length > 0) {
                // If not a list, treat each non-empty line as an item (use with caution)
                if (debug)
                    logger.debug("[Map Path: ".concat(currentPath, "] Parsing primitive array by splitting into ").concat(lines.length, " non-empty lines (non-list format)."));
                return lines.map(function (ln, i) {
                    var itemPath = __spreadArray(__spreadArray([], path, true), [String(i)], false);
                    return convertToPrimitive(ln, itemSchema_2, { path: itemPath, logger: logger, debug: debug });
                });
            }
        }
        // Strategy ⑤: Fallback - No items found
        if (debug)
            logger.debug("[Map Path: ".concat(currentPath, "] No array items found using any strategy. Returning empty array."));
        return [];
    }
    /* --- 2c. Primitive Types (and others like Union, Enum) --- */
    if (debug)
        logger.debug("[Map Path: ".concat(currentPath, "] Handling Primitive/Other Schema (").concat(baseSchema.constructor.name, ")."));
    if (debug) {
        // Log nodes more concisely for primitives
        logger.debug("[Map Path: ".concat(currentPath, "] Nodes for primitive extraction:"), section.nodes.map(function (n) { var _a, _b; return ({ type: n.type, value: (_b = (_a = n.value) === null || _a === void 0 ? void 0 : _a.substring(0, 30)) !== null && _b !== void 0 ? _b : (0, mdast_util_to_string_1.toString)(n).substring(0, 30) + '...' }); }));
    }
    // Extract the raw string value from the section's nodes
    var extractedValue = extractPrimitiveValueFromNodes(section.nodes, { path: currentPath, logger: logger, debug: debug });
    if (debug)
        logger.debug("[Map Path: ".concat(currentPath, "] Extracted raw value: \"").concat(extractedValue.substring(0, 100)).concat(extractedValue.length > 100 ? '...' : '', "\""));
    // Convert the extracted string using the *original* schema (which includes wrappers like optional/nullable/default)
    var convertedValue = convertToPrimitive(extractedValue, schema, // Pass the original schema with wrappers
    { path: path, logger: logger, debug: debug });
    if (debug)
        logger.debug("[Map Path: ".concat(currentPath, "] Converted value: ").concat(JSON.stringify(convertedValue)));
    // Final checks (optional, as Zod validation catches most issues)
    // These checks compare the *result* of conversion against the *original* schema's modifiers
    if (convertedValue === undefined && !(schema instanceof zod_1.z.ZodOptional || schema instanceof zod_1.z.ZodDefault)) {
        // It's okay if it's nullable, null might be the intended conversion from empty/missing
        if (!(schema instanceof zod_1.z.ZodNullable)) {
            if (debug)
                logger.warn("[Map Path: ".concat(currentPath, "] CONVERTED UNDEFINED for non-optional/non-default field."));
        }
    }
    if (convertedValue === null && !(schema instanceof zod_1.z.ZodNullable || schema instanceof zod_1.z.ZodDefault)) {
        // It's okay if it's optional, undefined might be the intended conversion
        if (!(schema instanceof zod_1.z.ZodOptional)) {
            if (debug)
                logger.warn("[Map Path: ".concat(currentPath, "] CONVERTED NULL for non-nullable/non-default field."));
        }
    }
    return convertedValue;
}
var markdownPrompt = function (template) { return "\n<OUTPUT FORMAT>\nOutput format: Structured Markdown based schema\n\nPlease fill out the following structure.\n    - Use the headings provided (e.g., `## name`, `#### filePath`) as is. These are schema field names and must not be changed.\n    - Place the value for each field inside triple backticks (```) on the line(s) following the heading.\n    - For arrays (like `files`), use a heading like `### File 1`, `### File 2`, etc., for each item in the list, where \"File\" is the singular form of the array name.\n    - Provide all required fields. Optional sections can be omitted entirely or have an empty code block if explicitly empty.\n    - Ensure the content within the code blocks is raw text/code as appropriate for the field.\n    - Do not include any XML tags in the formatting. This is a pure Markdown format.\n    - Do not include any additional text or explanations outside of the specified format.\n    - All fields are required no matter how trivial unless specified as optional in the schema.\n    \nPlease output your response **strictly** in the custom Markdown-based format with the **exact** structure as the following template **without the `Description` fields**:\n\n".concat(template, "\n\n</OUTPUT FORMAT>\n"); };
exports.TemplateRegistry = {
    markdown: {
        template: formatSchemaAsMarkdown,
        serialize: formatDataAsMarkdown,
        prompt: markdownPrompt,
        parser: parseMarkdownContent,
    },
};
function generateTemplateForSchema(schema, schemaFormat, options) {
    var template = exports.TemplateRegistry[schemaFormat].template(schema, options);
    var formatInstructions = exports.TemplateRegistry[schemaFormat].prompt(template);
    return formatInstructions;
}
function parseContentForSchema(content, schemaFormat, schema, options) {
    var parser = exports.TemplateRegistry[schemaFormat].parser;
    if (!parser) {
        throw new Error("No parser function found for format: ".concat(schemaFormat));
    }
    return parser(content, schema, options);
}
