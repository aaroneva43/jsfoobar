import React, { useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  UIRouter,
  UIView,
  useSrefActive,
  pushStateLocationPlugin,
} from "@uirouter/react";
import loadable from "@loadable/component";

import './style.css';

const App = () => {
  const activeClass = "active";
  const helloSref = useSrefActive("hello", null, activeClass);
  const aboutSref = useSrefActive("about", null, activeClass);

  return (
    <div>
      <a {...helloSref}>Hello</a>&nbsp;
      <a {...aboutSref}>About</a>
      <UIView />
    </div>
  );
};

const Hello = loadable(() => import('./app/Hello'));
const About = loadable(() => import('./app/About'));

ReactDOM.createRoot(document.getElementById("root")).render(
  <UIRouter
    plugins={[pushStateLocationPlugin]}
    states={[
      {
        name: "hello",
        url: "/hello",
        component: ()=> <Hello />,
        // lazyLoad: (trans, state) => import("./app/common1")
        // lazyLoad: (trans, state) => import("./app/common1").then(() => import("./app/common2")),
      },
      {
        name: "about",
        url: "/about",
        component: ()=> <About />,
      },
      {
        name: "world",
        url: "/hello/:world",
        component: ()=> <World />,
        resolve: [{
          deps: ['$transition$'],
        }]
      },
    ]}
  >
    <App />
  </UIRouter>
);
