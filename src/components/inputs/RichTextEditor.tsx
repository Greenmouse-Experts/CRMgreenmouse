import { useEffect, useId, useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

const allowedTags = new Set([
  "P", "DIV", "BR", "STRONG", "B", "EM", "I", "UL", "OL", "LI",
]);
const discardTags = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG"]);

export function sanitizeRichText(value: string) {
  if (!value.trim()) return "";

  const source = document.createElement("template");
  const hasFormatting = /<\/?(?:p|div|br|strong|b|em|i|ul|ol|li)\b/i.test(value);
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

interface RichTextProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hideLabel?: boolean;
  compact?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  hideLabel = false,
  compact = false,
}: RichTextProps) {
  const id = useId();
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValue = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (editorRef.current && value !== lastValue.current) {
      editorRef.current.innerHTML = sanitizeRichText(value);
      lastValue.current = value;
    }
  }, [value]);

  const update = () => {
    const next = editorRef.current?.innerHTML || "";
    lastValue.current = next;
    onChange(next);
  };

  const format = (command: string) => {
    editorRef.current?.focus();
    document.execCommand(command);
    update();
  };

  return (
    <div className="space-y-1">
      <label
        id={`${id}-label`}
        className={hideLabel ? "sr-only" : "text-sm font-semibold text-base-content/70"}
      >
        {label}
      </label>
      <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100 focus-within:border-primary">
        <div className="flex gap-1 border-b border-base-200 p-1" role="toolbar" aria-label={`${label} formatting`}>
          {[
            { command: "bold", label: "Bold", Icon: Bold },
            { command: "italic", label: "Italic", Icon: Italic },
            { command: "insertUnorderedList", label: "Bullet list", Icon: List },
            { command: "insertOrderedList", label: "Numbered list", Icon: ListOrdered },
          ].map(({ command, label: actionLabel, Icon }) => (
            <button
              key={command}
              type="button"
              className="btn btn-ghost btn-xs"
              aria-label={actionLabel}
              title={actionLabel}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => format(command)}
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
        <div
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={`${id}-label`}
          contentEditable
          suppressContentEditableWarning
          onInput={update}
          onPaste={(event) => {
            event.preventDefault();
            document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
            update();
          }}
          className={`${compact ? "min-h-20" : "min-h-28"} px-3 py-2 text-sm text-base-content outline-none [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5`}
        />
      </div>
    </div>
  );
}

export function RichTextContent({ value }: { value: string }) {
  return (
    <div
      className="text-sm text-base-content/70 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
    />
  );
}
