'use client';

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import MarkdownEditor from '../components/MarkdownEditor';
import { MarkdownFile } from '../types/types';

export default function HomePage() {
    const [files, setFiles] = useState<MarkdownFile[]>([]);
    const [currentFolder, setCurrentFolder] = useState<FileSystemDirectoryHandle | null>(null);
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
                    markdownFiles.push({ name, handle, folder_handle: directoryHandle });
                }
            }

            setFiles(markdownFiles);
            setCurrentFolder(directoryHandle);
            setCurrentFile(null);
        } catch (error) {
            console.error('Error accessing folder:', error);
        }
    };

    const handleAddFile = async () => {
        try {
            const newFileHandle = await window.showSaveFilePicker({
                suggestedName: "New File.md",
                types: [{ description: "Markdown File", accept: { "text/markdown": [".md"] } }],
            });

            const newFile = { name: newFileHandle.name, handle: newFileHandle, folder_handle: currentFile?.folder_handle };
            setFiles(prev => [...prev, newFile]);
            setCurrentFile(newFile);
            handleRefresh();

        } catch (error) {
            console.error('Error creating new file:', error);
        }
    };

    // Handler for refreshing the markdownFiles
    const handleRefresh = async () => {

        if (!currentFolder) {
            return;
        }

        const markdownFiles: MarkdownFile[] = [];

        // Iterate over all items in the selected directory
        for await (const [name, handle] of currentFolder.entries()) {
            // Only push .md files
            if (handle.kind === 'file' && name.endsWith('.md')) {
                markdownFiles.push({ name, handle, folder_handle: currentFolder });
            }
        }

        setFiles(markdownFiles);
        setCurrentFile(null);
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar 
                files={files} 
                onFileClick={setCurrentFile} 
                onFolderSelect={handleFolderSelection}
                onAddFile={handleAddFile}
            />
            <div style={{ flex: 1, padding: '16px' }}>
                {currentFile ? (
                    <MarkdownEditor file={currentFile} onRefresh={handleRefresh} />
                ) : (
                    <p>Select a folder to view your notes.</p>
                )}
            </div>
        </div>
    );
}
