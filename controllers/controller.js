const db = require('../databases/configDatabase');

exports.getUserPosition = (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = 'SELECT positions FROM users WHERE id = ?';
  db.query(query, [userId], (error, results, fields) => {
    if (error) {
      console.error('Error fetching user position from MySQL:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const positions = JSON.parse(results[0].positions);
    const { longitude, latitude } = positions;

    res.json({ userId, longitude, latitude });
  });
};

exports.getAllUserPositions = (req, res) => {
  const query = 'SELECT id, positions FROM users';
  db.query(query, (error, results, fields) => {
    if (error) {
      console.error('Error fetching users positions from MySQL:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const userPositions = results.map(user => {
      const { id, positions } = user;
      const { longitude, latitude } = JSON.parse(positions);
      return { userId: id, longitude, latitude };
    });

    res.json(userPositions);
  });
};
