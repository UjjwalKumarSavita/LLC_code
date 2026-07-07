import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";

const listenHost = process.env.LLC_HTTPS_HOST || "127.0.0.1";
const listenPort = Number(process.env.LLC_HTTPS_PORT || 3000);
const targetHost = process.env.LLC_WEB_TARGET_HOST || "127.0.0.1";
const targetPort = Number(process.env.LLC_WEB_TARGET_PORT || 3001);
const pfxPath = process.env.LLC_HTTPS_PFX;
const passphrase = process.env.LLC_HTTPS_PFX_PASSPHRASE || "";

if (!pfxPath) {
  throw new Error("LLC_HTTPS_PFX is required");
}

const server = https.createServer(
  {
    pfx: fs.readFileSync(pfxPath),
    passphrase,
  },
  (clientRequest, clientResponse) => {
    const headers = {
      ...clientRequest.headers,
      host: `localhost:${listenPort}`,
      "x-forwarded-host": `localhost:${listenPort}`,
      "x-forwarded-port": String(listenPort),
      "x-forwarded-proto": "https",
    };

    const upstream = http.request(
      {
        host: targetHost,
        port: targetPort,
        method: clientRequest.method,
        path: clientRequest.url,
        headers,
      },
      (upstreamResponse) => {
        clientResponse.writeHead(
          upstreamResponse.statusCode || 502,
          upstreamResponse.headers,
        );
        upstreamResponse.pipe(clientResponse);
      },
    );

    upstream.on("error", () => {
      if (!clientResponse.headersSent) {
        clientResponse.writeHead(502, { "content-type": "text/plain" });
      }
      clientResponse.end("Local HTTPS proxy could not reach the web app.");
    });

    clientRequest.pipe(upstream);
  },
);

server.on("upgrade", (request, socket, head) => {
  const upstream = net.connect(targetPort, targetHost, () => {
    upstream.write(
      `${request.method} ${request.url} HTTP/${request.httpVersion}\r\n` +
        Object.entries({
          ...request.headers,
          host: `localhost:${listenPort}`,
          "x-forwarded-host": `localhost:${listenPort}`,
          "x-forwarded-port": String(listenPort),
          "x-forwarded-proto": "https",
        })
          .map(([key, value]) => `${key}: ${value}`)
          .join("\r\n") +
        "\r\n\r\n",
    );
    if (head.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });

  upstream.on("error", () => socket.destroy());
});

server.listen(listenPort, listenHost, () => {
  console.log(
    `LLC_code local HTTPS proxy listening at https://localhost:${listenPort}`,
  );
});
