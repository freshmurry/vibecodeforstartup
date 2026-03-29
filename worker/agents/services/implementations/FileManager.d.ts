import { IFileManager } from '../interfaces/IFileManager';
import { IStateManager } from '../interfaces/IStateManager';
import { FileOutputType } from '../../schemas';
import { TemplateDetails } from '../../../services/sandbox/sandboxTypes';
/**
 * Manages file operations for code generation
 * Handles both template and generated files
 */
export declare class FileManager implements IFileManager {
    private stateManager;
    constructor(stateManager: IStateManager);
    getTemplateFile(path: string): {
        filePath: string;
        fileContents: string;
    } | null;
    getGeneratedFile(path: string): FileOutputType | null;
    getAllFiles(): FileOutputType[];
    saveGeneratedFile(file: FileOutputType): void;
    saveGeneratedFiles(files: FileOutputType[]): void;
    deleteFiles(filePaths: string[]): void;
    getFile(path: string): FileOutputType | null;
    getFileContents(path: string): string;
    fileExists(path: string): boolean;
    getGeneratedFilePaths(): string[];
    getTemplateDetails(): TemplateDetails | undefined;
    getGeneratedFilesMap(): Record<string, FileOutputType>;
    getGeneratedFiles(): FileOutputType[];
}
