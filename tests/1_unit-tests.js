/*
*
*
*       FILL IN EACH UNIT TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]----
*       (if additional are added, keep them at the very end!)
*/


var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Unit Tests', function() {
  suite('Test Helmet configuration', function() {
    test("Only allow your site to be loading in an iFrame on your own pages", function(done) {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          assert.isTrue(res.headers['x-frame-options'].includes('SAMEORIGIN'));
          done();
        })
    });
    test("Do not allow DNS prefetching.", function(done) {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          assert.isTrue(res.headers['x-dns-prefetch-control'].includes('off'));
          done();
        })
    });
    test("Only allow your site to send the referrer for your own pages.", function(done) {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          assert.isTrue(res.headers['referrer-policy'].includes('same-origin'))
          done();
        })
    });

  })
});