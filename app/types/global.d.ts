// global.d.ts
interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
}

interface FileSystemGetDirectoryOptions {
    create?: boolean;
}

interface FileSystemGetFileOptions {
    create?: boolean;
}

interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
}

interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showSaveFilePicker(options?: FileSystemFilePickerOptions): Promise<FileSystemFileHandle>;
}
