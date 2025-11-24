"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

interface Props {
  initialContent?: string; // only used once on mount
  onChange?: (value: string) => void; // debounced
  apiKey?: string;
}

const BlogBox: React.FC<Props> = ({
  initialContent = "",
  onChange,
  apiKey = "",
}) => {
  const firstMountRef = useRef(true);
  const debounceRef = useRef<number | null>(null);

  // Handler invoked by TinyMCE on every keystroke
  const handleEditorChange = (content: string) => {
    // debounce parent updates to avoid re-renders on every keypress
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      onChange?.(content);
    }, 250); // 250ms debounce (adjustable)
  };

  // We pass initialValue only once (TinyMCE uses it on mount).
  // If the parent later opens editor for another post, re-mounting modal is ok.
  return (
    <Editor
      apiKey={apiKey}
      initialValue={initialContent}
      init={{
        height: 320,
        menubar: false,
        plugins: [
          "advlist autolink lists link image charmap preview anchor",
          "searchreplace visualblocks code fullscreen",
          "insertdatetime media table help wordcount",
        ],
        toolbar:
          "undo redo | formatselect | bold italic underline | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help",
      }}
      onEditorChange={handleEditorChange}
    />
  );
};

export default React.memo(BlogBox);
