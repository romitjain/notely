export interface MarkdownFile {
    name: string;
    handle: FileSystemFileHandle;
    folder_handle: FileSystemDirectoryHandle | null | undefined;
    created: number;
    modified: number;
} 