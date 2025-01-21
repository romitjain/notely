// global.d.ts
interface FileSystemFileHandle {
    kind: 'file';
    name: string;
    getFile(): Promise<File>;
    createWritable(options?: any): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
    kind: 'directory';
    name: string;
    entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
    getDirectoryHandle(name: string, options?: any): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: any): Promise<FileSystemFileHandle>;
}

interface Window {
    showDirectoryPicker?: any;
}
