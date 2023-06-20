// import React, { useEffect } from "react";
// import mermaid from "mermaid";

// const MermaidChart = ({ chartDefinition, callBack }) => {
//   useEffect(() => {
//     mermaid.initialize({
//       startOnLoad: true,
//       securityLevel: "loose",
//     });

//     window.callback = callBack;
//     mermaid.contentLoaded();

//   }, []);

//   return <div className="mermaid" style={{ width: "fit-content", height: "fit-content" }}>{chartDefinition}</div>;
// };

// export default MermaidChart;

import React from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});

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
        className="mermaid"
        style={{ width: "fit-content", height: "fit-content" }}
      >
        {this.props.chart}
      </div>
    );
  }
}

export default MermaidChartComponent;
