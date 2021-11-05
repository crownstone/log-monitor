import {Grid} from "@mui/material";
import React from "react";

export function AnimatedGrid(props) {
  let animationStyle = {transition: 'all .25s ease-in-out'}
  let fastAnimationStyle = {transition: 'all .125s ease-in-out'}

  let style = props.style;

  if (props.fast) {
    style = {...fastAnimationStyle, ...style}
  }
  else {
    style = {...animationStyle, ...style}
  }

  let updatedProps = {...props};
  updatedProps.style = style;
  delete updatedProps.fast;

  return (
    <Grid {...updatedProps} />
  );
}
