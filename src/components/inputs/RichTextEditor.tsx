import { forwardRef, useEffect, useId } from "react";
import { useFormContext } from "react-hook-form";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Sanitization & Utilities (Preserved for existing invoice/order usage)      */
/* -------------------------------------------------------------------------- */

const allowedTags = new Set([
  "P",
  "DIV",
  "BR",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "S",
  "UL",
  "OL",
  "LI",
  "H1",
  "H2",
  "H3",
  "H4",
  "BLOCKQUOTE",
  "CODE",
  "PRE",
  "HR",
]);

const discardTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG"]);

export function sanitizeRichText(value: string) {
  if (!value || !value.trim()) return "";

  const source = document.createElement("template");
  const hasFormatting =
    /<\/?(?:p|div|br|strong|b|em|i|u|s|ul|ol|li|h1|h2|h3|h4|blockquote|code|pre|hr)\b/i.test(
      value,
    );
  if (hasFormatting) {
    source.innerHTML = value;
  } else {
    value.split("\n").forEach((line, index) => {
      if (index > 0) source.content.append(document.createElement("br"));
      source.content.append(document.createTextNode(line));
    });
  }

  const clean = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return document.createTextNode(node.textContent || "");
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const element = node as Element;
    if (discardTags.has(element.tagName)) return null;
    const output: Node = allowedTags.has(element.tagName)
      ? document.createElement(element.tagName.toLowerCase())
      : document.createDocumentFragment();
    element.childNodes.forEach((child) => {
      const safeChild = clean(child);
      if (safeChild) output.appendChild(safeChild);
    });
    return output;
  };

  const safe = document.createElement("div");
  source.content.childNodes.forEach((node) => {
    const safeNode = clean(node);
    if (safeNode) safe.appendChild(safeNode);
  });
  return safe.textContent?.trim() ? safe.innerHTML : "";
}

/* -------------------------------------------------------------------------- */
/* Component Props                                                            */
/* -------------------------------------------------------------------------- */

export interface RichTextProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  hideLabel?: boolean;
  placeholder?: string;
  compact?: boolean;
  minHeight?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Main Reusable Editor Component                                             */
/* -------------------------------------------------------------------------- */

const RichTextEditor = forwardRef<HTMLDivElement, RichTextProps>(
  (
    {
      name,
      value,
      defaultValue = "",
      onChange,
      label,
      hideLabel = false,
      placeholder = "Write something...",
      compact = false,
      minHeight,
      disabled = false,
      required = false,
      className = "",
    },
    ref,
  ) => {
    const id = useId();

    // ✅ SAFE: prevents crash when no FormProvider exists (like SimpleInput)
    let formContext: any = null;
    try {
      formContext = useFormContext();
    } catch {
      formContext = null;
    }

    const formState = formContext?.formState;
    const error = name && formState ? formState.errors?.[name] : undefined;
    const formValue = name && formContext ? formContext.watch(name) : undefined;

    // Resolved current value (controlled > hook-form watched > defaultValue)
    const currentValue =
      value !== undefined
        ? value
        : formValue !== undefined
          ? formValue
          : defaultValue;

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        Underline,
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
        }),
      ],
      content: currentValue || "",
      editable: !disabled,
      onUpdate: ({ editor: currentEditor }) => {
        const html = currentEditor.isEmpty ? "" : currentEditor.getHTML();
        onChange?.(html);
        if (name && formContext) {
          formContext.setValue(name, html, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      },
    });

    // Synchronize external value changes (e.g. form resets or external state change)
    useEffect(() => {
      if (!editor) return;
      const editorHTML = editor.isEmpty ? "" : editor.getHTML();
      if (currentValue !== undefined && currentValue !== editorHTML) {
        editor.commands.setContent(currentValue || "", { emitUpdate: false });
      }
    }, [currentValue, editor]);

    // Synchronize disabled state
    useEffect(() => {
      if (editor) {
        editor.setEditable(!disabled);
      }
    }, [disabled, editor]);

    const defaultMinHeight = compact ? "min-h-[80px]" : "min-h-[120px]";
    const heightClass = minHeight || defaultMinHeight;

    return (
      <div ref={ref} className={`w-full space-y-1.5 ${className}`}>
        {label && !hideLabel && (
          <label
            htmlFor={id}
            className="fieldset-label font-semibold text-sm text-base-content/80 flex items-center gap-1"
          >
            <span>{label}</span>
            {required && <span className="text-error">*</span>}
          </label>
        )}

        <div
          className={`overflow-hidden rounded-xl border bg-base-100 transition-all ${
            error
              ? "border-error focus-within:ring-2 focus-within:ring-error/20"
              : "border-base-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          } ${disabled ? "opacity-60 pointer-events-none bg-base-200/80" : ""}`}
        >
          {/* WYSIWYG Toolbar */}
          {editor && !disabled && (
            <div
              className="flex flex-wrap items-center gap-0.5 border-b border-base-200 bg-base-200/40 p-1.5"
              role="toolbar"
              aria-label={label ? `${label} formatting` : "Rich text toolbar"}
            >
              {/* Bold */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("bold")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Bold"
                aria-label="Bold"
              >
                <Bold className="size-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("italic")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Italic"
                aria-label="Italic"
              >
                <Italic className="size-3.5" />
              </button>

              {/* Underline */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("underline")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Underline"
                aria-label="Underline"
              >
                <UnderlineIcon className="size-3.5" />
              </button>

              {/* Strike */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("strike")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Strikethrough"
                aria-label="Strikethrough"
              >
                <Strikethrough className="size-3.5" />
              </button>

              <div className="h-4 w-px bg-base-300 mx-1" />

              {/* Heading 2 */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("heading", { level: 2 })
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Heading 2"
                aria-label="Heading 2"
              >
                <Heading2 className="size-3.5" />
              </button>

              {/* Heading 3 */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("heading", { level: 3 })
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Heading 3"
                aria-label="Heading 3"
              >
                <Heading3 className="size-3.5" />
              </button>

              <div className="h-4 w-px bg-base-300 mx-1" />

              {/* Bullet list */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("bulletList")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Bullet List"
                aria-label="Bullet List"
              >
                <List className="size-3.5" />
              </button>

              {/* Ordered list */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("orderedList")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Numbered List"
                aria-label="Numbered List"
              >
                <ListOrdered className="size-3.5" />
              </button>

              {/* Blockquote */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("blockquote")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Quote"
                aria-label="Quote"
              >
                <Quote className="size-3.5" />
              </button>

              {/* Code */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`btn btn-ghost btn-xs size-7 p-0 rounded-md ${
                  editor.isActive("code")
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/60"
                }`}
                title="Inline Code"
                aria-label="Inline Code"
              >
                <Code className="size-3.5" />
              </button>

              <div className="h-4 w-px bg-base-300 mx-1 ml-auto" />

              {/* Undo */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="btn btn-ghost btn-xs size-7 p-0 rounded-md text-base-content/70 hover:text-base-content disabled:opacity-30"
                title="Undo"
                aria-label="Undo"
              >
                <Undo2 className="size-3.5" />
              </button>

              {/* Redo */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="btn btn-ghost btn-xs size-7 p-0 rounded-md text-base-content/70 hover:text-base-content disabled:opacity-30"
                title="Redo"
                aria-label="Redo"
              >
                <Redo2 className="size-3.5" />
              </button>
            </div>
          )}

          {/* Editable Content */}
          <EditorContent
            editor={editor}
            className={`px-3 py-2.5 text-sm text-base-content outline-none ${heightClass} [&_.tiptap]:outline-none [&_.tiptap]:min-h-[inherit] [&_.tiptap_p]:my-1 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_blockquote]:border-l-2 [&_.tiptap_blockquote]:border-primary/80 [&_.tiptap_blockquote]:pl-3 [&_.tiptap_blockquote]:italic [&_.tiptap_blockquote]:text-base-content/70 [&_.tiptap_h2]:text-base [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:my-2 [&_.tiptap_h3]:text-sm [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:my-1.5 [&_.tiptap_code]:rounded [&_.tiptap_code]:bg-base-200 [&_.tiptap_code]:px-1 [&_.tiptap_code]:py-0.5 [&_.tiptap_code]:font-mono [&_.tiptap_code]:text-xs [&_.tiptap.is-editor-empty:first-child::before]:text-base-content/40 [&_.tiptap.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap.is-editor-empty:first-child::before]:float-left [&_.tiptap.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap.is-editor-empty:first-child::before]:h-0`}
          />
        </div>

        {error && (
          <p className="text-error text-xs mt-1">
            {error.message ? String(error.message) : "Invalid input"}
          </p>
        )}
      </div>
    );
  },
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;

/* -------------------------------------------------------------------------- */
/* Read-Only HTML Display Component                                           */
/* -------------------------------------------------------------------------- */

export function RichTextContent({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`text-sm text-base-content/80 [&_p]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
    />
  );
}
