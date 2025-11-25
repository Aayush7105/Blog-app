"use client";

import React, { useRef, useEffect } from "react";

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

  // Execute formatting commands
  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="w-full">
      {/* Minimal Toolbar */}
      <div
        className="
          flex items-center gap-1 mb-3 px-2 py-1
          bg-white/70 backdrop-blur-md
          border border-neutral-200 
          rounded-xl shadow-sm
        "
      >
        <Icon icon="B" onClick={() => exec("bold")} />
        <Icon icon="I" onClick={() => exec("italic")} />
        <Icon icon="U" onClick={() => exec("underline")} />

        <Divider />

        <Icon icon="H1" onClick={() => exec("formatBlock", "<h2>")} />
        <Icon icon="H2" onClick={() => exec("formatBlock", "<h3>")} />

        <Divider />

        <Icon icon="❝" onClick={() => exec("formatBlock", "<blockquote>")} />
        <Icon icon="</>" onClick={() => exec("formatBlock", "<pre>")} />

        <Divider />

        <Icon icon="↺" onClick={() => exec("undo")} />
        <Icon icon="↻" onClick={() => exec("redo")} />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="
          border border-neutral-300 rounded-2xl p-5
          bg-white shadow-sm
          min-h-[220px]
          focus:outline-none focus:ring-2 focus:ring-neutral-300
          text-[16px] leading-relaxed font-[system-ui]
        "
      />
    </div>
  );
}

/* Enhanced Icon Button - FIXED for bullets */
function Icon({ onClick, icon }: { onClick: () => void; icon: string }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()} // ⭐ Prevent focus loss (bullets work)
      onClick={onClick}
      className="
        px-2 py-1 text-neutral-700 text-[13px]
        rounded-md
        hover:bg-neutral-200/70 active:bg-neutral-300
        transition-all select-none
      "
    >
      {icon}
    </button>
  );
}

/* Clean divider */
function Divider() {
  return <div className="h-4 w-[1px] bg-neutral-300 mx-1"></div>;
}
