import { text } from './text.js';

const profileText = (value, maxLength) => text(value).slice(0, maxLength);

const profileFromRequest = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Profile data is required.');

  const profile = {
    name: profileText(input.name, 100),
    department: profileText(input.department, 150),
    semester: profileText(input.semester, 50),
    status: profileText(input.status, 100),
    bio: profileText(input.bio, 500),
    studentId: profileText(input.studentId, 100),
    program: profileText(input.program, 150),
    batch: profileText(input.batch, 100),
    universityEmail: profileText(input.universityEmail, 254).toLowerCase(),
    phone: profileText(input.phone, 50),
    gender: profileText(input.gender, 50),
    bloodGroup: profileText(input.bloodGroup, 10),
    address: profileText(input.address, 300),
    academicJourney: {},
    emergencyContacts: [],
    socialLinks: {},
  };

  if (!profile.name || !profile.department || !profile.semester) {
    const error = new Error('Name, department, and semester are required.');
    error.status = 400;
    throw error;
  }

  if (
    profile.universityEmail &&
    !/^\S+@\S+\.\S+$/.test(profile.universityEmail)
  ) {
    const error = new Error('University email must be a valid email address.');
    error.status = 400;
    throw error;
  }

  if (input.dateOfBirth) {
    const dateOfBirth = new Date(input.dateOfBirth);
    if (Number.isNaN(dateOfBirth.getTime())) {
      const error = new Error('Date of birth must be a valid date.');
      error.status = 400;
      throw error;
    }
    profile.dateOfBirth = dateOfBirth;
  } else profile.dateOfBirth = null;

  for (const key of ['school', 'college', 'university']) {
    const journey = input.academicJourney?.[key] || {};
    profile.academicJourney[key] = {
      institution: profileText(journey.institution, 150),
      years: profileText(journey.years, 100),
    };
  }

  if (
    input.emergencyContacts !== undefined &&
    !Array.isArray(input.emergencyContacts)
  ) {
    const error = new Error('Emergency contacts must be a list.');
    error.status = 400;
    throw error;
  }
  profile.emergencyContacts = (input.emergencyContacts || [])
    .slice(0, 5)
    .map((contact) => ({
      name: profileText(contact?.name, 100),
      relationship: profileText(contact?.relationship, 100),
      phone: profileText(contact?.phone, 50),
    }));

  for (const key of [
    'spotify',
    'github',
    'instagram',
    'linkedin',
    'facebook',
  ]) {
    const url = profileText(input.socialLinks?.[key], 500);
    if (url && !/^https?:\/\//i.test(url)) {
      const error = new Error(
        `${key} link must start with http:// or https://.`,
      );
      error.status = 400;
      throw error;
    }
    profile.socialLinks[key] = url;
  }

  return profile;
};

export { profileFromRequest };

