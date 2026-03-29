import { getFileType } from '@/utils/string';
/**
 * Update a specific file in the files array
 */
export function updateFileInArray(files, filePath, updates) {
    const existingFileIndex = files.findIndex(f => f.filePath === filePath);
    if (existingFileIndex >= 0) {
        return files.map((file, index) => index === existingFileIndex
            ? { ...file, ...updates }
            : file);
    }
    // Add new file if it doesn't exist
    return [...files, {
            filePath,
            fileContents: '',
            isGenerating: false,
            needsFixing: false,
            hasErrors: false,
            language: getFileType(filePath),
            ...updates
        }];
}
/**
 * Update file status in phase timeline
 */
export function updatePhaseFileStatus(phaseTimeline, filePath, status, fileContents) {
    const updatedTimeline = [...phaseTimeline];
    // Find the most recent phase containing this file (iterate backwards)
    for (let i = updatedTimeline.length - 1; i >= 0; i--) {
        const phase = updatedTimeline[i];
        if (phase.status === 'completed' && status !== 'completed') {
            continue; // Skip completed phases unless we're marking as completed
        }
        const fileInPhase = phase.files.find(f => f.path === filePath);
        if (fileInPhase) {
            fileInPhase.status = status;
            if (fileContents !== undefined) {
                fileInPhase.contents = fileContents;
            }
            console.log(`File ${status} in phase ${phase.name}: ${filePath}`);
            break;
        }
    }
    return updatedTimeline;
}
/**
 * Add or update a file with generating state
 */
export function setFileGenerating(files, filePath, explanation) {
    return updateFileInArray(files, filePath, {
        filePath,
        fileContents: '',
        explanation: explanation || '',
        isGenerating: true,
        needsFixing: false,
        hasErrors: false,
        language: getFileType(filePath),
    });
}
/**
 * Update file content chunk
 */
export function appendFileChunk(files, filePath, chunk) {
    const existingFile = files.find(f => f.filePath === filePath);
    if (existingFile) {
        return files.map(file => file.filePath === filePath
            ? { ...file, fileContents: file.fileContents + chunk }
            : file);
    }
    // Create new file with chunk
    return [...files, {
            filePath,
            fileContents: chunk,
            explanation: '',
            isGenerating: true,
            needsFixing: false,
            hasErrors: false,
            language: getFileType(filePath),
        }];
}
/**
 * Mark file as completed
 */
export function setFileCompleted(files, filePath, fileContents) {
    return updateFileInArray(files, filePath, {
        fileContents,
        isGenerating: false,
        needsFixing: false,
        hasErrors: false,
    });
}
/**
 * Mark all files as completed
 */
export function setAllFilesCompleted(files) {
    return files.map(file => ({
        ...file,
        isGenerating: false,
        needsFixing: false,
        hasErrors: false,
    }));
}
