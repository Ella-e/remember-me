import React from "react";
import mermaid from "mermaid";
import PropTypes from 'prop-types';

mermaid.initialize({
  startOnLoad: true,
  securityLevel: "loose",
});


class MermaidChartComponent extends React.Component {

  static get propTypes() {
    return {
      callBack: PropTypes.func,
      chart: PropTypes.any
    };
  }

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
