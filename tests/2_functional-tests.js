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
  suiteTeardown(() => {
    db.testDeleteBoard(TestBoard);
  })

  suite('API ROUTING FOR /api/threads/:board', function() {
    let ThreadID = ""
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
            .end((_, res) => {
            assert.equal(res.status, 302);
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
    });
    suite('POST', function() {
      test(`Posting To ${RepliesPath}board to create a reply to a thread`, function(done) {
        chai.request(server)
          .post(RepliesPath + TestBoard)
          .send({
            thread_id: threadInfo.doc._id,
            text: 'Reply 1',
            delete_password: 'testPasswd',
          })
          .redirects(0)
          .end((err, res) => {
            // if (res.status === 500) console.log(err)
            assert.equal(res.status, 302);
            done()
          })
      });
    });
    suite('GET', function() {

    });

    suite('PUT', function() {

    });

    suite('DELETE', function() {

    });

  });


});

