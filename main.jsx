import React from "react";
import ReactDOM from "react-dom/client";
import {
  UIRouter,
  UIView,
  useSrefActive,
  pushStateLocationPlugin,
} from "@uirouter/react";
import Loadable from "react-loadable";

import("./style.css");
import Hello from "./app/Hello";
import About from "./app/About";

const Test = Loadable({
  loader: () => import("./app/Hello"),
  loading: () => <div>loading</div>,
});

class MyComponent extends React.Component {
  render() {
    return <Test />;
  }
}

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

ReactDOM.createRoot(document.getElementById("root")).render(
  <MyComponent />
  // <UIRouter
  //   plugins={[pushStateLocationPlugin]}
  //   states={[
  //     {
  //       name: "hello",
  //       url: "/hello",
  //       component: Loadable({
  //         loader: () => import("./app/Hello"),
  //         loading() {
  //           return <div>Loading...</div>;
  //         },
  //       }),
  //       // lazyLoad: (trans, state) => import("./app/common1")
  //       // lazyLoad: (trans, state) => import("./app/common1").then(() => import("./app/common2")),
  //     },
  //     { name: "about", url: "/about", component: Test },
  //   ]}
  // >
  //   <App />
  // </UIRouter>
);
