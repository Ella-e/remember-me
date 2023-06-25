import dynamic from "next/dynamic";
import React from "react";

const NoSsr = (props) => {
  // eslint-disable-next-line react/prop-types
  return <React.Fragment>{props.children}</React.Fragment>;
};

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false,
});
