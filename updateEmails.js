const mongoose = require('mongoose')
const readline = require('readline')
const User = require('./models/User')

// Connect to your MongoDB
mongoose.connect('mongodb+srv://dudvarskimateja:mateja@piu-information-managem.hxmg86y.mongodb.net/?retryWrites=true&w=majority&appName=PIU-Information-Management-System', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function updateEmails() {
    // Find users without an email address
    const users = await User.find({ email: { $exists: false } });
  
    for (let user of users) {
      console.log(`Updating user: ${user.displayName}`);
  
      // Prompt for an email address
      const email = await new Promise(resolve => {
        rl.question(`Enter email for ${user.displayName} (ID: ${user._id}) : `, (input) => {
          resolve(input);
        });
      });
  
      // Update the user with the new email
      user.email = email;
      await user.save();
      console.log(`Updated ${user.displayName} with email ${email}`);
    }
  
    rl.close(); // Close the readline interface
    mongoose.disconnect(); // Disconnect from MongoDB
    console.log('Finished updating emails.');
  }
  
  updateEmails().catch(err => {
    console.error('Failed to update emails:', err);
    process.exit(1);
  });