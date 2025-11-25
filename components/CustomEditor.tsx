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

  // Set initial content once
  useEffect(() => {
    if (firstLoad.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      firstLoad.current = false;
    }
  }, [value]);

  const exec = (cmd: string, val: any = null) => {
    document.execCommand(cmd, false, val);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="w-full">
      {/* Minimalist Toolbar */}
      <div
        className="
        flex gap-1 mb-3 px-2 py-1
        bg-white/70 backdrop-blur 
        border border-neutral-200 
        rounded-xl shadow-sm
      "
      >
        <Icon onClick={() => exec("bold")} icon="B" />
        <Icon onClick={() => exec("italic")} icon="I" />
        <Icon onClick={() => exec("underline")} icon="U" />

        <Divider />

        <Icon onClick={() => exec("formatBlock", "<h2>")} icon="H1" />
        <Icon onClick={() => exec("formatBlock", "<h3>")} icon="H2" />

        <Divider />

        <Icon onClick={() => exec("insertUnorderedList")} icon="•" />
        <Icon onClick={() => exec("insertOrderedList")} icon="1." />

        <Divider />

        <Icon onClick={() => exec("formatBlock", "<blockquote>")} icon="❝" />
        <Icon onClick={() => exec("formatBlock", "<pre>")} icon="</>" />

        <Divider />

        <Icon onClick={() => exec("undo")} icon="↺" />
        <Icon onClick={() => exec("redo")} icon="↻" />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="
          whitespace-pre-wrap
          border border-neutral-300
          rounded-2xl p-5
          bg-white
          shadow-sm
          min-h-[220px]
          focus:outline-none
          focus:ring-2 focus:ring-neutral-300
          text-[16px] leading-relaxed
          font-[system-ui]
        "
        onInput={handleInput}
      />
    </div>
  );
}

/* Modern minimal icon button */
function Icon({ onClick, icon }: { onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className="
        px-2 py-1
        text-neutral-700 text-[13px]
        rounded-lg
        hover:bg-neutral-200/80 
        active:bg-neutral-300
        transition-all
      "
    >
      {icon}
    </button>
  );
}

/* Clean divider */
function Divider() {
  return <div className="w-[1px] bg-neutral-300 mx-1"></div>;
}
