import React from 'react';
import { FileText, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
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

const Sidebar = ({ files, onFileClick, onFolderSelect, activeFile }: SidebarProps) => {
    const [isExpanded, setIsExpanded] = React.useState(true);

    return (
        <div className="w-64 min-h-screen bg-secondary border-r border-border flex flex-col">
            <div className="p-2 border-b border-border">
                <Button
                    variant="ghost"
                    className="w-full bg-transparent hover:bg-secondary/80 text-gray-300
                             flex items-center gap-2 text-sm font-normal"
                    onClick={onFolderSelect}
                >
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    Select Folder
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-gray-200 text-xs p-2 cursor-pointer hover:bg-secondary/80"
                >
                    {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    Notes
                </div>

                {isExpanded && (
                    <div className="space-y-0.5">
                        {files.length === 0 ? (
                            <div className="text-gray-500 text-xs px-4 py-2">
                                No files in workspace
                            </div>
                        ) : (
                            files.map((file) => (
                                <button
                                    key={file.name}
                                    onClick={() => onFileClick(file)}
                                    className={cn(
                                        "w-full text-left px-4 py-1",
                                        "flex items-center gap-2 text-xs",
                                        "transition-colors",
                                        activeFile?.name === file.name
                                            ? "bg-secondary-foreground/10"
                                            : "bg-transparent hover:bg-secondary-foreground/5",
                                        activeFile?.name === file.name
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-primary"
                                    )}
                                >
                                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <span className="truncate">
                                        {file.name.replace('.md', '')}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;