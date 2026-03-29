"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var scof_1 = require("./scof");
(0, vitest_1.describe)('SCOFFormat', function () {
    var scofParser;
    var mockCallbacks;
    (0, vitest_1.beforeEach)(function () {
        scofParser = new scof_1.SCOFFormat();
        mockCallbacks = {
            onFileOpen: vitest_1.vi.fn(),
            onFileChunk: vitest_1.vi.fn(),
            onFileClose: vitest_1.vi.fn(),
        };
    });
    var createInitialState = function () { return ({
        accumulator: '',
        completedFiles: new Map(),
        parsingState: scofParser.initializeSCOFState(),
    }); };
    (0, vitest_1.describe)('parseStreamingChunks', function () {
        (0, vitest_1.it)('should parse a complete shell command file creation', function () {
            var chunk = "cat > src/index.ts << 'EOF'\nexport function main() {\n    console.log('Hello World');\n}\nEOF\n";
            var state = createInitialState();
            var result = scofParser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(1);
            (0, vitest_1.expect)(result.completedFiles.has('src/index.ts')).toBe(true);
            var file = result.completedFiles.get('src/index.ts');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.filePath).toBe('src/index.ts');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.fileContents).toBe("export function main() {\n    console.log('Hello World');\n}");
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.format).toBe('full_content');
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledWith('src/index.ts');
            (0, vitest_1.expect)(mockCallbacks.onFileClose).toHaveBeenCalledWith('src/index.ts');
        });
        (0, vitest_1.it)('should handle multiple files in a single chunk', function () {
            var chunk = "cat > file1.js << 'EOF'\nconsole.log('File 1');\nEOF\n\ncat > file2.js << 'EOF'\nconsole.log('File 2');\nEOF\n";
            var state = createInitialState();
            var result = scofParser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(2);
            (0, vitest_1.expect)(result.completedFiles.has('file1.js')).toBe(true);
            (0, vitest_1.expect)(result.completedFiles.has('file2.js')).toBe(true);
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledTimes(2);
            (0, vitest_1.expect)(mockCallbacks.onFileClose).toHaveBeenCalledTimes(2);
        });
        (0, vitest_1.it)('should handle streaming chunks correctly', function () {
            var chunk1 = "cat > streaming.ts << 'EOF'\nexport class StreamingTest {";
            var chunk2 = "\n    constructor() {\n        this.name = 'test';\n    }\n}\nEOF\n";
            var state = createInitialState();
            // Process first chunk
            state = scofParser.parseStreamingChunks(chunk1, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(state.completedFiles.size).toBe(0); // File not complete yet
            (0, vitest_1.expect)(mockCallbacks.onFileOpen).toHaveBeenCalledWith('streaming.ts');
            // Process second chunk
            state = scofParser.parseStreamingChunks(chunk2, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(state.completedFiles.size).toBe(1);
            (0, vitest_1.expect)(state.completedFiles.has('streaming.ts')).toBe(true);
            (0, vitest_1.expect)(mockCallbacks.onFileClose).toHaveBeenCalledWith('streaming.ts');
        });
        (0, vitest_1.it)('should handle files with special characters', function () {
            var chunk = "cat > \"special chars!@#.js\" << 'EOF'\n// Special characters in filename\nconst special = \"!@#$%^&*()\";\nEOF\n";
            var state = createInitialState();
            var result = scofParser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(1);
            (0, vitest_1.expect)(result.completedFiles.has('special chars!@#.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle patch commands', function () {
            var chunk = "cat << 'PATCH' | patch test.js\n--- a/test.js\n+++ b/test.js\n@@ -1,3 +1,3 @@\n function test() {\n-    return false;\n+    return true;\n }\nPATCH\n";
            var state = createInitialState();
            var result = scofParser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(1);
            (0, vitest_1.expect)(result.completedFiles.has('test.js')).toBe(true);
            var file = result.completedFiles.get('test.js');
            (0, vitest_1.expect)(file === null || file === void 0 ? void 0 : file.format).toBe('unified_diff');
        });
        (0, vitest_1.it)('should handle comments and empty lines', function () {
            var chunk = "# This is a comment\n# Creating a new file\n\ncat > commented.js << 'EOF'\n// File with comments before it\nconst x = 1;\nEOF\n";
            var state = createInitialState();
            var result = scofParser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(1);
            (0, vitest_1.expect)(result.completedFiles.has('commented.js')).toBe(true);
        });
        (0, vitest_1.it)('should handle EOF marker variations', function () {
            var chunk = "cat > double.js << \"MARKER\"\n// Double quoted marker\nMARKER\n\ncat > unquoted.js << END\n// Unquoted marker\nEND\n\ncat > single.js << 'DONE'\n// Single quoted marker\nDONE\n";
            var state = createInitialState();
            var result = scofParser.parseStreamingChunks(chunk, state, mockCallbacks.onFileOpen, mockCallbacks.onFileChunk, mockCallbacks.onFileClose);
            (0, vitest_1.expect)(result.completedFiles.size).toBe(3);
            (0, vitest_1.expect)(result.completedFiles.has('double.js')).toBe(true);
            (0, vitest_1.expect)(result.completedFiles.has('unquoted.js')).toBe(true);
            (0, vitest_1.expect)(result.completedFiles.has('single.js')).toBe(true);
        });
    });
    (0, vitest_1.describe)('deserialize', function () {
        (0, vitest_1.it)('should deserialize SCOF format to files', function () {
            var serialized = "cat > test.js << 'EOF'\nconsole.log(\"test\");\nEOF\n\ncat << 'EOF' | patch other.js\n--- a/other.js\n+++ b/other.js\n@@ -1 +1 @@\n-old\n+new\nEOF\n";
            var files = scofParser.deserialize(serialized);
            (0, vitest_1.expect)(files).toHaveLength(2);
            (0, vitest_1.expect)(files[0].filePath).toBe('test.js');
            (0, vitest_1.expect)(files[0].format).toBe('full_content');
            (0, vitest_1.expect)(files[1].filePath).toBe('other.js');
            (0, vitest_1.expect)(files[1].format).toBe('unified_diff');
        });
    });
});
