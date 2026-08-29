import mongoose from 'mongoose';

import 'dotenv/config';

mongoose.connect(process.env.MONGODB_URI).then(console.log('connected'));
