'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MarkdownEditor from '../components/MarkdownEditor';

interface MarkdownFile {
    name: string;
    handle: FileSystemFileHandle;
}

export default function HomePage() {
    const [files, setFiles] = useState<MarkdownFile[]>([]);
    const [currentFile, setCurrentFile] = useState<MarkdownFile | null>(null);

    const handleFolderSelection = async () => {
        if (!('showDirectoryPicker' in window)) {
            console.error('File System Access API is not supported in this browser');
            return;
        }
        try {
            const directoryHandle = await window.showDirectoryPicker();
            const markdownFiles: MarkdownFile[] = [];

            // Iterate over all items in the selected directory
            for await (const [name, handle] of directoryHandle.entries()) {
                // Only push .md files
                if (handle.kind === 'file' && name.endsWith('.md')) {
                    markdownFiles.push({ name, handle });
                }
            }

            setFiles(markdownFiles);
            setCurrentFile(null);
        } catch (error) {
            console.error('Error accessing folder:', error);
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar 
                files={files} 
                onFileClick={setCurrentFile} 
                onFolderSelect={handleFolderSelection} 
            />
            <div style={{ flex: 1, padding: '16px' }}>
                {currentFile ? (
                    <MarkdownEditor file={currentFile} />
                ) : (
                    <p>Select a folder to view your notes.</p>
                )}
            </div>
        </div>
    );
}
