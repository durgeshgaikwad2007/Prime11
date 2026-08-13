const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDeposited: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  transactions: [
    {
      transactionId: String,
      type: {
        type: String,
        enum: ['Deposit', 'Withdrawal', 'Contest Entry', 'Winnings', 'Refund', 'Bonus'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: String,
      status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
        default: 'Pending'
      },
      contestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contest'
      },
      paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'],
        default: null
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  bonusBalance: {
    type: Number,
    default: 0
  },
  bonusTransactions: [
    {
      bonusType: {
        type: String,
        enum: ['Sign Up', 'Referral', 'Contest Win', 'Promotional']
      },
      amount: Number,
      expiryDate: Date,
      isUsed: Boolean,
      timestamp: Date
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Wallet', walletSchema);
