const mongoose = require('mongoose');
const Task = require('../models/Task');
require('dotenv').config();

const defaultTasks = [
  {
    taskId: 'follow',
    title: 'Follow @SpinLoot',
    description: 'Follow our official Twitter account',
    points: 5,
    maxCompletions: 1,
    type: 'once',
    action: 'Follow',
    link: 'https://twitter.com/Spin_loot',
    category: 'social',
    order: 1,
  },
  {
    taskId: 'like_rt',
    title: 'Like + RT Pinned Post',
    description: 'Like and retweet our pinned announcement',
    points: 5,
    maxCompletions: 1,
    type: 'once',
    action: 'Like & RT',
    link: 'https://x.com/spin_loot/status/1954819766990016658?s=61',
    category: 'social',
    order: 2,
  },
  {
    taskId: 'comment',
    title: 'Comment + Tag Friends',
    description: 'Comment (≥10 words) + #SpinLoot + tag 3 friends',
    points: 10,
    maxCompletions: 1,
    type: 'once',
    action: 'Comment',
    link: 'https://x.com/spin_loot/status/1955511995471655025?s=61',
    category: 'engagement',
    order: 3,
  },
  {
    taskId: 'quote_tweet',
    title: 'Quote-tweet Pinned Post',
    description: 'Quote-tweet our pinned post with your thoughts',
    points: 10,
    maxCompletions: 5,
    type: 'daily',
    action: 'Quote Tweet',
    link: 'https://x.com/spin_loot/status/1955293428092162185?s=61',
    category: 'social',
    order: 4,
  },
  {
    taskId: 'original_tweet',
    title: 'Original Tweet',
    description: 'Create original tweet mentioning @SpinLoot + #SpinLoot',
    points: 10,
    maxCompletions: 5,
    type: 'daily',
    action: 'Tweet',
    link: 'https://twitter.com/intent/tweet?text=🚀 Excited about @Spin_loot! The future of Web3 gaming is here! #SpinLoot',
    category: 'social',
    order: 5,
  },
  {
    taskId: 'x_space',
    title: 'Join X Space',
    description: 'RT announcement + reply with codeword',
    points: 10,
    maxCompletions: 2,
    type: 'limited',
    action: 'Join Space',
    link: 'https://twitter.com/Spin_loot',
    category: 'special',
    order: 6,
  },
  {
    taskId: 'referral_bonus',
    title: 'Refer Friends',
    description: 'Earn 100 points for each friend who joins using your referral code',
    points: 100,
    maxCompletions: 999,
    type: 'once',
    action: 'Refer Friends',
    category: 'referral',
    order: 7,
  },
  {
    taskId: 'daily_spinner',
    title: 'Daily Spinner',
    description: 'Spin the daily spinner to earn random points (max 3 spins per day)',
    points: 15,
    maxCompletions: 3,
    type: 'daily',
    action: 'Spin',
    category: 'special',
    order: 8,
  },
];

const seedTasks = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing tasks
    await Task.deleteMany({});
    console.log('Cleared existing tasks');

    // Insert default tasks
    const tasks = await Task.insertMany(defaultTasks);
    console.log(`Seeded ${tasks.length} tasks`);

    console.log('Task seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tasks:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedTasks();
