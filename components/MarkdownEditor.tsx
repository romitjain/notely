import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { Eye, Edit2, Save, Maximize2, Minimize2, Image as ImageIcon, Trash } from "lucide-react";
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MarkdownFile } from "@/types/types";

interface MarkdownEditorProps {
    file: MarkdownFile;
    onRefresh: () => void;
}

export default function MarkdownEditor({ file, onRefresh }: MarkdownEditorProps) {
    const [content, setContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const loadFile = async () => {
            try {
                const fileData = await file.handle.getFile();
                const text = await fileData.text();
                setContent(text);
            } catch (error) {
                console.error("Error reading file:", error);
                toast({
                    title: "Error",
                    description: "Failed to load the file",
                    variant: "destructive",
                });
            }
        };
        loadFile();
    }, [file, toast]);

    const handleSave = async () => {
        try {
            const writable = await file.handle.createWritable();
            await writable.write(content);
            await writable.close();
            toast({
                title: "Success",
                description: "File saved successfully",
            });
        } catch (error) {
            console.error("Error saving file:", error);
            toast({
                title: "Error",
                description: "Failed to save the file",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        const onSave = () => handleSave();
        document.addEventListener('save-file', onSave);
        return () => document.removeEventListener('save-file', onSave);
    }, [handleSave]);

    useEffect(() => {
        const onToggleEdit = () => setIsEditing(!isEditing);
        document.addEventListener('toggle-edit', onToggleEdit);
        return () => document.removeEventListener('toggle-edit', onToggleEdit);
    }, [isEditing]);

    const handleDelete = async () => {
        try {
            const parentHandle = file.folder_handle;
            if (!parentHandle) {
                throw new Error("Could not access parent directory");
            }

            await parentHandle.removeEntry(file.name);
            onRefresh();
            toast({
                title: "Success",
                description: "File deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting file:", error);
            toast({
                title: "Error",
                description: "Failed to delete the file",
                variant: "destructive",
            });
        }
    };

    // Custom components for ReactMarkdown with enhanced styling
    const components = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <SyntaxHighlighter
                    style={coldarkDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md !bg-muted"
                    {...props}
                >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            ) : (
                <code className={cn("bg-muted rounded px-1.5 py-0.5", className)} {...props}>
                    {children}
                </code>
            );
        },
        // Convert img component to a React component to properly use hooks
        img: function MarkdownImage({ alt, src, ...props }: {
            alt?: string;
            src?: string;
        }) {
            const [isLoading, setIsLoading] = useState(true);
            const [hasError, setHasError] = useState(false);

            return (
                <span className="relative inline-block">
                    {/* Loading state */}
                    {isLoading && !hasError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-md">
                            <ImageIcon className="h-6 w-6 text-muted-foreground animate-pulse" />
                        </div>
                    )}

                    {/* Error state */}
                    {hasError && (
                        <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-md p-2">
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-sm">Failed to load image: {alt}</span>
                        </div>
                    )}

                    {/* Actual image */}
                    <Image
                        src={src || ''}
                        alt={alt || ''}
                        width={800}
                        height={600}
                        className={cn(
                            "max-w-full h-auto rounded-md",
                            isLoading && "opacity-0",
                            hasError && "hidden"
                        )}
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                        {...props}
                    />
                </span>
            );
        }
    };

    return (
        <div className={cn(
            "flex flex-col h-screen",
            isFullscreen && "fixed inset-0 z-50 bg-background"
        )}>
            {/* Toolbar */}
            <div className="border-b border-border bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between p-2">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                                className="gap-2"
                            >
                                {isEditing ? <Eye className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                                {isEditing ? 'Preview' : 'Edit'}
                            </Button>
                        </div>
                    </div>

                    <div className="text-sm font-medium text-muted-foreground">
                        {file.name.replace('.md', '')}
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-2"
                                onClick={handleSave}
                            >
                                <Save className="h-4 w-4" />
                                Save
                            </Button>
                        )}

                        {/* Delete button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ?
                                <Minimize2 className="h-4 w-4" /> :
                                <Maximize2 className="h-4 w-4" />
                            }
                        </Button>
                    </div>
                </div>
            </div>

            {/* Editor/Preview area */}
            <div className="flex-1 overflow-auto">
                {isEditing ? (
                    <div className="h-full p-4">
                        <textarea
                            className="w-full h-full bg-background rounded-lg p-4 
                                     text-sm font-mono text-foreground
                                     border border-border
                                     focus:outline-none focus:ring-1 focus:ring-primary/20
                                     resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <div className="prose prose-invert max-w-none p-8">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={components}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}