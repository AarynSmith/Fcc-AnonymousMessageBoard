const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.DB;

mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const threadSchema = new mongoose.Schema({
  board: {type: String, required: true},
  text: {type: String, required: true},
  created_on: {type: Date, default: Date.now},
  bumped_on: {type: Date, default: Date.now},
  reported: {type: Boolean, default: false},
  delete_password: {type: String, required: true},
  reply_count: {type: Number, default: 0},
  replies: [{
    text: {type: String, required: true},
    created_on: {type: Date, default: Date.now},
    reported: {type: Boolean, default: false},
    delete_password: {type: String, required: true},
  }]
})

const threadProjection = {
  reported: 0,
  delete_password: 0,
  'replies.reported': 0,
  'replies.delete_password': 0,
};

const Thread = mongoose.model('thread', threadSchema);

module.exports = function() {
  // Threads Functions
  this.createThread = async (board, thread) => { // POST
    const threadDoc = new Thread({board, ...thread})
    try {
      const doc = await threadDoc.save();
      return {doc};
    } catch (err) {
      return {err};
    }
  }

  this.getThreads = async (board) => { // GET
    const threads = Thread.find({board}, threadProjection)
      .sort({bumped_on: 'desc'})
      .limit(10)
      .where('replies').slice(-3)
    try {
      const list = await threads.exec();
      return list;
    } catch (err) {
      return {err};
    }
  }

  this.deleteThread = async (board, thread) => { // DELETE
    const threadQuery = Thread.findOneAndDelete({
      board,
      _id: ObjectId(thread.thread_id),
      delete_password: thread.delete_password,
    })
    try {
      const res = await threadQuery.exec();
      return {res}
    } catch (err) {
      return {err};
    }
  }

  this.reportThread = async (board, thread) => { // PUT
    const threadQuery = Thread.findOneAndUpdate({
      board,
      _id: ObjectId(thread.thread_id)
    }, {
      $set: {reported: true}
    }, {new: true})
    try {
      doc = await threadQuery.exec();
      return {doc}
    } catch (err) {
      return {err}
    }
  }

  // Replies Functions
  this.addReply = async (reply) => { // POST
    const threadDoc = Thread.findByIdAndUpdate(reply.thread_id,
      {
        $set: {bumped_on: Date.now()},
        $inc: {reply_count: 1},
        $push: {
          replies: {
            text: reply.text,
            delete_password: reply.delete_password
          }
        }
      },
      {new: true},
    );
    try {
      const doc = await threadDoc.exec();
      doc.replies = doc.replies.slice(-1);
      return {doc};
    } catch (err) {
      return {err};
    }
  }

  this.getReplies = async (board, thread) => { // GET
    const threadQuery = Thread.findById(thread, threadProjection)
    try {
      const doc = await threadQuery.exec();
      return doc
    } catch (err) {
      return {err}
    }
  }

  this.deleteReply = async (board, reply) => { // DELETE
    const replyQuery = Thread.findOneAndUpdate(
      {
        board,
        "_id": reply.thread_id,
        "replies._id": reply.reply_id,
        "replies.delete_password": reply.delete_password,
      },
      {
        "$set": {
          "replies.$.text": "[deleted]"
        }
      }, {
      new: true,
    })
    try {
      const doc = await replyQuery.exec();
      return {doc}
    } catch (err) {
      return {err}
    }
  }

  this.reportReply = async (board, reply) => { // PUT
    const replyQuery = Thread.findOneAndUpdate(
      {
        board,
        "_id": reply.thread_id,
        "replies._id": reply.reply_id,
      },
      {
        "$set": {
          "replies.$.reported": true
        }
      }, {
      new: true,
    })
    try {
      const doc = await replyQuery.exec();
      return {doc}
    } catch (err) {
      return {err}
    }
  }

  // Test Functions
  this.testDeleteBoard = (board) => {
    Thread.deleteMany({board}, (err, data) => {
      console.log(`Deleted ${data.deletedCount} threads from ${board}`)
      return data;
    })
  }
}