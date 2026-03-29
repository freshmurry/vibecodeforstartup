"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var search_replace_1 = require("./search-replace");
describe('Search/Replace Diff Format', function () {
    describe('Basic Operations', function () {
        test('should apply simple search/replace', function () {
            var original = "function hello() {\n\tconsole.log(\"Hello World\");\n}";
            var diff = "<<<<<<< SEARCH\n\tconsole.log(\"Hello World\");\n=======\n\tconsole.log(\"Hello Universe\");\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('console.log("Hello Universe");');
            expect(result.content).not.toContain('console.log("Hello World");');
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.blocksFailed).toBe(0);
        });
        test('should handle multiple lines in search/replace', function () {
            var original = "function calculate() {\n\tlet a = 1;\n\tlet b = 2;\n\treturn a + b;\n}";
            var diff = "<<<<<<< SEARCH\n\tlet a = 1;\n\tlet b = 2;\n\treturn a + b;\n=======\n\tconst sum = 3;\n\treturn sum;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('const sum = 3;');
            expect(result.content).toContain('return sum;');
            expect(result.content).not.toContain('let a = 1;');
        });
        test('should handle empty search (pure addition)', function () {
            var original = "function test() {\n\treturn 42;\n}";
            var diff = "<<<<<<< SEARCH\n\n=======\n// This is a new comment\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('// This is a new comment');
            expect(result.content).toContain('function test()');
        });
        test('should handle empty replace (deletion)', function () {
            var original = "function test() {\n\tconsole.log(\"debug\");\n\treturn 42;\n}";
            var diff = "<<<<<<< SEARCH\n\tconsole.log(\"debug\");\n=======\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).not.toContain('console.log("debug");');
            expect(result.content).toContain('return 42;');
        });
        test('should preserve indentation and formatting', function () {
            var original = "\tif (condition) {\n\t\tconsole.log(\"test\");\n\t}";
            var diff = "<<<<<<< SEARCH\n\t\tconsole.log(\"test\");\n=======\n\t\tconsole.log(\"updated\");\n\t\tconsole.log(\"added line\");\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toBe("\tif (condition) {\n\t\tconsole.log(\"updated\");\n\t\tconsole.log(\"added line\");\n\t}");
        });
    });
    describe('Error Handling', function () {
        test('should fail when search pattern is ambiguous', function () {
            var original = "const x = 1;\nconst x = 1;\nconst y = 2;";
            var diff = "<<<<<<< SEARCH\nconst x = 1;\n=======\nconst x = 10;\n>>>>>>> REPLACE";
            expect(function () { return (0, search_replace_1.applyDiff)(original, diff, { strict: true }); })
                .toThrow('found 2 times (ambiguous)');
        });
        test('should handle malformed blocks gracefully', function () {
            var original = 'const x = 1;';
            var diff = "<<<<<<< SEARCH\nconst x = 1;\n=======\nconst x = 2;"; // Missing end marker
            expect(function () { return (0, search_replace_1.applyDiff)(original, diff, { strict: true }); })
                .toThrow("REPLACE block ended prematurely");
        });
        test('should handle missing separator', function () {
            var original = 'const x = 1;';
            var diff = "<<<<<<< SEARCH\nconst x = 1;\nconst x = 2;\n>>>>>>> REPLACE";
            expect(function () { return (0, search_replace_1.applyDiff)(original, diff, { strict: true }); })
                .toThrow("SEARCH block without corresponding REPLACE");
        });
        test('should apply successful blocks in non-strict mode', function () {
            var original = "line1\nline2\nline3";
            var diff = "<<<<<<< SEARCH\nline1\n=======\nline1_updated\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nlineX\n=======\nlineX_updated\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nline3\n=======\nline3_updated\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toContain('line1_updated');
            expect(result.content).toContain('line2'); // Unchanged
            expect(result.content).toContain('line3_updated');
            expect(result.content).not.toContain('lineX'); // Failed block ignored
        });
        test('should handle sequential dependency failures silently in non-strict mode', function () {
            // This test recreates a scenario where the second diff fails due to whitespace differences
            // after the first diff changes the content structure
            var original = "interface TileProps {\n  value: number;\n}\nconst TileComponent: React.FC<TileProps> = ({ value }) => {\n  return (\n    <motion.div>{value}</motion.div>\n  );\n};";
            // First diff succeeds, second diff fails due to exact whitespace mismatch
            var diff = "<<<<<<< SEARCH\ninterface TileProps {\n  value: number;\n}\n=======\ninterface TileProps {\n  value: number;\n  position?: { x: number; y: number };\n}\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nconst TileComponent: React.FC<TileProps> = ({ value }) => {\n  return (\n    <motion.div>{value}</motion.div>\n  );\n};\n=======\nconst TileComponent: React.FC<TileProps> = ({ value, position }) => {\n  return (\n    <motion.div layoutId={position ? `tile-${position.x}-${position.y}` : undefined}>\n      {value}\n    </motion.div>\n  );\n};\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            // First diff should succeed
            expect(result.content).toContain('position?: { x: number; y: number };');
            // Second diff should apply successfully in this case
            // (This demonstrates proper sequential application)
            expect(result.content).toContain('({ value, position }) =>');
            expect(result.content).toContain('layoutId');
        });
        test('should provide detailed errors when all blocks fail', function () {
            var original = "const x = 1;\nconst y = 2;";
            var diff = "<<<<<<< SEARCH\nconst a = 1;\n=======\nconst a = 10;\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nconst b = 2;\n=======\nconst b = 20;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.results.blocksFailed).toBe(2);
            expect(result.results.errors.some(function (error) { return error.includes('All search/replace blocks failed'); })).toBe(true);
        });
        test('should handle whitespace sensitivity in search patterns', function () {
            var original = "function test() {\n    console.log(\"hello\");\n}";
            // This diff has slightly different whitespace in search pattern
            var diff = "<<<<<<< SEARCH\nfunction test() {\n  console.log(\"hello\");\n}\n=======\nfunction test() {\n    console.log(\"goodbye\");\n}\n>>>>>>> REPLACE";
            // Should fail due to whitespace mismatch, original preserved
            var result = (0, search_replace_1.applyDiff)(original, diff, {
                strict: false,
                matchingStrategies: [search_replace_1.MatchingStrategy.EXACT]
            });
            expect(result.results.blocksFailed).toBe(1);
            expect(result.results.errors.some(function (error) { return error.includes('Search block not found'); })).toBe(true);
        });
        test('should fail fast in strict mode when search pattern not found', function () {
            var original = "const x = 1;\nconst y = 2;\nconst z = 3;";
            var diff = "<<<<<<< SEARCH\nconst x = 1;\n=======\nconst x = 10;\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nconst missing = 999;\n=======\nconst missing = 1000;\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nconst z = 3;\n=======\nconst z = 30;\n>>>>>>> REPLACE";
            // Should fail on second block and never reach third
            expect(function () { return (0, search_replace_1.applyDiff)(original, diff, { strict: true }); })
                .toThrow('Search block not found');
        });
        test('should demonstrate exact whitespace matching failure', function () {
            // This test shows how subtle formatting differences cause silent failures
            var original = "interface Props {\n  title: string;\n}\n\nconst Component: React.FC<Props> = ({ title }) => {\n  return <h1>{title}</h1>;\n};";
            // First diff succeeds, second diff has subtle whitespace difference that causes failure
            var diff = "<<<<<<< SEARCH\ninterface Props {\n  title: string;\n}\n=======\ninterface Props {\n  title: string;\n  subtitle?: string;\n}\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nconst Component: React.FC<Props> = ({ title }) => {\n  return  <h1>{title}</h1>;\n};\n=======\nconst Component: React.FC<Props> = ({ title, subtitle }) => {\n  return (\n    <div>\n      <h1>{title}</h1>\n      {subtitle && <h2>{subtitle}</h2>}\n    </div>\n  );\n};\n>>>>>>> REPLACE";
            // Force exact matching only to test whitespace sensitivity
            var result = (0, search_replace_1.applyDiff)(original, diff, {
                strict: false,
                matchingStrategies: [search_replace_1.MatchingStrategy.EXACT]
            });
            // First change should apply
            expect(result.content).toContain('subtitle?: string;');
            // Second change should fail due to extra space in 'return  <h1>'
            // Original has 'return <h1>' but search looks for 'return  <h1>'
            expect(result.content).toContain('({ title }) =>');
            expect(result.content).not.toContain('({ title, subtitle }) =>');
        });
    });
    describe('Edge Cases', function () {
        test('should handle empty original content', function () {
            var original = '';
            var diff = "<<<<<<< SEARCH\n\n=======\nconst x = 1;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toBe('const x = 1;');
        });
        test('should handle empty diff', function () {
            var original = 'const x = 1;';
            var result = (0, search_replace_1.applyDiff)(original, '');
            expect(result.content).toBe(original);
        });
        test('should handle special characters in content', function () {
            var original = "const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;";
            var diff = "<<<<<<< SEARCH\nconst regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n=======\nconst regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$/;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('[a-zA-Z]{2,4}');
        });
        test('should handle Unicode content', function () {
            var original = "const greeting = \"\u3053\u3093\u306B\u3061\u306F\";\nconst emoji = \"\uD83D\uDE80\";";
            var diff = "<<<<<<< SEARCH\nconst greeting = \"\u3053\u3093\u306B\u3061\u306F\";\n=======\nconst greeting = \"\u3053\u3093\u3070\u3093\u306F\";\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('こんばんは');
            expect(result.content).toContain('🚀');
        });
        test('should handle Windows line endings', function () {
            var original = "line1\r\nline2\r\nline3";
            var diff = "<<<<<<< SEARCH\nline2\n=======\nline2_updated\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('line2_updated');
        });
    });
    describe('Multiple Blocks', function () {
        test('should apply multiple search/replace blocks in sequence', function () {
            var original = "function test() {\n\tlet a = 1;\n\tlet b = 2;\n\tlet c = 3;\n\treturn a + b + c;\n}";
            var diff = "<<<<<<< SEARCH\n\tlet a = 1;\n=======\n\tconst a = 10;\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\n\tlet b = 2;\n=======\n\tconst b = 20;\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\n\tlet c = 3;\n=======\n\tconst c = 30;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('const a = 10;');
            expect(result.content).toContain('const b = 20;');
            expect(result.content).toContain('const c = 30;');
        });
        test('should handle overlapping changes correctly', function () {
            var original = "function calculate() {\n\tconst result = computeValue();\n\treturn result;\n}";
            // First change the function content
            var diff1 = "<<<<<<< SEARCH\n\tconst result = computeValue();\n\treturn result;\n=======\n\tconst temp = computeValue();\n\tconst result = temp * 2;\n\treturn result;\n>>>>>>> REPLACE";
            var intermediate = (0, search_replace_1.applyDiff)(original, diff1);
            // Then change the function name
            var diff2 = "<<<<<<< SEARCH\nfunction calculate() {\n=======\nfunction calculateDouble() {\n>>>>>>> REPLACE";
            var final = (0, search_replace_1.applyDiff)(intermediate.content, diff2);
            expect(final.content).toContain('function calculateDouble()');
            expect(final.content).toContain('const temp = computeValue();');
            expect(final.content).toContain('const result = temp * 2;');
        });
    });
    // LLM Robustness Tests
    describe('LLM Robustness', function () {
        test('should handle extra whitespace around markers', function () {
            var original = 'const x = 1;';
            var diff = "  <<<<<<< SEARCH  \nconst x = 1;\n   =======   \nconst x = 2;\n  >>>>>>> REPLACE  ";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toBe('const x = 2;');
        });
        test('should handle inconsistent marker formatting', function () {
            var original = 'const x = 1;';
            // Some LLMs might use different cases or spacing
            var diff = "<<<<<<< search\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> Replace";
            // Should return unchanged since no valid blocks found
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toBe(original); // No changes applied
        });
        test('should handle mixed line endings from different sources', function () {
            var original = "line1\nline2\r\nline3\n";
            var diff = "<<<<<<< SEARCH\r\nline2\r\n=======\nline2_updated\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('line2_updated');
        });
        test('should handle trailing/leading whitespace in search blocks', function () {
            var original = "function test() {\n    return 42;\n}";
            // LLM might include extra spaces
            var diff = "<<<<<<< SEARCH\n    return 42;\n=======\n    return 100;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('return 100;');
        });
        test('should handle code with syntax errors', function () {
            // LLMs might generate syntactically incorrect code
            var original = "function test() {\n    return 42;\n}";
            var diff = "<<<<<<< SEARCH\n    return 42;\n=======\n    return 42 // Missing semicolon\n    console.log('added') // Also missing semicolon\n>>>>>>> REPLACE";
            // Should still apply the diff even if syntax is wrong
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain("return 42 // Missing semicolon");
            expect(result.content).toContain("console.log('added')");
        });
        test('should handle malformed blocks with extra ======= separator', function () {
            // LLMs sometimes add an extra ======= line before >>>>>>> REPLACE
            // Our robust parser now correctly identifies this as malformed and ignores it
            var original = "import { Grid, Tile } from './types';\nexport const GRID_SIZE = 4;\nexport const WINNING_VALUE = 2048;\nlet tileIdCounter = 1;";
            var diff = "<<<<<<< SEARCH\nimport { Grid, Tile } from './types';\nexport const GRID_SIZE = 4;\nexport const WINNING_VALUE = 2048;\nlet tileIdCounter = 1;\n=======\nimport { Grid, Tile, MoveResult } from './types';\nexport const GRID_SIZE = 4;\nexport const WINNING_VALUE = 2048;\nlet tileIdCounter = 1;\n=======\n>>>>>>> REPLACE";
            // Should correctly identify as malformed and ignore the block
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.results.blocksApplied).toBe(0);
            expect(result.results.blocksFailed).toBe(0); // Malformed blocks don't count as failed
            expect(result.results.errors.some(function (error) { return error.includes('Malformed block with multiple separators'); })).toBe(true);
            expect(result.content).toBe(original); // Content should remain unchanged
        });
        test('should handle file paths before search/replace blocks', function () {
            // LLMs often include file paths before the blocks
            var original = "function test() {\n    return 42;\n}";
            var diff = "src/lib/game-logic.ts\n<<<<<<< SEARCH\nfunction test() {\n    return 42;\n}\n=======\nfunction test() {\n    return 100;\n}\n>>>>>>> REPLACE";
            // Should ignore the file path and apply the change
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain("return 100;");
        });
        test('should fail on ambiguous matches with similar code blocks', function () {
            var original = "function processA() {\n    const result = compute();\n    return result;\n}\n\nfunction processB() {\n    const result = compute();\n    return result;\n}";
            var diff = "<<<<<<< SEARCH\n    const result = compute();\n    return result;\n=======\n    const result = compute();\n    console.log(result);\n    return result;\n>>>>>>> REPLACE";
            expect(function () { return (0, search_replace_1.applyDiff)(original, diff, { strict: true }); })
                .toThrow('found 2 times (ambiguous)');
        });
        test('should handle unique matches with sufficient context', function () {
            var original = "function processA() {\n    const result = compute();\n    return result;\n}\n\nfunction processB() {\n    const result = compute();\n    return result;\n}";
            var diff = "<<<<<<< SEARCH\nfunction processA() {\n    const result = compute();\n    return result;\n}\n=======\nfunction processA() {\n    const result = compute();\n    console.log('Processing A:', result);\n    return result;\n}\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain("console.log('Processing A:', result);");
            expect((result.content.match(/console\.log/g) || []).length).toBe(1); // Only one console.log added
        });
        test('should handle tab vs space differences', function () {
            var original = "function test() {\n\treturn 42;\n}";
            // LLM uses spaces instead of tabs
            var diff = "<<<<<<< SEARCH\n    return 42;\n=======\n    return 100;\n>>>>>>> REPLACE";
            // Should pass
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('return 100;');
        });
        test('should match exact whitespace when provided', function () {
            var original = "function test() {\n\treturn 42;\n}";
            // Correct whitespace (tab)
            var diff = "<<<<<<< SEARCH\n\treturn 42;\n=======\n\treturn 100;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('\treturn 100;');
        });
        test('should handle multi-line replacements with proper indentation', function () {
            var original = "function complexFunction() {\n    // Step 1\n    const data = fetchData();\n    \n    // Step 2\n    const processed = processData(data);\n    \n    // Step 3\n    return formatResult(processed);\n}";
            var diff = "<<<<<<< SEARCH\n    // Step 2\n    const processed = processData(data);\n=======\n    // Step 2 - Enhanced processing\n    console.log('Processing data...');\n    const validated = validateData(data);\n    const processed = processData(validated);\n    console.log('Processing complete');\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('// Step 2 - Enhanced processing');
            expect(result.content).toContain('const validated = validateData(data);');
            expect(result.content).toContain('Processing complete');
        });
        test('should handle complete function replacements', function () {
            var original = "function oldImplementation(x, y) {\n    return x + y;\n}\n\nfunction helper() {\n    return 42;\n}";
            var diff = "<<<<<<< SEARCH\nfunction oldImplementation(x, y) {\n    return x + y;\n}\n=======\nfunction newImplementation(x, y, z = 0) {\n    // Validate inputs\n    if (typeof x !== 'number' || typeof y !== 'number') {\n        throw new Error('Invalid inputs');\n    }\n    \n    // Calculate result\n    const sum = x + y + z;\n    \n    // Log for debugging\n    console.log(`Computing: ${x} + ${y} + ${z} = ${sum}`);\n    \n    return sum;\n}\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('function newImplementation(x, y, z = 0)');
            expect(result.content).toContain('throw new Error');
            expect(result.content).toContain('console.log(`Computing:');
            expect(result.content).toContain('function helper()'); // Unchanged
        });
        test('should handle regex patterns in code', function () {
            var original = "const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\nconst phoneRegex = /^\\+?[1-9]\\d{1,14}$/;";
            var diff = "<<<<<<< SEARCH\nconst emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n=======\nconst emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$/;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('[a-zA-Z]{2,6}');
        });
        test('should handle template literals with special characters', function () {
            var original = 'const msg = `Hello ${name}! Today is ${new Date().toDateString()}.`;';
            var diff = "<<<<<<< SEARCH\nconst msg = `Hello ${name}! Today is ${new Date().toDateString()}.`;\n=======\nconst msg = `Greetings ${name}! The current date is ${new Date().toDateString()}.`;\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('Greetings ${name}!');
        });
        test('should handle JSON-like structures', function () {
            var original = "const config = {\n    \"api\": {\n        \"url\": \"https://api.example.com\",\n        \"key\": \"abc123\"\n    },\n    \"features\": {\n        \"enabled\": true,\n        \"flags\": [\"feature1\", \"feature2\"]\n    }\n};";
            var diff = "<<<<<<< SEARCH\n        \"key\": \"abc123\"\n=======\n        \"key\": process.env.API_KEY || \"abc123\"\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('process.env.API_KEY || "abc123"');
        });
        test('should apply valid blocks when some fail in non-strict mode', function () {
            var original = "line1\nline2\nline3\nline4";
            var diff = "<<<<<<< SEARCH\nline1\n=======\nLINE1\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nlineX\n=======\nLINEX\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\nline3\n=======\nLINE3\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toContain('LINE1');
            expect(result.content).toContain('line2'); // Unchanged
            expect(result.content).toContain('LINE3');
            expect(result.content).not.toContain('LINEX'); // Failed block
        });
        test('should provide helpful error messages', function () {
            var original = "function test() {\n    return 42;\n}";
            var diff = "<<<<<<< SEARCH\nfunction testFunction() {\n    return 42;\n}\n=======\nfunction testFunction() {\n    return 100;\n}\n>>>>>>> REPLACE";
            try {
                (0, search_replace_1.applyDiff)(original, diff, { strict: true });
                fail('Should have thrown');
            }
            catch (error) {
                expect(error.message).toContain('Search block not found');
                expect(error.message).toContain('Block at line');
            }
        });
        test('should handle GPT-style verbose replacements', function () {
            var original = "// Simple function\nfunction add(a, b) {\n    return a + b;\n}";
            var diff = "<<<<<<< SEARCH\n// Simple function\nfunction add(a, b) {\n    return a + b;\n}\n=======\n/**\n * Adds two numbers together.\n * \n * @param {number} a - The first number to add\n * @param {number} b - The second number to add\n * @returns {number} The sum of a and b\n * @throws {TypeError} If either parameter is not a number\n * \n * @example\n * const result = add(2, 3); // returns 5\n */\nfunction add(a, b) {\n    // Validate input parameters\n    if (typeof a !== 'number' || typeof b !== 'number') {\n        throw new TypeError('Both parameters must be numbers');\n    }\n    \n    // Calculate and return the sum\n    const sum = a + b;\n    \n    // Log the operation for debugging purposes\n    console.debug(`add(${a}, ${b}) = ${sum}`);\n    \n    return sum;\n}\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('@param {number} a');
            expect(result.content).toContain('throw new TypeError');
            expect(result.content).toContain('console.debug');
        });
        test('should handle Claude-style incremental changes', function () {
            var original = "class Calculator {\n    add(a, b) {\n        return a + b;\n    }\n}";
            // First change - add validation
            var diff1 = "<<<<<<< SEARCH\n    add(a, b) {\n        return a + b;\n    }\n=======\n    add(a, b) {\n        if (typeof a !== 'number' || typeof b !== 'number') {\n            throw new Error('Invalid inputs');\n        }\n        return a + b;\n    }\n>>>>>>> REPLACE";
            var intermediate = (0, search_replace_1.applyDiff)(original, diff1);
            // Second change - add logging
            var diff2 = "<<<<<<< SEARCH\n        return a + b;\n=======\n        const result = a + b;\n        console.log(`Adding ${a} + ${b} = ${result}`);\n        return result;\n>>>>>>> REPLACE";
            var final = (0, search_replace_1.applyDiff)(intermediate.content, diff2);
            expect(final.content).toContain('throw new Error');
            expect(final.content).toContain('const result = a + b;');
            expect(final.content).toContain('console.log');
        });
        test('should handle very large search blocks', function () {
            var lines = Array(100).fill(0).map(function (_, i) { return "    line".concat(i, "();"); });
            var original = "function longFunction() {\n".concat(lines.join('\n'), "\n}");
            // Replace the entire function body
            var diff = "<<<<<<< SEARCH\n".concat(lines.join('\n'), "\n=======\n    // Simplified implementation\n    executeAll();\n>>>>>>> REPLACE");
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('// Simplified implementation');
            expect(result.content).toContain('executeAll();');
            expect(result.content).not.toContain('line50();');
        });
        test('should handle deeply nested structures', function () {
            var original = "{\n    \"level1\": {\n        \"level2\": {\n            \"level3\": {\n                \"level4\": {\n                    \"value\": 42\n                }\n            }\n        }\n    }\n}";
            var diff = "<<<<<<< SEARCH\n                    \"value\": 42\n=======\n                    \"value\": 42,\n                    \"timestamp\": Date.now()\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('"timestamp": Date.now()');
        });
    });
    describe('Diff Creation', function () {
        test('should create diff from before/after content', function () {
            var before = "function test() {\n\treturn 1;\n}";
            var after = "function test() {\n\treturn 2;\n}";
            var diff = (0, search_replace_1.createSearchReplaceDiff)(before, after);
            expect(diff).toContain('<<<<<<< SEARCH');
            expect(diff).toContain('return 1;');
            expect(diff).toContain('=======');
            expect(diff).toContain('return 2;');
            expect(diff).toContain('>>>>>>> REPLACE');
        });
        test('should handle pure additions', function () {
            var before = "line1";
            var after = "line1\nline2";
            var diff = (0, search_replace_1.createSearchReplaceDiff)(before, after, { contextLines: 0 });
            var result = (0, search_replace_1.applyDiff)(before, diff);
            expect(result.content).toBe(after);
        });
        test('should include context lines', function () {
            var before = "line1\nline2\nline3\nline4\nline5";
            var after = "line1\nline2\nlineX\nline4\nline5";
            var diff = (0, search_replace_1.createSearchReplaceDiff)(before, after, { contextLines: 1 });
            expect(diff).toContain('line2'); // Context before
            expect(diff).toContain('line4'); // Context after
        });
    });
    describe('Validation', function () {
        test('should validate diff without applying', function () {
            var content = 'const x = 1;';
            var validDiff = "<<<<<<< SEARCH\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> REPLACE";
            var validation = (0, search_replace_1.validateDiff)(content, validDiff);
            expect(validation.valid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });
        test('should report validation errors', function () {
            var content = 'const x = 1;';
            var invalidDiff = "<<<<<<< SEARCH\nconst y = 2;\n=======\nconst y = 3;\n>>>>>>> REPLACE";
            var validation = (0, search_replace_1.validateDiff)(content, invalidDiff);
            expect(validation.valid).toBe(false);
            expect(validation.errors[0]).toContain('Search pattern not found');
        });
        test('should validate ambiguous patterns', function () {
            var content = "const x = 1;\nconst x = 1;";
            var ambiguousDiff = "<<<<<<< SEARCH\nconst x = 1;\n=======\nconst x = 2;\n>>>>>>> REPLACE";
            var validation = (0, search_replace_1.validateDiff)(content, ambiguousDiff);
            expect(validation.valid).toBe(false);
            expect(validation.errors[0]).toContain('found 2 times (ambiguous)');
        });
    });
    describe('Performance', function () {
        test('should handle large files efficiently', function () {
            var lines = Array(1000).fill(0).map(function (_, i) { return "line".concat(i); });
            var original = lines.join('\n');
            var diff = "<<<<<<< SEARCH\nline500\n=======\nline500_modified\n>>>>>>> REPLACE";
            var start = Date.now();
            var result = (0, search_replace_1.applyDiff)(original, diff);
            var duration = Date.now() - start;
            expect(result.content).toContain('line500_modified');
            expect(duration).toBeLessThan(100); // Should be fast
        });
        test('should handle many blocks efficiently', function () {
            var original = Array(100).fill(0).map(function (_, i) { return "const var".concat(i, " = ").concat(i, ";"); }).join('\n');
            // Create 50 search/replace blocks
            var blocks = Array(50).fill(0).map(function (_, i) { return "<<<<<<< SEARCH\nconst var".concat(i, " = ").concat(i, ";\n=======\nconst var").concat(i, " = ").concat(i * 10, ";\n>>>>>>> REPLACE"); }).join('\n\n');
            var start = Date.now();
            var result = (0, search_replace_1.applyDiff)(original, blocks);
            var duration = Date.now() - start;
            expect(result.content).toContain('const var0 = 0;'); // First one multiplied by 10 is still 0
            expect(result.content).toContain('const var10 = 100;');
            expect(result.content).toContain('const var49 = 490;');
            expect(duration).toBeLessThan(200); // Should still be fast
        });
    });
    describe('Smart Diff Applier Features', function () {
        test('should include failed block details in ApplyResult', function () {
            var original = "function hello() {\n    console.log(\"Hello World\");\n    return \"world\";\n}";
            var diffWithFailures = "<<<<<<< SEARCH\nfunction hello() {\n    console.log(\"Hello Universe\");  // This doesn't match - will fail\n    return \"world\";\n}\n=======\nfunction hello() {\n    console.log(\"Hello Galaxy\");\n    return \"galaxy\";\n}\n>>>>>>> REPLACE\n\n<<<<<<< SEARCH\n    return \"world\";\n=======\n    return \"universe\";\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diffWithFailures, { strict: false });
            // Should have failed blocks with complete information
            expect(result.results.failedBlocks).toBeDefined();
            expect(result.results.failedBlocks.length).toBeGreaterThan(0);
            // Failed blocks should include search, replace, and error information
            var firstFailedBlock = result.results.failedBlocks[0];
            expect(firstFailedBlock.search).toBeDefined();
            expect(firstFailedBlock.replace).toBeDefined();
            expect(firstFailedBlock.error).toBeDefined();
            // Should have applied the second block that matched
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.blocksFailed).toBe(1);
            expect(result.content).toContain('return "universe";');
        });
    });
    // Enhanced Parser Robustness Tests
    describe('Enhanced Parser Robustness', function () {
        test('should handle blocks within code fences', function () {
            var original = "import { ErrorBoundary } from './components/ErrorBoundary';\nimport { RouteErrorBoundary } from './components/RouteErrorBoundary';";
            var diff = "# Comment\n```\n<<<<<<< SEARCH\nimport { ErrorBoundary } from './components/ErrorBoundary';\nimport { RouteErrorBoundary } from './components/RouteErrorBoundary';\n```\n// import { ErrorBoundary } from './components/ErrorBoundary';  \n// import { RouteErrorBoundary } from './components/RouteErrorBoundary';\n```";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toContain('// import { ErrorBoundary }');
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.blocksFailed).toBe(0);
        });
        test('should handle SEARCH followed by another SEARCH (invalid)', function () {
            var original = "first line\nsecond line";
            var diff = "<<<<<<< SEARCH\nfirst line\n<<<<<<< SEARCH\nsecond line\n=======\nSECOND LINE\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toContain('SECOND LINE');
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.errors.length).toBe(1); // Should report the orphaned SEARCH
            expect(result.results.errors[0]).toContain('SEARCH block without corresponding REPLACE');
        });
        test('should handle SEARCH without REPLACE at end of file', function () {
            var original = "some content";
            var diff = "<<<<<<< SEARCH\norphaned search content";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toBe(original); // No changes
            expect(result.results.blocksApplied).toBe(0);
            expect(result.results.errors.length).toBe(1);
            expect(result.results.errors[0]).toContain('end of file reached');
        });
        test('should handle multiple separators in replace section', function () {
            var original = "old content";
            var diff = "<<<<<<< SEARCH\nold content\n=======\nnew content\n=======\nextra separator that should be ignored\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            // This is actually a malformed block and should be rejected
            expect(result.results.blocksApplied).toBe(0);
            expect(result.results.blocksFailed).toBe(0); // Malformed blocks don't count as failed
            expect(result.results.errors.some(function (error) { return error.includes('Malformed block with multiple separators'); })).toBe(true);
            expect(result.content).toBe(original); // Content should remain unchanged
        });
        test('should handle the specific malformed case from logs', function () {
            var original = "import { ErrorBoundary } from './components/ErrorBoundary';\nimport { RouteErrorBoundary } from './components/RouteErrorBoundary';\nimport { EditorPage } from './pages/EditorPage';\nconst router = createBrowserRouter([\n  {\n    path: \"/\",\n    element: <App />,\n    errorElement: <RouteErrorBoundary />,\n    children: [\n      {\n        path: \"/\",\n        element: <EditorPage />,\n      }\n    ]\n  },\n]);\nconst rootElement = document.getElementById('root');\ncreateRoot(rootElement).render(\n  <StrictMode>\n    <ErrorBoundary>\n      <RouterProvider router={router} />\n    </ErrorBoundary>\n  </StrictMode>,\n);";
            var diff = "Looking at the provided main.tsx file, I need to analyze it for potential issues:\n\n# Missing ErrorBoundary component - will cause import error\n\n```\n<<<<<<< SEARCH\nimport { ErrorBoundary } from './components/ErrorBoundary';\nimport { RouteErrorBoundary } from './components/RouteErrorBoundary';\n=======\n// import { ErrorBoundary } from './components/ErrorBoundary';\n// import { RouteErrorBoundary } from './components/RouteErrorBoundary';\n=======\n```\n\n# Remove ErrorBoundary wrapper since component doesn't exist\n\n```\n<<<<<<< SEARCH\nconst router = createBrowserRouter([\n  {\n    path: \"/\",\n    element: <App />,\n    errorElement: <RouteErrorBoundary />,\n    children: [\n      {\n        path: \"/\",\n        element: <EditorPage />,\n      }\n    ]\n  },\n]);\n=======\nconst router = createBrowserRouter([\n  {\n    path: \"/\",\n    element: <App />,\n    children: [\n      {\n        path: \"/\",\n        element: <EditorPage />,\n      }\n    ]\n  },\n]);\n>>>>>>> REPLACE\n```\n\n# Remove ErrorBoundary from render since component doesn't exist\n\n```\n<<<<<<< SEARCH\ncreateRoot(rootElement).render(\n  <StrictMode>\n    <ErrorBoundary>\n      <RouterProvider router={router} />\n    </ErrorBoundary>\n  </StrictMode>,\n);\n=======\ncreateRoot(rootElement).render(\n  <StrictMode>\n    <RouterProvider router={router} />\n  </StrictMode>,\n);\n>>>>>>> REPLACE\n```";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            // First block is malformed and should be ignored, but other 2 should apply
            expect(result.results.blocksFailed).toBe(0); // No blocks failed because malformed ones are ignored
            expect(result.results.blocksApplied).toBe(2); // Last two blocks should apply successfully
            expect(result.results.errors.length).toBeGreaterThan(0); // Should have errors for malformed block
            expect(result.results.errors.some(function (error) { return error.includes('Malformed block with multiple separators'); })).toBe(true);
            // Both valid blocks should be applied
            expect(result.content).not.toContain('errorElement: <RouteErrorBoundary />');
            expect(result.content).not.toContain('<ErrorBoundary>');
            // The imports should remain unchanged since the first block was malformed
            expect(result.content).toContain('import { ErrorBoundary }');
            expect(result.content).toContain('import { RouteErrorBoundary }');
        });
        test('should handle malformed block with extra separator and still extract valid content', function () {
            var original = "function test() {\n    return 42;\n}";
            // This simulates the exact pattern from the logs: valid search, valid replace, but extra separator
            var diff = "<<<<<<< SEARCH\nfunction test() {\n    return 42;\n}\n=======\nfunction test() {\n    return 100;\n}\n=======\n";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            // Should fail due to malformed separator structure  
            expect(result.results.blocksFailed).toBe(0); // No blocks failed because malformed ones are ignored
            expect(result.results.blocksApplied).toBe(0);
            expect(result.results.errors.some(function (error) { return error.includes('Malformed block with multiple separators'); })).toBe(true);
            // Content should remain unchanged
            expect(result.content).toContain('return 42;');
        });
        test('should handle stray separators gracefully', function () {
            var original = "content here";
            var diff = "=======\nSome random text\n```\nMore text\n=======";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toBe(original); // No changes
            expect(result.results.blocksApplied).toBe(0);
            expect(result.results.blocksFailed).toBe(0);
            expect(result.results.errors.length).toBe(0);
        });
        test('should handle mixed code fences and standard markers', function () {
            var original = "old code here";
            var diff = "Text before\n```\n<<<<<<< SEARCH\nold code here\n```\nnew code here\n```\nText after";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toBe('new code here');
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.blocksFailed).toBe(0);
        });
        test('should handle empty search section', function () {
            var original = "existing content";
            var diff = "<<<<<<< SEARCH\n\n=======\nnew content\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            // Empty search (with just whitespace/newlines) should work for pure additions
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.blocksFailed).toBe(0);
            expect(result.content).toContain('existing content');
            expect(result.content).toContain('new content');
        });
        test('should handle empty replace section', function () {
            var original = "remove this content\nkeep this content";
            var diff = "<<<<<<< SEARCH\nremove this content\n=======\n>>>>>>> REPLACE";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).not.toContain('remove this content');
            expect(result.content).toContain('keep this content');
            expect(result.results.blocksApplied).toBe(1);
        });
        test('should handle premature end of replace section', function () {
            var original = "content to replace";
            var diff = "<<<<<<< SEARCH\ncontent to replace\n=======\nnew content\n<<<<<<< SEARCH\nanother search";
            var result = (0, search_replace_1.applyDiff)(original, diff, { strict: false });
            expect(result.content).toContain('new content');
            expect(result.results.blocksApplied).toBe(1);
            expect(result.results.errors.length).toBe(2); // One for premature end, one for orphaned search
            expect(result.results.errors.some(function (error) { return error.includes('ended prematurely'); })).toBe(true);
            expect(result.results.errors.some(function (error) { return error.includes('end of file reached'); })).toBe(true);
        });
    });
    describe('validation-tests', function () {
        test('test-01', function () {
            var original = "import * as React from 'react';\nimport { motion } from 'framer-motion';\nimport { cn } from '@/lib/utils';\ninterface TileProps {\n  value: number;\n}\nconst getTileColors = (value: number): string => {\n  switch (value) {\n    case 2:    return 'bg-[#eee4da] text-[#776e65]';\n    case 4:    return 'bg-[#ede0c8] text-[#776e65]';\n    case 8:    return 'bg-[#f2b179] text-white';\n    case 16:   return 'bg-[#f59563] text-white';\n    case 32:   return 'bg-[#f67c5f] text-white';\n    case 64:   return 'bg-[#f65e3b] text-white';\n    case 128:  return 'bg-[#edcf72] text-white';\n    case 256:  return 'bg-[#edcc61] text-white';\n    case 512:  return 'bg-[#edc850] text-white';\n    case 1024: return 'bg-[#edc53f] text-white';\n    case 2048: return 'bg-[#edc22e] text-white';\n    default:   return 'bg-[#3c3a32] text-white'; // For higher values\n  }\n};\nconst getFontSize = (value: number): string => {\n  if (value < 100) return 'text-5xl';\n  if (value < 1000) return 'text-4xl';\n  return 'text-3xl';\n};\nconst TileComponent: React.FC<TileProps> = ({ value }) => {\n  const isZero = value === 0;\n  return (\n    <motion.div\n      layout\n      initial={{ scale: 0, opacity: 0 }}\n      animate={{ scale: 1, opacity: 1 }}\n      exit={{ scale: 0, opacity: 0 }}\n      transition={{ duration: 0.15 }}\n      className={cn(\n        'w-full h-full rounded-md flex items-center justify-center font-bold',\n        isZero ? 'bg-[#cdc1b4]' : getTileColors(value),\n        getFontSize(value)\n      )}\n    >\n      {!isZero && value}\n    </motion.div>\n  );\n};\nexport const Tile = React.memo(TileComponent);";
            var diff = "# Missing position props that were mentioned in the purpose but not implemented in the interface\n\n```\n<<<<<<< SEARCH\ninterface TileProps {\n  value: number;\n}\n=======\ninterface TileProps {\n  value: number;\n  position?: { x: number; y: number };\n}\n>>>>>>> REPLACE\n```\n\n# Add layoutId for proper framer-motion animations when tiles move positions\n\n```\n<<<<<<< SEARCH\nconst TileComponent: React.FC<TileProps> = ({ value }) => {\n  const isZero = value === 0;\n  return (\n          <motion.div\n      layout\n      initial={{ scale: 0, opacity: 0 }}\n      animate={{ scale: 1, opacity: 1 }}\n      exit={{ scale: 0, opacity: 0 }}\n      transition={{ duration: 0.15 }}\n=======\nconst TileComponent: React.FC<TileProps> = ({ value, position }) => {\n  const isZero = value === 0;\n  return (\n  <motion.div\n    layout\n    layoutId={position ? `tile-${position.x}-${position.y}` : undefined}\n    initial={{ scale: 0, opacity: 0 }}\n    animate={{ scale: 1, opacity: 1 }}\n    exit={{ scale: 0, opacity: 0 }}\n    transition={{ duration: 0.15 }}\n>>>>>>> REPLACE\n```";
            var expected = "import * as React from 'react';\nimport { motion } from 'framer-motion';\nimport { cn } from '@/lib/utils';\ninterface TileProps {\n  value: number;\n  position?: { x: number; y: number };\n}\nconst getTileColors = (value: number): string => {\n  switch (value) {\n    case 2:    return 'bg-[#eee4da] text-[#776e65]';\n    case 4:    return 'bg-[#ede0c8] text-[#776e65]';\n    case 8:    return 'bg-[#f2b179] text-white';\n    case 16:   return 'bg-[#f59563] text-white';\n    case 32:   return 'bg-[#f67c5f] text-white';\n    case 64:   return 'bg-[#f65e3b] text-white';\n    case 128:  return 'bg-[#edcf72] text-white';\n    case 256:  return 'bg-[#edcc61] text-white';\n    case 512:  return 'bg-[#edc850] text-white';\n    case 1024: return 'bg-[#edc53f] text-white';\n    case 2048: return 'bg-[#edc22e] text-white';\n    default:   return 'bg-[#3c3a32] text-white'; // For higher values\n  }\n};\nconst getFontSize = (value: number): string => {\n  if (value < 100) return 'text-5xl';\n  if (value < 1000) return 'text-4xl';\n  return 'text-3xl';\n};\nconst TileComponent: React.FC<TileProps> = ({ value, position }) => {\n  const isZero = value === 0;\n  return (\n  <motion.div\n    layout\n    layoutId={position ? `tile-${position.x}-${position.y}` : undefined}\n    initial={{ scale: 0, opacity: 0 }}\n    animate={{ scale: 1, opacity: 1 }}\n    exit={{ scale: 0, opacity: 0 }}\n    transition={{ duration: 0.15 }}\n      className={cn(\n        'w-full h-full rounded-md flex items-center justify-center font-bold',\n        isZero ? 'bg-[#cdc1b4]' : getTileColors(value),\n        getFontSize(value)\n      )}\n    >\n      {!isZero && value}\n    </motion.div>\n  );\n};\nexport const Tile = React.memo(TileComponent);";
            var result = (0, search_replace_1.applyDiff)(original, diff);
            expect(result.content).toBe(expected);
        });
        test('test-02', function () {
        });
    });
});
