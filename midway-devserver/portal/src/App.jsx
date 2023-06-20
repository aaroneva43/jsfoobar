import { useState, useEffect } from "react";
import Table from "rc-table";
import _get from "lodash/get";

function copyToClipboard(textToCopy) {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // text area method
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand("copy") ? res() : rej();
      textArea.remove();
    });
  }
}

function App() {
  const [conn, setConn] = useState(0);
  useEffect(() => {
    fetch("api/connections")
      .then((r) => r.json())
      .then((r) => {
        setConn(
          _get(r, "proxies", [])
            .filter(
              (itm) => itm.status === "online" && itm.conf.remote_port !== 8199
            )
            .map((itm) => ({
              ...itm,
              remote_port: itm.conf.remote_port,
              operations: `${window.location.hostname}:${itm.conf.remote_port}`,
            }))
        );
      });
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 600,
    },
    {
      title: "Port",
      dataIndex: "remote_port",
      key: "port",
      width: 100,
    },
    {
      title: "Operations",
      dataIndex: "",
      key: "operations",
      render: (val) => (
        <>
          <a
            href="#"
            onClick={() => {console.log(val?.operations);
              copyToClipboard(val?.operations);
            }}
          >
            Copy
          </a>
        </>
      ),
    },
  ];

  return (
    <>
      <h5>Shared Proxies</h5>
      <Table columns={columns} data={conn} />
    </>
  );
}

export default App;
