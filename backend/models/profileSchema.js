import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '', maxlength: 100 },
  department: { type: String, trim: true, default: '', maxlength: 150 },
  semester: { type: String, trim: true, default: '', maxlength: 50 },
  status: { type: String, trim: true, default: '', maxlength: 100 },
  avatarUrl: { type: String, trim: true, default: '', maxlength: 1000 },
  avatarPublicId: { type: String, trim: true, default: '', maxlength: 500 },
  bio: { type: String, trim: true, default: '', maxlength: 500 },
  studentId: { type: String, trim: true, default: '', maxlength: 100 },
  program: { type: String, trim: true, default: '', maxlength: 150 },
  batch: { type: String, trim: true, default: '', maxlength: 100 },
  universityEmail: { type: String, trim: true, lowercase: true, default: '', maxlength: 254 },
  phone: { type: String, trim: true, default: '', maxlength: 50 },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, trim: true, default: '', maxlength: 50 },
  bloodGroup: { type: String, trim: true, default: '', maxlength: 10 },
  address: { type: String, trim: true, default: '', maxlength: 300 },
  academicJourney: {
    school: { institution: { type: String, trim: true, default: '', maxlength: 150 }, years: { type: String, trim: true, default: '', maxlength: 100 } },
    college: { institution: { type: String, trim: true, default: '', maxlength: 150 }, years: { type: String, trim: true, default: '', maxlength: 100 } },
    university: { institution: { type: String, trim: true, default: '', maxlength: 150 }, years: { type: String, trim: true, default: '', maxlength: 100 } },
  },
  emergencyContacts: [{ name: { type: String, trim: true, default: '', maxlength: 100 }, relationship: { type: String, trim: true, default: '', maxlength: 100 }, phone: { type: String, trim: true, default: '', maxlength: 50 } }],
  socialLinks: {
    spotify: { type: String, trim: true, default: '', maxlength: 500 }, github: { type: String, trim: true, default: '', maxlength: 500 }, instagram: { type: String, trim: true, default: '', maxlength: 500 }, linkedin: { type: String, trim: true, default: '', maxlength: 500 }, facebook: { type: String, trim: true, default: '', maxlength: 500 },
  },
}, { _id: false });

export default profileSchema;
