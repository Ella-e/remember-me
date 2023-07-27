"use client";
import React from "react";
import mermaid from "mermaid";
import "./page.css";

// mermaid.initialize({
//   startOnLoad: true,
//   securityLevel: "loose",
// });

class MermaidChartComponent extends React.Component {
  componentDidMount() {
    window.callback = this.props.callBack;
    mermaid.contentLoaded();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.chart !== this.props.chart) {
      document
        .getElementById("mermaid-chart")
        .removeAttribute("data-processed");
      window.callback = this.props.callBack;
      mermaid.contentLoaded();
    }
  }

  render() {
    return (
      <div
        id="mermaid-chart"
        className="mermaid mermaidJS"
        style={{ maxWidth: "100%", maxHeight: "100px" }}
      // style={{ width: "fit-content", height: "100vh" }}
      >
        {this.props.chart}
      </div >
    );
  }
}

export default MermaidChartComponent;
