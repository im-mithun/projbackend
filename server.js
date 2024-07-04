const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://crudapp:12345@cluster0.ika4ejk.mongodb.net/crudapp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true // To avoid deprecated warning for ensureIndex
});

const UserSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.status(201).send('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send('Invalid password');
        }
        const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' }); // Replace with your own secret key
        res.json({ token });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});