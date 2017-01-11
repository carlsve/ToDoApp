/**
 * Created by karlpet on 2017-01-07.
 */
import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, required: true },
    date: { type: Date, default: Date.now }
});

itemSchema.methods.getItem = function () {
    return { title: this.title,
        completed: this.completed,
        date: this.date
    };
};

export default mongoose.model('Items', itemSchema);