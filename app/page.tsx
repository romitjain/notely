'use client';

import React, { useState, useEffect } from 'react';
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

            const newFile = {
                name: newFileHandle.name,
                handle: newFileHandle,
                folder_handle: currentFile?.folder_handle,
            };
            setFiles(prev => [...prev, newFile]);
            setCurrentFile(newFile);
            handleRefresh();
        } catch (error) {
            console.error('Error creating new file:', error);
        }
    };

    const handleRefresh = async () => {
        if (!currentFolder) return;

        const markdownFiles: MarkdownFile[] = [];
        for await (const [name, handle] of currentFolder.entries()) {
            if (handle.kind === 'file' && name.endsWith('.md')) {
                markdownFiles.push({ name, handle, folder_handle: currentFolder });
            }
        }

        setFiles(markdownFiles);
        setCurrentFile(null);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        if (currentFile) {
                            // Trigger save (listened for in MarkdownEditor)
                            document.dispatchEvent(new CustomEvent('save-file'));
                        }
                        break;
                    case 'e':
                        e.preventDefault();
                        if (currentFile) {
                            document.dispatchEvent(new CustomEvent('toggle-edit'));
                        }
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentFile]);

    return (
        <div className="app-container">
            {/* Sidebar has its own .sidebar class in globals.css */}
            <Sidebar
                files={files}
                onFileClick={setCurrentFile}
                onFolderSelect={handleFolderSelection}
                onAddFile={handleAddFile}
            />

            <main className="main-content">
                {currentFile ? (
                    <MarkdownEditor file={currentFile} onRefresh={handleRefresh} />
                ) : (
                    <p>Select a folder to view your notes.</p>
                )}
            </main>
        </div>
    );
}
