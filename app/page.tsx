'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MarkdownEditor from '../components/MarkdownEditor';
import { MarkdownFile } from '../types/types';
import CommandMenu from '../components/Search'

export default function HomePage() {
    const [files, setFiles] = useState<MarkdownFile[]>([]);
    const [currentFolder, setCurrentFolder] = useState<FileSystemDirectoryHandle | undefined>(undefined);
    const [currentFile, setCurrentFile] = useState<MarkdownFile | undefined>(undefined);

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
                    const file = await handle.getFile();
                    markdownFiles.push({ 
                        name, 
                        handle, 
                        folder_handle: directoryHandle,
                        created: file.lastModified,  // Note: This is actually last modified time as creation time isn't available
                        modified: file.lastModified
                    });
                }
            }

            setFiles(markdownFiles);
            setCurrentFolder(directoryHandle);
            setCurrentFile(undefined);
        } catch (error) {
            console.error('Error accessing folder:', error);
        }
    };

    useEffect(() => {
        const onOpenFolder = () => handleFolderSelection();
        document.addEventListener('open-folder', onOpenFolder);
        return () => document.removeEventListener('open-folder', onOpenFolder);
    }, []);

    const handleAddFile = async () => {
        try {
            const today = new Date();
            const dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const newFileHandle = await window.showSaveFilePicker({
                suggestedName: `${dateString}.md`,
                types: [{ description: "Markdown File", accept: { "text/markdown": [".md"] } }],
            });

            const file = await newFileHandle.getFile();
            const newFile = {
                name: newFileHandle.name,
                handle: newFileHandle,
                folder_handle: currentFile?.folder_handle,
                created: file.lastModified,
                modified: file.lastModified
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
                const file = await handle.getFile();
                markdownFiles.push({ 
                    name, 
                    handle, 
                    folder_handle: currentFolder,
                    created: file.lastModified,
                    modified: file.lastModified
                });
            }
        }

        setFiles(markdownFiles);
        setCurrentFile(undefined);
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
                    case 'o':
                        e.preventDefault();
                        document.dispatchEvent(new CustomEvent('open-folder'));
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentFile]);

    return (
        <div className="app-container">
            <CommandMenu files={files} />
            {/* Sidebar has its own .sidebar class in globals.css */}
            <Sidebar
                files={files}
                onFileClick={setCurrentFile}
                onFolderSelect={handleFolderSelection}
                onAddFile={handleAddFile}
                activeFolder={currentFolder}
            />

            <main className="main-content">
                {currentFile ? (
                    <MarkdownEditor file={currentFile} onRefresh={handleRefresh} />
                ) : (
                    <p>
                    Notely is a simple, privacy-focused journaling app that runs entirely in your web browser. <br />
                    It loads local markdown files from a folder you choose. <br />
                    Select a folder from the sidebar to get started. <br />
                    Ctrl + O to open a folder. <br />
                    Ctrl + E to edit, Ctrl + S to save. <br />
                    </p>
                )}
            </main>
        </div>
    );
}
