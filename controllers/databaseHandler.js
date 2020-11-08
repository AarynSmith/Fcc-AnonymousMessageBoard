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
  this.createThread = async (board, thread) => {
    const threadDoc = new Thread({board, ...thread})
    try {
      const doc = await threadDoc.save();
      return {doc};
    } catch (err) {
      return {err};
    }
  }

  this.addReply = async (reply) => {
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
      return {doc};
    } catch (err) {
      return {err};
    }
  }

  this.getThreads = async (board) => {
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

  this.deleteThread = async (board, thread) => {
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

  this.getReplies = async (board, thread) => {
    const threadQuery = Thread.findById(thread, threadProjection)
    try {
      const doc = await threadQuery.exec();
      return doc
    } catch (err) {
      return {err}
    }
  }

  this.testDeleteBoard = (board) => {
    Thread.deleteMany({board}, (err, data) => {
      console.log(`Deleted ${data.deletedCount} threads from ${board}`)
      return data;
    })
  }
}