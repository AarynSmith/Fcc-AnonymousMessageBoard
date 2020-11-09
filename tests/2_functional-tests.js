var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

var databaseHandler = require('../controllers/databaseHandler');
var db = new databaseHandler();

const TestBoard = "MochaTestBoard" + Date.now()
const ThreadsPath = '/api/threads/';
const RepliesPath = '/api/replies/';
chai.use(chaiHttp);

suite('Functional Tests', function() {
  suiteTeardown(() => db.testDeleteBoard(TestBoard))
  suite('API ROUTING FOR /api/threads/:board', function() {
    suite('POST', function() {
      test(`Posting To ${ThreadsPath}board to create a new thread`,
        function(done) {
          chai.request(server)
            .post(ThreadsPath + TestBoard)
            .send({
              text: 'Threads Test Thread',
              delete_password: 'testPasswd',
            })
            .redirects(0)
            .end((_err, res) => {
              assert.equal(res.status, 302);
              assert.equal(res.header.location, `/b/${TestBoard}/`);
              done()
            })
        });
    });
    suite('GET', function() {
      suiteSetup(async () => {
        threadInfo = await db.createThread(TestBoard, {
          text: 'Get Thread test thread',
          delete_password: 'testPasswd',
        })
        for (let i = 0; i < 12; i++) {
          db.createThread(TestBoard, {
            text: `Get Thread test thread ${i}`,
            delete_password: 'testPasswd',
          })
        }
        for (let i = 0; i < 5; i++) {
          db.addReply({
            thread_id: threadInfo.doc._id,
            text: `Reply ${i}`,
            delete_password: 'testPasswd',
          })
        }

      });

      test(`Getting To ${ThreadsPath}board to get list of threads`,
        function(done) {
          chai.request(server)
            .get(ThreadsPath + TestBoard)
            .end((err, res) => {
              assert.isArray(res.body);
              assert.isAtMost(res.body.length, 10);
              res.body.forEach(thread => {
                assert.property(thread, 'text')
                assert.property(thread, 'created_on')
                assert.property(thread, 'bumped_on')
                assert.notProperty(thread, 'reported')
                assert.notProperty(thread, 'delete_password')
                assert.property(thread, 'reply_count')
                assert.property(thread, 'replies')
                assert.isArray(thread.replies)
                assert.isAtMost(thread.replies.length, 3)
                thread.replies.forEach(reply => {
                  assert.property(reply, 'text')
                  assert.property(reply, 'created_on')
                  assert.notProperty(reply, 'reported')
                  assert.notProperty(reply, 'delete_password')
                });
              })
              done();
            })
        });
    });
    suite('DELETE', function() {
      suiteSetup(async () => {
        threadInfo = await db.createThread(TestBoard, {
          text: 'Delete Thread test thread',
          delete_password: 'testPasswd',
        });
      });
      test('Incorrect password', (done) => {
        chai.request(server)
          .delete(ThreadsPath + TestBoard)
          .send({
            thread_id: threadInfo.doc._id,
            delete_password: 'incorrect Password',
          }).end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done()
          })
      });
      test('Correct password', (done) => {
        chai.request(server)
          .delete(ThreadsPath + TestBoard)
          .send({
            thread_id: threadInfo.doc._id,
            delete_password: threadInfo.doc.delete_password,
          }).end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done();
          })
      });
    });
    suite('PUT', function() {
    });
  });
  suite('API ROUTING FOR /api/replies/:board', function() {
    let threadInfo;
    suiteSetup(async () => {
      threadInfo = await db.createThread(TestBoard, {
        text: 'Replies test thread',
        delete_password: 'testPasswd',
      })
      for (let i = 0; i < 5; i++) {
        db.addReply({
          thread_id: threadInfo.doc._id,
          text: `Reply ${i}`,
          delete_password: 'testPasswd',
        })
      }
    });
    suite('POST', function() {
      test(`Posting To ${RepliesPath}board to create a reply to a thread`, function(done) {
        chai.request(server)
          .post(RepliesPath + TestBoard)
          .send({
            thread_id: threadInfo.doc._id,
            text: 'Post Test Reply',
            delete_password: 'testPasswd',
          })
          .redirects(0)
          .end((_err, res) => {
            assert.equal(res.status, 302);
            assert.equal(res.header.location, `/b/${TestBoard}/${threadInfo.doc._id}/`);
            done()
          })
      });
    });
    suite('GET', function() {
      test(`Getting To ${RepliesPath}board?thread_id=ID to get list of replies`,
        function(done) {
          chai.request(server)
            .get(RepliesPath + TestBoard)
            .query({thread_id: threadInfo.doc._id.toString()})
            .end((_err, res) => {
              const thread = res.body
              assert.property(thread, 'text')
              assert.property(thread, 'created_on')
              assert.property(thread, 'bumped_on')
              assert.notProperty(thread, 'reported')
              assert.notProperty(thread, 'delete_password')
              assert.property(thread, 'reply_count')
              assert.property(thread, 'replies')
              assert.isArray(thread.replies)
              assert.equal(thread.replies.length, 6)
              thread.replies.forEach(reply => {
                assert.property(reply, 'text')
                assert.property(reply, 'created_on')
                assert.notProperty(reply, 'reported')
                assert.notProperty(reply, 'delete_password')
              });
              done();
            })
        });
    });
    suite('DELETE', function() {
      let threadInfo;
      let replyInfo;
      suiteSetup(async () => {
        threadInfo = await db.createThread(TestBoard, {
          text: 'Delete Reply test thread',
          delete_password: 'testPasswd',
        });
        for (let i = 0; i < 5; i++) {
          const reply = await db.addReply({
            thread_id: threadInfo.doc._id,
            text: `Reply ${i}`,
            delete_password: `testPasswd ${i}`,
          })
          if (i === 2) replyInfo = reply;
        }
      });
      test('Incorrect password', (done) => {
        chai.request(server)
          .delete(RepliesPath + TestBoard)
          .send({
            thread_id: threadInfo.doc._id,
            reply_id: replyInfo.doc.replies[0]._id,
            delete_password: 'incorrect password'
          }).end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'incorrect password');
            done()
          })
      });
      test('Correct password', (done) => {
        chai.request(server)
          .delete(RepliesPath + TestBoard)
          .send({
            thread_id: threadInfo.doc._id,
            reply_id: replyInfo.doc.replies[0]._id,
            delete_password: replyInfo.doc.replies[0].delete_password
          }).end((_err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'success');
            done()
          })
      });
    });
    suite('PUT', function() {
    });
  });
});
