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
  const isFirstLoad = useRef(true);

  // Only set initial HTML once (on first mount)
  useEffect(() => {
    if (isFirstLoad.current && editorRef.current) {
      editorRef.current.innerHTML = value || "";
      isFirstLoad.current = false;
    }
  }, [value]);

  const exec = (cmd: string) => {
    document.execCommand(cmd);
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex gap-2 mb-2 border p-2 rounded">
        <button
          onClick={() => exec("bold")}
          className="px-2 py-1 border rounded"
        >
          B
        </button>
        <button
          onClick={() => exec("italic")}
          className="px-2 py-1 border rounded"
        >
          I
        </button>
        <button
          onClick={() => exec("underline")}
          className="px-2 py-1 border rounded"
        >
          U
        </button>
        <button
          onClick={() => exec("insertUnorderedList")}
          className="px-2 py-1 border rounded"
        >
          •
        </button>
        <button
          onClick={() => exec("insertOrderedList")}
          className="px-2 py-1 border rounded"
        >
          1.
        </button>
      </div>

      {/* ContentEditable Div (UNCONTROLLED) */}
      <div
        ref={editorRef}
        contentEditable
        className="border rounded p-3 min-h-[200px] bg-white"
        onInput={handleInput}
      />
    </div>
  );
}
