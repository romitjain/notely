import React from 'react';
import { FileText, FolderOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownFile {
    name: string;
    handle: FileSystemFileHandle;
}

interface SidebarProps {
    files: MarkdownFile[];
    onFileClick: (file: MarkdownFile) => void;
    onFolderSelect: () => void;
    activeFile?: MarkdownFile;
}

export default function Sidebar({ files, onFileClick, onFolderSelect, activeFile }: SidebarProps) {
    return (
        <div className="w-64 min-h-screen bg-[#0d1117] border-r border-[#30363d] flex flex-col">
            {/* Header with folder select */}
            <div className="p-3">
                <Button
                    variant="secondary"
                    className="w-full bg-[#21262d] hover:bg-[#30363d] text-gray-300 
                             border border-[#30363d] shadow-sm
                             flex items-center gap-2 text-sm font-medium"
                    onClick={onFolderSelect}
                >
                    <FolderOpen className="h-4 w-4 opacity-70" />
                    Select Folder
                </Button>
            </div>

            {/* Files list */}
            <div className="flex-1 overflow-y-auto px-2">
                {files.length === 0 ? (
                    <div className="text-gray-500 text-sm p-4 text-center">
                        No markdown files found
                    </div>
                ) : (
                    <div className="space-y-0.5">
                        {files.map((file) => (
                            <button
                                key={file.name}
                                onClick={() => onFileClick(file)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md",
                                    "flex items-center gap-2 text-sm",
                                    "transition-all duration-150 ease-in-out",
                                    "group focus:outline-none focus:ring-1 focus:ring-[#58a6ff]/30",
                                    activeFile?.name === file.name
                                        ? "bg-[#1f2937] text-gray-200"
                                        : "text-gray-400 hover:bg-[#1f2937]/50 hover:text-gray-300"
                                )}
                            >
                                <FileText className={cn(
                                    "h-4 w-4 shrink-0",
                                    activeFile?.name === file.name
                                        ? "text-[#58a6ff]"
                                        : "text-gray-500 group-hover:text-gray-400"
                                )} />
                                <span className="truncate">
                                    {file.name.replace('.md', '')}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}