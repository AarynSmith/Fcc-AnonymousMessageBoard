'use strict';


const databaseHandler = require('../controllers/databaseHandler');
const db = new databaseHandler();

module.exports = function(app) {
  app.route('/api/threads/:board')
    .post(async (req, res) => {
      const dbRes = await db.createThread(req.params.board, req.body);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.redirect(`/b/${req.params.board}/`);
    })
    .get(async (req, res) => {
      const dbRes = await db.getThreads(req.params.board);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.json(dbRes);
    })
    .delete(async (req, res) => {
      const dbRes = await db.deleteThread(req.params.board, req.body);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err);
      if (dbRes.res) return res.send('success');
      res.send('incorrect password');
    })
    .put(async (req, res) => {
      const dbRes = await db.reportThread(req.params.board, req.body);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err);
      res.send('success');
    })

  app.route('/api/replies/:board')
    .post(async (req, res) => {
      const dbRes = await db.addReply(req.body)
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.redirect(`/b/${req.params.board}/${req.body.thread_id}/`);
    })
    .get(async (req, res) => {
      const dbRes = await db.getReplies(req.params.board, req.query.thread_id)
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err)
      res.json(dbRes);
    })
    .delete(async (req, res) => {
      const dbRes = await db.deleteReply(req.params.board, req.body);
      if (dbRes.err) return res.status(500).send('Server Error: ' + db.err);
      if (dbRes.doc) return res.send('success');
      res.send('incorrect password');
    })
};
