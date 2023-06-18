import React, { useEffect } from "react";
import mermaid from "mermaid";

const MermaidChart = ({ chartDefinition, callBack }) => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
    });

    window.callback = callBack;
    mermaid.contentLoaded();

  }, []);

  return <div className="mermaid" style={{ width: "fit-content", height: "fit-content" }}>{chartDefinition}</div>;
};

export default MermaidChart;