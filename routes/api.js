'use strict';


const databaseHandler = require('../controllers/databaseHandler');
const db = new databaseHandler();

module.exports = function(app) {
  app.route('/api/threads/:board')
    .post(async (req, res) => {
      const dbRes = await db.createThread(req.params.board, req.body);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.redirect(`/b/${req.params.board}`);
    })
    .get(async (req, res) => {
      const dbRes = await db.getThreads(req.params.board);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.json(dbRes);
    })

  app.route('/api/replies/:board')
    .post(async (req, res) => {
      const dbRes = await db.addReply(req.body)
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
    })
    .get(async (req, res) => {
      const dbRes = await db.getReplies(req.params.board, req.query.thread_id)
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.json(dbRes);
    })
};
