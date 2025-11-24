"use client";

import dynamic from "next/dynamic";
import React from "react";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const BlogBox: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || ""}
      initialValue={value}
      init={{
        height: 300,
        menubar: false,
        plugins: ["lists", "link", "autolink", "preview"],
        toolbar:
          "undo redo | bold italic underline | bullist numlist | link | preview",
      }}
      onEditorChange={(content) => onChange(content)}
    />
  );
};

export default React.memo(BlogBox);
