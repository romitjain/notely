import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import {
    Eye, Edit2, Save,
    Image as ImageIcon, Trash
} from "lucide-react";
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
    // const [isFullscreen, setIsFullscreen] = useState(false);
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

    const handleSave = useCallback(async () => {
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
    }, [file.handle, content, toast]);

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

    // Custom components for ReactMarkdown
    const components = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <SyntaxHighlighter
                    style={coldarkDark}
                    language={match[1]}
                    PreTag="div"
                    className="syntax-highlighter"  // see .syntax-highlighter in globals.css
                    {...props}
                >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            ) : (
                <code className={cn("syntax-highlighter", className)} {...props}>
                    {children}
                </code>
            );
        },
        // custom img handling
        img: function MarkdownImage({ alt, src, ...props }: { alt?: string; src?: string }) {
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
        },
    };

    return (
        <div
            className={cn(
                "markdown-editor",          // base editor container
                // isFullscreen && "fullscreen" // toggles .markdown-editor.fullscreen in CSS
            )}
        >
            {/* === Toolbar === */}
            <div className="editor-toolbar">
                <div className="editor-toolbar-content">
                    <div className="editor-toolbar-group">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? <Eye className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                            <span>{isEditing ? "Preview" : "Edit"}</span>
                        </Button>
                    </div>

                    <div className="editor-toolbar-group">
                        <span className="text-sm font-medium text-muted-foreground">
                            {file.name.replace('.md', '')}
                        </span>
                    </div>

                    <div className="editor-toolbar-group">
                        {isEditing && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleSave}
                            >
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="h-4 w-4" />
                            ) : (
                                <Maximize2 className="h-4 w-4" />
                            )}
                        </Button> */}
                    </div>
                </div>
            </div>

            {/* === Editor / Preview Area === */}
            <div className="editor-main">
                {isEditing ? (
                    <div style={{ height: "100%", padding: "1rem" }}>
                        <textarea
                            className="editor-textarea"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <div
                        className={cn(
                            "prose prose-invert max-w-none p-8"
                        )}
                    >
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
