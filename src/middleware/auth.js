// Simple API-key gate for the generated CRUD routes. Swagger UI stays public
// so the docs are browsable; every data route requires the key when one is
// configured. If API_KEY is unset, auth is disabled (with a startup warning)
// so local/demo usage still works without extra setup.
function apiKeyAuth(apiKey) {
  return function (req, res, next) {
    if (!apiKey) return next();

    const provided = req.get('x-api-key');
    if (provided && provided === apiKey) return next();

    res.status(401).json({ error: 'Unauthorized: missing or invalid x-api-key header' });
  };
}

module.exports = { apiKeyAuth };
