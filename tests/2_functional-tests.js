var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

const ThreadsPath = '/api/threads/'

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    suite('POST', function() {
      test(`Posting To ${ThreadsPath} test to create a new thread`, function(done) {
        chai.request(server)
          .post(ThreadsPath + 'test')
          .send({
            text: 'Test Thread 1',
            delete_password: 'testPasswd',
          })
          .redirects(0)
          .end((err, res) => {
            if (err) console.log(err.text);
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

    suite('POST', function() {

    });

    suite('GET', function() {

    });

    suite('PUT', function() {

    });

    suite('DELETE', function() {

    });

  });

});
