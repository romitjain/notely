import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
    title: "Notely",
    description: "A simple markdown note taking app with a pinch of AI focused on privacy",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-zinc-900 text-zinc-100">
                {children}
                <Toaster />
            </body>
        </html>
    );
}
