import React from "react";
import Loadable from "react-loadable";

const c = await import("./common1");
console.log(c);
export default () => <h3>Its the UI-Router hello world app!</h3>;

