export function trackerMiddleware(whatsapp) {
  return (req, res, next) => {
    const storage = whatsapp?.storage;
    if (!storage) return next();

    const header = req.headers.authorization || "";
    const token = header.replace(/^Bearer\s+/i, "").trim();

    storage.addIntegration({
      system: req.headers["x-system-name"] || req.headers["origin"] || req.headers["referer"] || "API desconhecida",
      url: req.headers["origin"] || req.headers["referer"] || "",
      apiKey: token || "",
      endpoint: req.originalUrl || req.url || "",
    });

    next();
  };
}
