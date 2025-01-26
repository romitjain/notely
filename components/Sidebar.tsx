import React from 'react';
import { FileText, FolderOpen, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarkdownFile } from '../types/types';


interface SidebarProps {
    files: MarkdownFile[];
    onFileClick: (file: MarkdownFile) => void;
    onFolderSelect: () => void;
    onAddFile: () => void;
    activeFile?: MarkdownFile;
}

const Sidebar = ({
    files,
    onFileClick,
    onFolderSelect,
    onAddFile,
    activeFile
}: SidebarProps) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    return (
        <div className="sidebar">
            {/** Header (top) */}
            <div className="sidebar-header">
                {/* Folder select button */}
                <Button
                    className="sidebar-header-button"
                    onClick={onFolderSelect}
                >
                    <FolderOpen className="h-4 w-4" />
                    Select Folder
                </Button>
            </div>

            {/** Scrollable files area */}
            <div className="sidebar-files">
                {/** Toggle row */}
                <div
                    className="sidebar-toggle"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Notes

                    {files.length > 0 && (
                        <Button
                            className="sidebar-add-file-button"
                            onClick={onAddFile}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>

                {/** Expand/collapse file list */}
                {isExpanded && (
                    <div>
                        {files.length === 0 ? (
                            <div className="sidebar-no-files">
                                No files in workspace
                            </div>
                        ) : (
                            [...files]
                                .sort((a, b) => b.modified - a.modified)
                                .map((file) => {
                                    const isActive = activeFile?.name === file.name;
                                    return (
                                        <Button
                                            key={file.name}
                                            className={cn(
                                                "sidebar-file-item",
                                                isActive && "active",
                                            )}
                                            onClick={() => onFileClick(file)}
                                        >
                                            <FileText className="h-3.5 w-3.5 shrink-0" />
                                            {file.name.replace('.md', '')}
                                        </Button>
                                    );
                                })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
