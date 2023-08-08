"use client";
import React from "react";
import mermaid from "mermaid";
import "./page.css";
import {
  TransformWrapper,
  TransformComponent,
  useControls
} from "react-zoom-pan-pinch";
import Link from "next/link";

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <>
      <Link onClick={() => zoomIn()} href="" style={{ marginRight: "10px" }}>ZOOM IN</Link>
      <Link onClick={() => zoomOut()} href="" style={{ marginRight: "10px" }}>ZOOM OUT</Link>
      <Link onClick={() => resetTransform()} href="">RESET</Link>
    </>
  );
};

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
      <div className="react-transform-wrapper">
        <TransformWrapper centerOnInit>
          <TransformComponent>
            <div
              id="mermaid-chart"
              className="mermaid mermaidJS"
            >
              {this.props.chart}
            </div >
          </TransformComponent>
          <Controls />
        </TransformWrapper>
      </div>
    );
  }
}

export default MermaidChartComponent;
