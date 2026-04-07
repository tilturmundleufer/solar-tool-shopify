/**
 * Optional: PDF serverseitig (Platzhalter).
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(501).json({
    error: 'Not implemented',
    message: 'Server-PDF ist optional. Aktuell PDF clientseitig (jsPDF/html2canvas nach Lazy-Load).',
  });
};
