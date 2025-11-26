"use client";

import React, { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Quote,
  List,
  ListOrdered,
  Code,
  RotateCcw,
  RotateCw,
} from "lucide-react";

/**
 * CustomEditor
 * - uncontrolled contentEditable
 * - initial content applied only once
 * - saves/restores selection when executing commands
 * - toolbar buttons use onMouseDown to prevent blur
 */
export default function CustomEditor({
  value,
  onChange,
}: {
  value?: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const firstLoad = useRef(true);
  const savedRangeRef = useRef<Range | null>(null);

  // set initial content only once
  useEffect(() => {
    if (firstLoad.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      firstLoad.current = false;
    }
  }, [value]);

  // Save selection when editor loses selection; called from onMouseUp / keyup
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRangeRef.current;
    const sel = window.getSelection();
    if (!range || !sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // Ensures editor has focus and selection restored before executing
  const execCommandSafe = (cmd: string, val?: string | null) => {
    // focus editor
    editorRef.current?.focus();
    // restore selection (if any)
    restoreSelection();
    // use execCommand; some browsers expect commands like "H1" for formatBlock
    document.execCommand(cmd, false, val === null ? undefined : val);
    // after change, save selection again (so caret remains)
    saveSelection();
    // notify parent
    onChange(editorRef.current?.innerHTML || "");
  };

  // Input handler (typing)
  const handleInput = () => {
    // update saved selection on input
    saveSelection();
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div
        className="
          flex flex-wrap items-center gap-2 mb-3 px-3 py-2
          bg-white border border-neutral-300 rounded-lg shadow-sm
        "
      >
        {/* Heads-up: onMouseDown prevents toolbar click from blurring editor */}
        <SelectHeading exec={execCommandSafe} />

        <IconBtn
          ariaLabel="Bold"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("bold")}
        >
          <Bold size={16} />
        </IconBtn>

        <IconBtn
          ariaLabel="Italic"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("italic")}
        >
          <Italic size={16} />
        </IconBtn>

        <IconBtn
          ariaLabel="Underline"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("underline")}
        >
          <Underline size={16} />
        </IconBtn>

        <IconBtn
          ariaLabel="Strikethrough"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("strikeThrough")}
        >
          <Strikethrough size={16} />
        </IconBtn>

        <div className="w-[1px] h-6 bg-neutral-200 mx-1" />

        <IconBtn
          ariaLabel="Code block"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("formatBlock", "PRE")}
        >
          <Code size={16} />
        </IconBtn>

        <IconBtn
          ariaLabel="Blockquote"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("formatBlock", "BLOCKQUOTE")}
        >
          <Quote size={16} />
        </IconBtn>

        <div className="w-[1px] h-6 bg-neutral-200 mx-1" />

        {/* LISTS: works because we prevent blur and restore selection */}
        <IconBtn
          ariaLabel="Bulleted list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("insertUnorderedList")}
        >
          <List size={16} />
        </IconBtn>

        <IconBtn
          ariaLabel="Numbered list"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("insertOrderedList")}
        >
          <ListOrdered size={16} />
        </IconBtn>

        <div className="w-[1px] h-6 bg-neutral-200 mx-1" />

        <IconBtn
          ariaLabel="Undo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("undo")}
        >
          <RotateCcw size={16} />
        </IconBtn>

        <IconBtn
          ariaLabel="Redo"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommandSafe("redo")}
        >
          <RotateCw size={16} />
        </IconBtn>
      </div>

      {/* editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        className="min-h-[200px] p-4 border border-neutral-300 rounded-lg bg-white shadow-sm text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-300"
      />
    </div>
  );
}

/* small selectable heading dropdown that uses proper H tokens (H1/H2/H3/P) */
function SelectHeading({
  exec,
}: {
  exec: (cmd: string, val?: string | null) => void;
}) {
  return (
    <select
      onMouseDown={(e) => e.preventDefault()}
      onChange={(e) => {
        const val = e.target.value;
        exec("formatBlock", val === "P" ? "P" : val); // P or H1/H2/H3
        // reset to P after applying to avoid accidental repeated changes
        (e.target as HTMLSelectElement).value = "P";
      }}
      className="border border-neutral-200 px-2 py-1 rounded text-sm"
      aria-label="Heading"
      defaultValue="P"
    >
      <option value="P">Aa</option>
      <option value="H1">H1</option>
      <option value="H2">H2</option>
      <option value="H3">H3</option>
    </select>
  );
}

/* icon button component */
function IconBtn({
  children,
  onClick,
  onMouseDown,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  onMouseDown?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onMouseDown={onMouseDown}
      onClick={onClick}
      className="p-1.5 rounded-md hover:bg-neutral-200 transition"
    >
      {children}
    </button>
  );
}
