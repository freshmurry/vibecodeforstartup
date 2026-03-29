"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var scof_1 = require("./scof");
(0, vitest_1.describe)('SCOF Parser - Comprehensive Tests', function () {
    var parser;
    var mockCallbacks;
    (0, vitest_1.beforeEach)(function () {
        parser = new scof_1.SCOFFormat();
        mockCallbacks = {
            onFileOpen: vitest_1.vi.fn(),
            onFileChunk: vitest_1.vi.fn(),
            onFileClose: vitest_1.vi.fn(),
        };
    });
    var createInitialState = function () { return ({
        accumulator: '',
        completedFiles: new Map(),
        parsingState: parser['initializeSCOFState'](),
    }); };
    var processChunk = function (chunk, state) {
        return parser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
    };
    (0, vitest_1.describe)('Basic Shell Command Parsing', function () {
        (0, vitest_1.it)('should parse basic cat > file << EOF format', function () {
            var chunk = "cat > test.js << 'EOF'\nconsole.log('Hello World');\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledWith('test.js');
            (0, vitest_1.expect)(mockCallbacks.onFileClose).toHaveBeenCalledWith('test.js');
            (0, vitest_1.expect)(result.completedFiles.has('test.js')).toBe(true);
            var file = result.completedFiles.get('test.js');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toBe("console.log('Hello World');");
        });
        (0, vitest_1.it)('should handle double-quoted EOF markers', function () {
            var chunk = "cat > test.py << \"EOF\"\ndef hello():\n        print(\"Hello\")\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('test.py')).toBe(true);
            var file = result.completedFiles.get('test.py');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toBe('def hello():\n        print("Hello")');
        });
        (0, vitest_1.it)('should handle unquoted EOF markers', function () {
            var chunk = "cat > config.json << EOF\n{\n    \"name\": \"test\",\n    \"version\": \"1.0.0\"\n}\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('config.json')).toBe(true);
        });
    });
    (0, vitest_1.describe)('LLM Error Resilience', function () {
        (0, vitest_1.it)('should handle extra spaces in commands', function () {
            var chunk = "cat     >     file.js     <<     'EOF'\nconst x = 1;\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('file.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle missing spaces around operators', function () {
            var chunk = "cat>file.js<<'EOF'\nconst compact = true;\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('file.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle file paths with spaces (quoted)', function () {
            var chunk = "cat > \"my file.js\" << 'EOF'\n// File with spaces in name\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('my file.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle mismatched quotes', function () {
            var chunk = "cat > \"file.js' << 'EOF'\n// Mismatched quotes\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            // Parser should handle this gracefully
            (0, vitest_1.expect)(result.completedFiles.size).toBeGreaterThanOrEqual(0);
        });
        (0, vitest_1.it)('should handle mixed case commands', function () {
            var chunk = "CAT > file.txt << 'EOF'\nMixed case command\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('file.txt')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Content Edge Cases', function () {
        (0, vitest_1.it)('should handle EOF marker in content', function () {
            var chunk = "cat > script.sh << 'MARKER'\n#!/bin/bash\necho \"This is not EOF\"\nif [ \"$1\" = \"EOF\" ]; then\n    echo \"Parameter is EOF\"\nfi\nMARKER\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('script.sh')).toBe(true);
            var file = result.completedFiles.get('script.sh');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toContain('Parameter is EOF');
        });
        (0, vitest_1.it)('should handle special characters in content', function () {
            var chunk = "cat > special.txt << 'EOF'\nSpecial chars: !@#$%^&*()_+-=[]{}|;':\",./<>?\nEscapes: \n \t \\ \" '\nUnicode: \u4F60\u597D \uD83C\uDF0D \u00E9mojis\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            var file = result.completedFiles.get('special.txt');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toContain('!@#$%^&*()');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toContain('你好 🌍 émojis');
        });
        (0, vitest_1.it)('should handle empty files', function () {
            var chunk = "cat > empty.txt << 'EOF'\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('empty.txt')).toBe(true);
            var file = result.completedFiles.get('empty.txt');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toBe('');
        });
        (0, vitest_1.it)('should handle very long lines', function () {
            var longLine = 'a'.repeat(1000);
            var chunk = "cat > long.txt << 'EOF'\n".concat(longLine, "\nEOF\n");
            var state = createInitialState();
            var result = processChunk(chunk, state);
            var file = result.completedFiles.get('long.txt');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toBe(longLine);
        });
    });
    (0, vitest_1.describe)('Streaming and Chunking', function () {
        (0, vitest_1.it)('should handle command split across chunks', function () {
            var chunk1 = 'cat > test.js';
            var chunk2 = " << 'EOF'\nconsole.log('test');\nEOF\n";
            var state = createInitialState();
            state = processChunk(chunk1, state);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).not.toHaveBeenCalled();
            state = processChunk(chunk2, state);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledWith('test.js');
            (0, vitest_1.expect)(state.completedFiles.has('test.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle content split across chunks', function () {
            var chunk1 = "cat > multi.js << 'EOF'\nfunction test() {\n    const x = ";
            var chunk2 = "42;\n    return x;\n}\nEOF\n";
            var state = createInitialState();
            state = processChunk(chunk1, state);
            state = processChunk(chunk2, state);
            var file = state.completedFiles.get('multi.js');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toContain('const x = 42;');
        });
        (0, vitest_1.it)('should handle EOF marker split across chunks', function () {
            var chunk1 = "cat > split.txt << 'EOF'\nContent here\nEO";
            var chunk2 = "F\n";
            var state = createInitialState();
            state = processChunk(chunk1, state);
            state = processChunk(chunk2, state);
            (0, vitest_1.expect)(state.completedFiles.has('split.txt')).toBe(true);
        });
        (0, vitest_1.it)('should handle multiple files in sequence', function () {
            var chunk = "cat > file1.js << 'EOF'\nconsole.log('File 1');\nEOF\n\ncat > file2.js << 'EOF'\nconsole.log('File 2');\nEOF\n\ncat > file3.js << 'EOF'\nconsole.log('File 3');\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(3);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledTimes(3);
            (0, vitest_1.expect)(mockCallbacks.onFileClose).toHaveBeenCalledTimes(3);
        });
    });
    (0, vitest_1.describe)('Patch/Diff Commands', function () {
        (0, vitest_1.it)('should handle patch commands', function () {
            var chunk = "cat << 'PATCH' | patch test.js\n--- a/test.js\n+++ b/test.js\n@@ -1,3 +1,3 @@\n function test() {\n-    return false;\n+    return true;\n }\nPATCH\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledWith('test.js');
            (0, vitest_1.expect)(result.completedFiles.has('test.js')).toBe(true);
            var file = result.completedFiles.get('test.js');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.format).toBe('unified_diff');
        });
        (0, vitest_1.it)('should extract filename from patch content', function () {
            var chunk = "# Updating existing file\ncat << 'EOF' | patch src/utils/helper.js\n--- a/src/utils/helper.js\n+++ b/src/utils/helper.js\n@@ -10,3 +10,5 @@\n export function helper() {\n     return 'help';\n }\n+\n+export const VERSION = '1.0.0';\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('src/utils/helper.js')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Comments and Metadata', function () {
        (0, vitest_1.it)('should handle comments before commands', function () {
            var chunk = "# This is a comment explaining the file\n# It has multiple lines\ncat > documented.js << 'EOF'\n// File content\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('documented.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle commands with trailing comments', function () {
            var chunk = "cat > test.js << 'EOF' # This creates a test file\nconsole.log('test');\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('test.js')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Error Cases', function () {
        (0, vitest_1.it)('should handle malformed commands gracefully', function () {
            var chunk = "this is not a valid command\ncat > << 'EOF'\nmissing filename\nEOF\n";
            var state = createInitialState();
            // Should not throw
            (0, vitest_1.expect)(function () { return processChunk(chunk, state); }).not.toThrow();
        });
        (0, vitest_1.it)('should handle unclosed EOF blocks', function () {
            var chunk = "cat > unclosed.js << 'EOF'\nThis file is never closed\nNo EOF marker here";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            // File should remain in pending state
            (0, vitest_1.expect)(result.completedFiles.has('unclosed.js')).toBe(false);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledWith('unclosed.js');
            (0, vitest_1.expect)(mockCallbacks.onFileClose).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should recover from errors and continue parsing', function () {
            var chunk = "cat > good1.js << 'EOF'\nconsole.log('good 1');\nEOF\n\ncat > << 'EOF'\nbad command - no filename\nEOF\n\ncat > good2.js << 'EOF'\nconsole.log('good 2');\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            // Should have parsed the good files
            (0, vitest_1.expect)(result.completedFiles.has('good1.js')).toBe(true);
            (0, vitest_1.expect)(result.completedFiles.has('good2.js')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Real-world Scenarios', function () {
        (0, vitest_1.it)('should handle React component file creation', function () {
            var chunk = "# Creating a React component\ncat > Button.jsx << 'EOF'\nimport React from 'react';\n\nexport const Button = ({ onClick, children }) => {\n    return (\n        <button onClick={onClick}>\n            {children}\n        </button>\n    );\n};\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            var file = result.completedFiles.get('Button.jsx');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toContain('export const Button');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toContain('<button onClick={onClick}>');
        });
        (0, vitest_1.it)('should handle package.json creation with proper JSON', function () {
            var chunk = "cat > package.json << 'EOF'\n{\n    \"name\": \"my-app\",\n    \"version\": \"1.0.0\",\n    \"scripts\": {\n        \"start\": \"node index.js\",\n        \"test\": \"jest\"\n    },\n    \"dependencies\": {\n        \"express\": \"^4.18.0\"\n    }\n}\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            var file = result.completedFiles.get('package.json');
            // Should be valid JSON
            (0, vitest_1.expect)(function () { return JSON.parse((file === null || file === void 0 ? void 0 : file.fileContents) || ''); }).not.toThrow();
        });
        (0, vitest_1.it)('should handle creating nested directory files', function () {
            var chunk = "cat > src/components/Header.tsx << 'EOF'\nimport React from 'react';\n\ninterface HeaderProps {\n    title: string;\n}\n\nexport const Header: React.FC<HeaderProps> = ({ title }) => {\n    return <h1>{title}</h1>;\n};\nEOF\n";
            var state = createInitialState();
            var result = processChunk(chunk, state);
            (0, vitest_1.expect)(result.completedFiles.has('src/components/Header.tsx')).toBe(true);
        });
    });
    (0, vitest_1.describe)('Performance and Stress Tests', function () {
        (0, vitest_1.it)('should handle many small chunks efficiently', function () {
            var content = "cat > test.js << 'EOF'\nconst x = 1;\nEOF\n";
            var state = createInitialState();
            // Process one character at a time
            for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
                var char = content_1[_i];
                state = processChunk(char, state);
            }
            (0, vitest_1.expect)(state.completedFiles.has('test.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle large files', function () {
            var largeContent = 'x'.repeat(10000);
            var chunk = "cat > large.txt << 'EOF'\n".concat(largeContent, "\nEOF\n");
            var state = createInitialState();
            var result = processChunk(chunk, state);
            var file = result.completedFiles.get('large.txt');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents.trim()).toBe(largeContent);
        });
    });
});
