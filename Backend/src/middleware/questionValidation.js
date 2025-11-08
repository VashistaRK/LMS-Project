export function validateQuestion(req, res, next) {
  const { type, questionText, options, correctAnswer, genre } = req.body;

  if (!type || !['mcq', 'text'].includes(type)) {
    return res.status(400).json({ error: 'type must be "mcq" or "text"' });
  }
  if (!questionText || typeof questionText !== 'string' || !questionText.trim()) {
    return res.status(400).json({ error: 'questionText is required' });
  }

  if (genre && typeof genre !== 'string') {
    return res.status(400).json({ error: 'genre must be a string' });
  }

  if (type === 'mcq') {
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'mcq questions require options array with at least 2 items' });
    }
    if (typeof correctAnswer !== 'number' || correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ error: 'correctAnswer must be a valid option index' });
    }
  } else {
    if (options && options.length > 0) {
      return res.status(400).json({ error: 'text questions must not have options' });
    }
  }

  next();
}