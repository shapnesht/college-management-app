const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
  
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  issueDate: {
    type: String,
    required: true,
  },
  dueDate: {
    type: String,
    // required: true,
  },
  submitDate: {
    type: String,
   
  },
  returned: {
    type: Boolean,
    default: false
  }
});

const Borrow = mongoose.model('Borrow', borrowingSchema);

module.exports = Borrow;
