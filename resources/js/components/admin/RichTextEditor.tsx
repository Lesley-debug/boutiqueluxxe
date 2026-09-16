import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export default function RichTextEditor({
    content,
    onChange,
}: {
    content: string;
    onChange: (html: string) => void;
}) {
    const editor = useEditor({
        extensions: [StarterKit, Link.configure({ openOnClick: false })],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none min-h-[300px] px-4 py-3 focus:outline-none",
            },
        },
    });

    if (!editor) return null;

    function toggle(action: () => void) {
        action();
        editor.chain().focus();
    }

    return (
        <div className="rounded-sm border border-gray-300">
            <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
                <ToolbarButton
                    active={editor.isActive("bold")}
                    onClick={() =>
                        toggle(() => editor.chain().focus().toggleBold().run())
                    }
                >
                    B
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("italic")}
                    onClick={() =>
                        toggle(() =>
                            editor.chain().focus().toggleItalic().run(),
                        )
                    }
                >
                    I
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() =>
                        toggle(() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run(),
                        )
                    }
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("heading", { level: 3 })}
                    onClick={() =>
                        toggle(() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run(),
                        )
                    }
                >
                    H3
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("bulletList")}
                    onClick={() =>
                        toggle(() =>
                            editor.chain().focus().toggleBulletList().run(),
                        )
                    }
                >
                    • List
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("orderedList")}
                    onClick={() =>
                        toggle(() =>
                            editor.chain().focus().toggleOrderedList().run(),
                        )
                    }
                >
                    1. List
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive("link")}
                    onClick={() => {
                        const url = window.prompt("Link URL");
                        if (url)
                            editor.chain().focus().setLink({ href: url }).run();
                    }}
                >
                    Link
                </ToolbarButton>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}

function ToolbarButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded px-2 py-1 text-xs font-medium ${active ? "bg-[#7C3AED] text-white" : "text-gray-600 hover:bg-gray-200"}`}
        >
            {children}
        </button>
    );
}
