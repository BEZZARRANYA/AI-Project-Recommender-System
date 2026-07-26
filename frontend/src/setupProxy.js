const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/recommend", "/feedback"],
    createProxyMiddleware({
      target: "http://127.0.0.1:5001",
      changeOrigin: true,
      ws: true,
      logLevel: "warn"
    })
  );
};
