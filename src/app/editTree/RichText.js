import React, { useState } from "react";
import ReactQuill from "react-quill";
import dynamic from "next/dynamic";
import "../../../node_modules/react-quill/dist/quill.snow.css";

const QuillNoSSR = dynamic(import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export const MODULES = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

export const FORMATS = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

const RichText = () => {
  const [value, setValue] = useState("");
  return (
    <div>
      <ReactQuill
        modules={MODULES}
        formats={FORMATS}
        value={value}
        onChange={setValue}
        theme="snow"
      />
      {value}
    </div>
  );
};

export default RichText;
