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
  suite('API ROUTING FOR /api/threads/:board', function() {
    let ThreadID = ""
    suite('POST', function() {
      test(`Posting To ${ThreadsPath}board to create a new thread`, function(done) {
        chai.request(server)
          .post(ThreadsPath + TestBoard)
          .send({
            text: 'Threads Test Thread',
            delete_password: 'testPasswd',
          })
          .redirects(0)
          .end((err, res) => {
            assert.equal(res.status, 302);
            done()
          })
      });
    });

    suite('GET', function() {

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

