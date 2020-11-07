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

  this.testDeleteBoard = (board) => {
    Thread.deleteMany({board}, (err, data) => {
      console.log(data)
      return data;
    })
  }
}