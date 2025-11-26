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
} from "lucide-react";

export default function CustomEditor({
  value,
  onChange,
}: {
  value?: string;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const firstLoad = useRef(true);

  // Load initial value only once
  useEffect(() => {
    if (firstLoad.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      firstLoad.current = false;
    }
  }, [value]);

  const exec = (cmd: string, val?: string | null) => {
    document.execCommand(cmd, false, val ?? undefined);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="w-full">
      {/* Toolbar styled like your screenshot */}
      <div
        className="
        flex items-center gap-2 mb-3 px-3 py-2
        bg-white border border-neutral-300
        rounded-lg shadow-sm
      "
      >
        {/* Headings */}
        <Dropdown />

        <IconButton icon={<Bold size={16} />} onClick={() => exec("bold")} />
        <IconButton
          icon={<Italic size={16} />}
          onClick={() => exec("italic")}
        />
        <IconButton
          icon={<Underline size={16} />}
          onClick={() => exec("underline")}
        />
        <IconButton
          icon={<Strikethrough size={16} />}
          onClick={() => exec("strikeThrough")}
        />

        <IconDivider />

        <IconButton
          icon={<Code size={16} />}
          onClick={() => exec("formatBlock", "<pre>")}
        />

        <IconButton
          icon={<Quote size={16} />}
          onClick={() => exec("formatBlock", "<blockquote>")}
        />

        <IconDivider />

        {/* BULLET LIST (FULLY WORKING) */}
        <IconButton
          icon={<List size={16} />}
          onClick={() => exec("insertUnorderedList")}
        />

        {/* ORDERED LIST (WORKS TOO) */}
        <IconButton
          icon={<ListOrdered size={16} />}
          onClick={() => exec("insertOrderedList")}
        />
      </div>

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="
          min-h-[200px] p-4
          border border-neutral-300 rounded-lg
          shadow-sm bg-white
          focus:outline-none focus:ring-2 focus:ring-neutral-300
          leading-relaxed text-[15px]
        "
      />
    </div>
  );
}

/* Icon Button */
function IconButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()} // ⭐ FIXES BULLETS
      onClick={onClick}
      className="
        p-1.5 rounded-md
        hover:bg-neutral-200 active:bg-neutral-300
        transition text-neutral-700
      "
    >
      {icon}
    </button>
  );
}

/* Divider */
function IconDivider() {
  return <div className="w-[1px] h-4 bg-neutral-300 mx-1" />;
}

/* Heading Dropdown */
function Dropdown() {
  return (
    <select
      onMouseDown={(e) => e.preventDefault()} // prevent blur
      onChange={(e) => {
        document.execCommand("formatBlock", false, `<${e.target.value}>`);
      }}
      className="
        text-sm border border-neutral-300 rounded px-2 py-1
        bg-white hover:bg-neutral-100 transition
      "
    >
      <option value="div">Aa</option>
      <option value="h1">H1</option>
      <option value="h2">H2</option>
      <option value="h3">H3</option>
    </select>
  );
}
