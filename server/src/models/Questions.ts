import mongoose, { Schema } from 'mongoose';
import { IQuestions } from '../types/index.js';

const questionsSchema = new Schema<IQuestions>(
  {
    question: {
      type: String,
      required: [true, 'Question is required'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: ['SQL', 'JAVA', 'C++', 'PYTHON', 'JAVASCRIPT', 'AI', 'ML'],
      index: true,
    },
    question_level: {
      type: String,
      required: true,
      enum: ['normal', 'boss'],
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
questionsSchema.index({ questionType: 1, question_level: 1 });
questionsSchema.index({ isActive: 1, questionType: 1 });
questionsSchema.index({ created_by: 1 });

export const Questions = mongoose.model<IQuestions>('Questions', questionsSchema);

