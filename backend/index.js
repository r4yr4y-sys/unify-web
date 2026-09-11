import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 5000;

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "", maxlength: 100 },
    department: { type: String, trim: true, default: "", maxlength: 150 },
    semester: { type: String, trim: true, default: "", maxlength: 50 },
    status: { type: String, trim: true, default: "", maxlength: 100 },
    bio: { type: String, trim: true, default: "", maxlength: 500 },
    studentId: { type: String, trim: true, default: "", maxlength: 100 },
    program: { type: String, trim: true, default: "", maxlength: 150 },
    batch: { type: String, trim: true, default: "", maxlength: 100 },
    universityEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      maxlength: 254,
    },
    phone: { type: String, trim: true, default: "", maxlength: 50 },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, trim: true, default: "", maxlength: 50 },
    bloodGroup: { type: String, trim: true, default: "", maxlength: 10 },
    address: { type: String, trim: true, default: "", maxlength: 300 },
    academicJourney: {
      school: {
        institution: { type: String, trim: true, default: "", maxlength: 150 },
        years: { type: String, trim: true, default: "", maxlength: 100 },
      },
      college: {
        institution: { type: String, trim: true, default: "", maxlength: 150 },
        years: { type: String, trim: true, default: "", maxlength: 100 },
      },
      university: {
        institution: { type: String, trim: true, default: "", maxlength: 150 },
        years: { type: String, trim: true, default: "", maxlength: 100 },
      },
    },
    emergencyContacts: [
      {
        name: { type: String, trim: true, default: "", maxlength: 100 },
        relationship: { type: String, trim: true, default: "", maxlength: 100 },
        phone: { type: String, trim: true, default: "", maxlength: 50 },
      },
    ],
    socialLinks: {
      spotify: { type: String, trim: true, default: "", maxlength: 500 },
      github: { type: String, trim: true, default: "", maxlength: 500 },
      instagram: { type: String, trim: true, default: "", maxlength: 500 },
      linkedin: { type: String, trim: true, default: "", maxlength: 500 },
      facebook: { type: String, trim: true, default: "", maxlength: 500 },
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    profileCompleted: { type: Boolean, default: false },
    profile: { type: profileSchema, default: () => ({}) },
  },
  { timestamps: true },
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const flashcardPackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true, trim: true, maxlength: 150 },
    colorScheme: {
      primary: { type: String, required: true, trim: true },
      secondary: { type: String, required: true, trim: true },
    },
    cards: [
      {
        _id: false,
        id: { type: String, required: true },
        question: { type: String, required: true, trim: true, maxlength: 2000 },
        answer: { type: String, required: true, trim: true, maxlength: 2000 },
      },
    ],
  },
  { timestamps: true },
);
const FlashcardPack =
  mongoose.models.FlashcardPack ||
  mongoose.model("FlashcardPack", flashcardPackSchema);

const cgpaRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    semesters: [
      {
        _id: false,
        semester: { type: Number, required: true },
        courses: [
          {
            _id: false,
            id: { type: String, required: true },
            name: { type: String, required: true, trim: true, maxlength: 150 },
            credits: { type: Number, required: true, min: 0 },
            grade: { type: String, required: true, trim: true, maxlength: 10 },
          },
        ],
      },
    ],
  },
  { timestamps: true },
);
const CgpaRecord =
  mongoose.models.CgpaRecord || mongoose.model("CgpaRecord", cgpaRecordSchema);

const studyPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    topic: { type: String, required: true, trim: true, maxlength: 200 },
    deadline: { type: String, default: null },
    checkpoints: [
      {
        _id: false,
        id: { type: String, required: true },
        text: { type: String, required: true, trim: true, maxlength: 500 },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);
const StudyPlan =
  mongoose.models.StudyPlan || mongoose.model("StudyPlan", studyPlanSchema);

const studySessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationMs: { type: Number, required: true, min: 1 },
    mode: { type: String, enum: ["countdown", "open"], required: true },
    backgroundId: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);
const StudySession =
  mongoose.models.StudySession ||
  mongoose.model("StudySession", studySessionSchema);

const semesterSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, name: { type: String, required: true, trim: true, maxlength: 100 }, isCurrent: { type: Boolean, default: false } }, { timestamps: true });
const Semester = mongoose.models.Semester || mongoose.model("Semester", semesterSchema);
const courseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, semester: { type: mongoose.Schema.Types.ObjectId, ref: "Semester", required: true, index: true },
  code: { type: String, required: true, trim: true, maxlength: 50 }, title: { type: String, required: true, trim: true, maxlength: 150 }, credits: { type: Number, required: true, min: 0, max: 30 }, totalClasses: { type: Number, required: true, min: 0, max: 300 }, totalQuizzes: { type: Number, required: true, min: 0, max: 100 }, totalAssignments: { type: Number, required: true, min: 0, max: 100 }, hasMidterm: { type: Boolean, default: false }, hasFinal: { type: Boolean, default: false },
  attendance: [{ _id: false, number: Number, status: { type: String, enum: ["pending", "attended", "missed"], default: "pending" } }], assessments: [{ _id: false, id: String, type: { type: String, enum: ["quiz", "assignment", "midterm", "final"], required: true }, number: Number, status: { type: String, enum: ["pending", "completed", "missed"], default: "pending" }, marksObtained: { type: Number, default: null }, maxMarks: { type: Number, default: null } }],
}, { timestamps: true });
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

app.use(express.json());
app.use((request, response, next) => {
  response.setHeader(
    "Access-Control-Allow-Origin",
    process.env.CLIENT_ORIGIN || "http://localhost:5173",
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});

const createToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  // Older accounts will not have this field until their first profile save.
  profileCompleted: user.profileCompleted === true,
  profile: user.profile || {},
});

const requireAuth = async (request, response, next) => {
  const authorization = request.get("Authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token)
    return response
      .status(401)
      .json({ message: "Authentication is required." });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user)
      return response
        .status(404)
        .json({ message: "User account was not found." });
    request.user = user;
    next();
  } catch (_error) {
    return response
      .status(401)
      .json({ message: "Your session is invalid or has expired." });
  }
};

const text = (value) => (typeof value === "string" ? value.trim() : "");
const profileText = (value, maxLength) => text(value).slice(0, maxLength);

const profileFromRequest = (input) => {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Profile data is required.");

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
    const error = new Error("Name, department, and semester are required.");
    error.status = 400;
    throw error;
  }

  if (
    profile.universityEmail &&
    !/^\S+@\S+\.\S+$/.test(profile.universityEmail)
  ) {
    const error = new Error("University email must be a valid email address.");
    error.status = 400;
    throw error;
  }

  if (input.dateOfBirth) {
    const dateOfBirth = new Date(input.dateOfBirth);
    if (Number.isNaN(dateOfBirth.getTime())) {
      const error = new Error("Date of birth must be a valid date.");
      error.status = 400;
      throw error;
    }
    profile.dateOfBirth = dateOfBirth;
  } else profile.dateOfBirth = null;

  for (const key of ["school", "college", "university"]) {
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
    const error = new Error("Emergency contacts must be a list.");
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
    "spotify",
    "github",
    "instagram",
    "linkedin",
    "facebook",
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

app.post("/api/auth/signup", async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password } = request.body;
    if (!email || !password)
      return response
        .status(400)
        .json({ message: "Email and password are required." });
    if (password.length < 8)
      return response
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    if (await User.exists({ email }))
      return response
        .status(409)
        .json({ message: "An account with this email already exists." });

    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });
    return response.status(201).json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    if (error?.code === 11000)
      return response
        .status(409)
        .json({ message: "An account with this email already exists." });
    next(error);
  }
});

app.post("/api/auth/signin", async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password } = request.body;
    if (!email || !password)
      return response
        .status(400)
        .json({ message: "Email and password are required." });

    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response
        .status(401)
        .json({ message: "Invalid email or password." });
    }
    return response.json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/profile", requireAuth, (request, response) => {
  response.json({ user: serializeUser(request.user) });
});

app.put("/api/profile", requireAuth, async (request, response, next) => {
  try {
    request.user.profile = profileFromRequest(request.body.profile);
    request.user.profileCompleted = true;
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});

const clientDocument = (document) => ({
  id: document.id,
  ...document.toObject({
    versionKey: false,
    transform: (_doc, value) => {
      delete value._id;
      delete value.user;
      return value;
    },
  }),
});
const badRequest = (message) =>
  Object.assign(new Error(message), { status: 400 });

const flashcardPackFromRequest = (input) => {
  if (!input || typeof input !== "object")
    throw badRequest("Flashcard pack data is required.");
  const topic = text(input.topic).slice(0, 150);
  const cards = Array.isArray(input.cards) ? input.cards : [];
  if (!topic || !cards.length || cards.length > 50)
    throw badRequest("A topic and between 1 and 50 cards are required.");
  if (!text(input.colorScheme?.primary) || !text(input.colorScheme?.secondary))
    throw badRequest("A color scheme is required.");
  return {
    topic,
    colorScheme: {
      primary: text(input.colorScheme.primary).slice(0, 100),
      secondary: text(input.colorScheme.secondary).slice(0, 100),
    },
    cards: cards.map((card, index) => {
      const question = text(card?.question).slice(0, 2000);
      const answer = text(card?.answer).slice(0, 2000);
      if (!question || !answer)
        throw badRequest(`Card ${index + 1} needs a question and answer.`);
      return {
        id: text(card?.id) || `card-${Date.now()}-${index}`,
        question,
        answer,
      };
    }),
  };
};
const planFromRequest = (input) => {
  const subject = text(input?.subject).slice(0, 150);
  const topic = text(input?.topic).slice(0, 200);
  const checkpoints = Array.isArray(input?.checkpoints)
    ? input.checkpoints
    : [];
  if (!subject || !topic || !checkpoints.length || checkpoints.length > 100)
    throw badRequest(
      "A subject, topic, and at least one checkpoint are required.",
    );
  return {
    subject,
    topic,
    deadline: text(input.deadline) || null,
    checkpoints: checkpoints.map((item, index) => {
      const checkpointText = text(item?.text).slice(0, 500);
      if (!checkpointText)
        throw badRequest(`Checkpoint ${index + 1} needs text.`);
      return {
        id: text(item?.id) || `checkpoint-${Date.now()}-${index}`,
        text: checkpointText,
        completed: item?.completed === true,
      };
    }),
  };
};
const semestersFromRequest = (semesters) => {
  if (!Array.isArray(semesters))
    throw badRequest("Semester data must be a list.");
  return semesters.slice(0, 30).map((item) => {
    const semester = Number(item?.semester);
    const courses = Array.isArray(item?.courses) ? item.courses : [];
    if (
      !Number.isInteger(semester) ||
      semester < 1 ||
      !courses.length ||
      courses.length > 15
    )
      throw badRequest(
        "Each semester needs a number and between 1 and 15 courses.",
      );
    return {
      semester,
      courses: courses.map((course, index) => {
        const name = text(course?.name).slice(0, 150);
        const credits = Number(course?.credits);
        const grade = text(course?.grade).slice(0, 10);
        if (!name || !Number.isFinite(credits) || credits <= 0 || !grade)
          throw badRequest(`Course ${index + 1} is incomplete.`);
        return {
          id: text(course?.id) || `course-${Date.now()}-${index}`,
          name,
          credits,
          grade,
        };
      }),
    };
  });
};

app.get(
  "/api/flashcard-packs",
  requireAuth,
  async (request, response, next) => {
    try {
      const packs = await FlashcardPack.find({ user: request.user._id }).sort({
        createdAt: -1,
      });
      response.json({ packs: packs.map(clientDocument) });
    } catch (error) {
      next(error);
    }
  },
);
app.post(
  "/api/flashcard-packs",
  requireAuth,
  async (request, response, next) => {
    try {
      const pack = await FlashcardPack.create({
        user: request.user._id,
        ...flashcardPackFromRequest(request.body),
      });
      response.status(201).json({ pack: clientDocument(pack) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);
app.put(
  "/api/flashcard-packs/:id",
  requireAuth,
  async (request, response, next) => {
    try {
      const pack = await FlashcardPack.findOneAndUpdate(
        { _id: request.params.id, user: request.user._id },
        flashcardPackFromRequest(request.body),
        { new: true, runValidators: true },
      );
      if (!pack)
        return response
          .status(404)
          .json({ message: "Flashcard pack not found." });
      response.json({ pack: clientDocument(pack) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);
app.delete(
  "/api/flashcard-packs/:id",
  requireAuth,
  async (request, response, next) => {
    try {
      const pack = await FlashcardPack.findOneAndDelete({
        _id: request.params.id,
        user: request.user._id,
      });
      if (!pack)
        return response
          .status(404)
          .json({ message: "Flashcard pack not found." });
      response.sendStatus(204);
    } catch (error) {
      next(error);
    }
  },
);

app.get("/api/cgpa", requireAuth, async (request, response, next) => {
  try {
    const record = await CgpaRecord.findOne({ user: request.user._id });
    response.json({ semesters: record?.semesters || [] });
  } catch (error) {
    next(error);
  }
});
app.put("/api/cgpa", requireAuth, async (request, response, next) => {
  try {
    const semesters = semestersFromRequest(request.body.semesters);
    const record = await CgpaRecord.findOneAndUpdate(
      { user: request.user._id },
      { semesters },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
    response.json({ semesters: record.semesters });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
app.delete("/api/cgpa", requireAuth, async (request, response, next) => {
  try {
    await CgpaRecord.deleteOne({ user: request.user._id });
    response.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

app.get("/api/study-plans", requireAuth, async (request, response, next) => {
  try {
    const plans = await StudyPlan.find({ user: request.user._id }).sort({
      createdAt: -1,
    });
    response.json({ plans: plans.map(clientDocument) });
  } catch (error) {
    next(error);
  }
});
app.post("/api/study-plans", requireAuth, async (request, response, next) => {
  try {
    const plan = await StudyPlan.create({
      user: request.user._id,
      ...planFromRequest(request.body),
    });
    response.status(201).json({ plan: clientDocument(plan) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});
app.put(
  "/api/study-plans/:id",
  requireAuth,
  async (request, response, next) => {
    try {
      const plan = await StudyPlan.findOneAndUpdate(
        { _id: request.params.id, user: request.user._id },
        planFromRequest(request.body),
        { new: true, runValidators: true },
      );
      if (!plan)
        return response.status(404).json({ message: "Study plan not found." });
      response.json({ plan: clientDocument(plan) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);

app.get("/api/study-sessions", requireAuth, async (request, response, next) => {
  try {
    const sessions = await StudySession.find({ user: request.user._id })
      .sort({ startedAt: -1 })
      .limit(365);
    const totals = new Map();
    sessions.forEach((session) => {
      const day = session.startedAt.toISOString().slice(0, 10);
      totals.set(day, (totals.get(day) || 0) + session.durationMs);
    });
    response.json({
      sessions: sessions.map(clientDocument),
      dailyTotals: [...totals]
        .map(([date, durationMs]) => ({ date, durationMs }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (error) {
    next(error);
  }
});
app.post(
  "/api/study-sessions",
  requireAuth,
  async (request, response, next) => {
    try {
      const startedAt = new Date(request.body.startedAt);
      const endedAt = new Date(request.body.endedAt);
      const durationMs = Number(request.body.durationMs);
      if (
        Number.isNaN(startedAt.getTime()) ||
        Number.isNaN(endedAt.getTime()) ||
        !Number.isFinite(durationMs) ||
        durationMs < 1000 ||
        !["countdown", "open"].includes(request.body.mode)
      )
        throw badRequest("A completed study session is required.");
      const session = await StudySession.create({
        user: request.user._id,
        startedAt,
        endedAt,
        durationMs: Math.floor(durationMs),
        mode: request.body.mode,
        backgroundId: text(request.body.backgroundId).slice(0, 100),
      });
      response.status(201).json({ session: clientDocument(session) });
    } catch (error) {
      if (error.status)
        return response.status(error.status).json({ message: error.message });
      next(error);
    }
  },
);

const courseFromRequest = (input, semesterId) => {
  const code = text(input?.code).slice(0, 50), title = text(input?.title).slice(0, 150);
  const totalClasses = Number(input?.totalClasses), totalQuizzes = Number(input?.totalQuizzes), totalAssignments = Number(input?.totalAssignments), credits = Number(input?.credits);
  if (!code || !title || !Number.isFinite(credits) || credits < 0 || ![totalClasses, totalQuizzes, totalAssignments].every((value) => Number.isInteger(value) && value >= 0)) throw badRequest("Complete the course details with valid counts.");
  const assessments = (type, count) => Array.from({ length: count }, (_, index) => ({ id: `${type}-${index + 1}`, type, number: index + 1, status: "pending", marksObtained: null, maxMarks: null }));
  return { semester: semesterId, code, title, credits, totalClasses, totalQuizzes, totalAssignments, hasMidterm: input.hasMidterm === true, hasFinal: input.hasFinal === true, attendance: Array.from({ length: totalClasses }, (_, index) => ({ number: index + 1, status: "pending" })), assessments: [...assessments("quiz", totalQuizzes), ...assessments("assignment", totalAssignments), ...(input.hasMidterm ? assessments("midterm", 1) : []), ...(input.hasFinal ? assessments("final", 1) : [])] };
};
app.get("/api/semesters", requireAuth, async (request, response, next) => { try { const semesters = await Semester.find({ user: request.user._id }).sort({ isCurrent: -1, createdAt: -1 }); response.json({ semesters: semesters.map(clientDocument) }); } catch (error) { next(error); } });
app.post("/api/semesters", requireAuth, async (request, response, next) => { try { const name = text(request.body.name).slice(0, 100); if (!name) throw badRequest("Semester name is required."); const hasCurrent = await Semester.exists({ user: request.user._id, isCurrent: true }); const semester = await Semester.create({ user: request.user._id, name, isCurrent: !hasCurrent || request.body.isCurrent === true }); if (semester.isCurrent) await Semester.updateMany({ user: request.user._id, _id: { $ne: semester._id } }, { isCurrent: false }); response.status(201).json({ semester: clientDocument(semester) }); } catch (error) { if (error.status) return response.status(error.status).json({ message: error.message }); next(error); } });
app.put("/api/semesters/:id", requireAuth, async (request, response, next) => { try { const update = {}; if (request.body.name !== undefined) { update.name = text(request.body.name).slice(0, 100); if (!update.name) throw badRequest("Semester name is required."); } if (request.body.isCurrent === true) { await Semester.updateMany({ user: request.user._id }, { isCurrent: false }); update.isCurrent = true; } const semester = await Semester.findOneAndUpdate({ _id: request.params.id, user: request.user._id }, update, { new: true, runValidators: true }); if (!semester) return response.status(404).json({ message: "Semester not found." }); response.json({ semester: clientDocument(semester) }); } catch (error) { if (error.status) return response.status(error.status).json({ message: error.message }); next(error); } });
app.get("/api/courses", requireAuth, async (request, response, next) => { try { const filter = { user: request.user._id }; if (request.query.semesterId) filter.semester = request.query.semesterId; const courses = await Course.find(filter).sort({ createdAt: 1 }); response.json({ courses: courses.map(clientDocument) }); } catch (error) { next(error); } });
app.post("/api/courses", requireAuth, async (request, response, next) => { try { const semester = await Semester.findOne({ _id: request.body.semesterId, user: request.user._id }); if (!semester) return response.status(404).json({ message: "Semester not found." }); const course = await Course.create({ user: request.user._id, ...courseFromRequest(request.body, semester._id) }); response.status(201).json({ course: clientDocument(course) }); } catch (error) { if (error.status) return response.status(error.status).json({ message: error.message }); next(error); } });
app.put("/api/courses/:id", requireAuth, async (request, response, next) => { try { const course = await Course.findOne({ _id: request.params.id, user: request.user._id }); if (!course) return response.status(404).json({ message: "Course not found." }); if (Array.isArray(request.body.attendance)) course.attendance = request.body.attendance; if (Array.isArray(request.body.assessments)) course.assessments = request.body.assessments; await course.save(); response.json({ course: clientDocument(course) }); } catch (error) { next(error); } });

app.use((error, _request, response, _next) => {
  console.error(error);
  response
    .status(500)
    .json({ message: "Unable to process your request. Please try again." });
});

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error("MONGODB_URI and JWT_SECRET must be set in backend/.env.");
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(port, () => console.log(`API listening on port ${port}`)),
  )
  .catch((error) => {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  });
