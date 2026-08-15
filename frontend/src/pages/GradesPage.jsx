import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Calculator, ChevronRight, Target, TrendingUp, X } from 'lucide-react'
import { PageHeader } from '../components/ui'

const STORAGE_KEY = 'unify-grade-history'
const GRADE_POINTS = { 'A+': 4, A: 3.75, 'A-': 3.5, 'B+': 3.25, B: 3, 'B-': 2.75 }
const gradeOptions = Object.keys(GRADE_POINTS)
const emptyCourse = () => ({ id: crypto.randomUUID(), name: '', credits: '', grade: '' })
const format = (value) => Number(value).toFixed(2)

function getStoredSemesters() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function coursesFor(semesters) { return semesters.flatMap(({ semester, courses }) => courses.map((course) => ({ ...course, semester, gradePoint: GRADE_POINTS[course.grade] }))) }
function summary(courses) {
  const credits = courses.reduce((total, course) => total + Number(course.credits || 0), 0)
  const points = courses.reduce((total, course) => total + Number(course.credits || 0) * (course.gradePoint ?? GRADE_POINTS[course.grade] ?? 0), 0)
  return { credits, gpa: credits ? points / credits : 0 }
}

export default function GradesPage() {
  const [semesters, setSemesters] = useState(getStoredSemesters)
  const [tab, setTab] = useState('overview')
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [targetOpen, setTargetOpen] = useState(false)
  const [showCgpaDetails, setShowCgpaDetails] = useState(false)
  const [semesterNumber, setSemesterNumber] = useState('1')
  const [courseCount, setCourseCount] = useState('4')
  const [courses, setCourses] = useState(() => Array.from({ length: 4 }, emptyCourse))
  const [calculated, setCalculated] = useState(null)
  const [formError, setFormError] = useState('')
  const [targetGpa, setTargetGpa] = useState('')
  const [nextCredits, setNextCredits] = useState('')
  const [targetResult, setTargetResult] = useState(null)
  const allCourses = useMemo(() => coursesFor(semesters), [semesters])
  const cumulative = useMemo(() => summary(allCourses), [allCourses])
  const orderedSemesters = useMemo(() => [...semesters].sort((a, b) => b.semester - a.semester), [semesters])

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters)) }, [semesters])

  const latestSemester = semesters.length ? Math.max(...semesters.map((item) => Number(item.semester))) : null
  const previousCourses = latestSemester === null ? [] : allCourses.filter((course) => Number(course.semester) !== latestSemester)
  const previous = summary(previousCourses)
  const gpaDifference = previous.credits ? cumulative.gpa - previous.gpa : null

  const generateCourses = () => {
    const count = Number(courseCount)
    if (!Number.isInteger(count) || count < 1 || count > 15) return setFormError('Enter between 1 and 15 courses.')
    setCourses(Array.from({ length: count }, emptyCourse))
    setCalculated(null)
    setFormError('')
  }
  const updateCourse = (id, key, value) => {
    setCourses((current) => current.map((course) => course.id === id ? { ...course, [key]: value } : course))
    setCalculated(null)
  }
  const calculateSemester = () => {
    const semester = Number(semesterNumber)
    if (!Number.isInteger(semester) || semester < 1) return setFormError('Enter a valid semester number.')
    if (courses.some((course) => !course.name.trim() || !Number(course.credits) || Number(course.credits) <= 0 || !GRADE_POINTS[course.grade])) return setFormError('Complete every course with a name, positive credit, and grade.')
    const result = summary(courses.map((course) => ({ ...course, credits: Number(course.credits), gradePoint: GRADE_POINTS[course.grade] })))
    if (!result.credits) return setFormError('Total credits must be greater than zero.')
    setCalculated({ semester, courses: courses.map((course) => ({ ...course, name: course.name.trim(), credits: Number(course.credits) })), ...result })
    setFormError('')
  }
  const saveSemester = () => {
    if (!calculated) return
    setSemesters((current) => [...current.filter((item) => Number(item.semester) !== calculated.semester), { semester: calculated.semester, courses: calculated.courses }].sort((a, b) => a.semester - b.semester))
    setCalculatorOpen(false)
    setCalculated(null)
  }
  const calculateTarget = () => {
    const target = Number(targetGpa)
    const credits = Number(nextCredits)
    if (!cumulative.credits) return setTargetResult({ error: 'Save a semester result before planning a target.' })
    if (!Number.isFinite(target) || target <= 0 || target > 4 || !Number.isFinite(credits) || credits <= 0) return setTargetResult({ error: 'Enter a target GPA between 0.01 and 4.00 and positive planned credits.' })
    const required = (target * (cumulative.credits + credits) - cumulative.gpa * cumulative.credits) / credits
    setTargetResult({ required })
  }

  return <section className="page grades-page">
    <PageHeader eyebrow="Unify workspace" title="Grades & GPA" description="Track your academic progress, calculate your GPA, and plan your next semester." />
    <div className="grades-tabs" role="tablist" aria-label="Grades views">
      <button type="button" className={tab === 'overview' ? 'is-active' : ''} onClick={() => setTab('overview')}>Overview</button>
      <button type="button" className={tab === 'history' ? 'is-active' : ''} onClick={() => setTab('history')}>History</button>
    </div>
    {tab === 'overview' ? <div className="grades-grid">
      <article className="grades-card grades-card--current"><div className="grades-card__icon"><TrendingUp size={22} /></div><p className="eyebrow">Academic progress</p><h2>Your Current GPA</h2>{cumulative.credits ? <><strong className="grades-card__number">{format(cumulative.gpa)}</strong><p className={`grades-card__change ${gpaDifference >= 0 ? 'is-positive' : 'is-negative'}`}>{gpaDifference === null ? 'First semester' : `${gpaDifference >= 0 ? '↑' : '↓'} ${format(Math.abs(gpaDifference))} from last semester`}</p><footer><span>{semesters.length} {semesters.length === 1 ? 'semester' : 'semesters'} completed</span><span>{format(cumulative.credits)} total credits</span></footer></> : <p className="grades-card__empty">Save a semester result to see your current GPA.</p>}</article>
      <article className="grades-card"><span className="grades-card__icon"><Calculator size={21} /></span><p className="eyebrow">Semester tools</p><h2>Semester GPA Calculator</h2><p>Calculate a credit-weighted GPA for one semester and save every course.</p><button className="grades-action" type="button" onClick={() => { setCalculatorOpen(true); setFormError('') }}>Calculate semester GPA <ChevronRight size={16} /></button></article>
      <article className="grades-card"><span className="grades-card__icon"><BookOpen size={21} /></span><p className="eyebrow">Cumulative result</p><h2>CGPA Calculator</h2>{cumulative.credits ? <><strong className="grades-card__compact-number">{format(cumulative.gpa)}</strong><p>{semesters.length} semesters · {format(cumulative.credits)} total credits</p><button className="grades-action" type="button" onClick={() => setShowCgpaDetails((current) => !current)}>{showCgpaDetails ? 'Hide CGPA details' : 'View CGPA details'} <ChevronRight size={16} /></button>{showCgpaDetails && <ul className="grades-breakdown">{orderedSemesters.map((item) => { const itemSummary = summary(coursesFor([item])); return <li key={item.semester}>Semester {item.semester}<span>{format(itemSummary.gpa)} GPA · {format(itemSummary.credits)} credits</span></li> })}</ul>}</> : <p className="grades-card__empty">No semester results yet. Calculate your first semester GPA to get started.</p>}</article>
      <article className="grades-card grades-card--target"><span className="grades-card__icon"><Target size={21} /></span><p className="eyebrow">Future planning</p><h2>Target GPA Planner</h2><p>Plan the CGPA you want to reach next semester.</p><button className="grades-action" type="button" onClick={() => { setTargetOpen(true); setTargetResult(null) }}>Plan my target <ChevronRight size={16} /></button></article>
    </div> : <HistoryTable courses={allCourses} />}
    {calculatorOpen && <div className="grades-modal-backdrop" role="presentation"><section className="grades-modal" role="dialog" aria-modal="true" aria-labelledby="semester-calculator-title"><button type="button" className="grades-modal__close" aria-label="Close calculator" onClick={() => setCalculatorOpen(false)}><X size={18} /></button><p className="eyebrow">Semester tools</p><h2 id="semester-calculator-title">Semester GPA Calculator</h2>{!calculated ? <><div className="grades-form__setup"><label>Which semester?<input type="number" min="1" value={semesterNumber} onChange={(event) => setSemesterNumber(event.target.value)} /></label><label>How many courses?<input type="number" min="1" max="15" value={courseCount} onChange={(event) => setCourseCount(event.target.value)} /></label><button type="button" className="grades-secondary" onClick={generateCourses}>Generate courses</button></div><div className="grades-course-list"><div className="grades-course-list__head"><span>Course name</span><span>Credit</span><span>Grade</span></div>{courses.map((course) => <div className="grades-course-row" key={course.id}><input aria-label="Course name" value={course.name} placeholder="CSE101" onChange={(event) => updateCourse(course.id, 'name', event.target.value)} /><input aria-label="Course credit" type="number" min="0.5" step="0.5" value={course.credits} placeholder="3" onChange={(event) => updateCourse(course.id, 'credits', event.target.value)} /><select aria-label="Course grade" value={course.grade} onChange={(event) => updateCourse(course.id, 'grade', event.target.value)}><option value="">Grade</option>{gradeOptions.map((grade) => <option key={grade} value={grade}>{grade}</option>)}</select></div>)}</div>{formError && <p className="grades-form__error">{formError}</p>}<button type="button" className="grades-primary" onClick={calculateSemester}>Calculate GPA</button></> : <div className="grades-result"><p>Semester {calculated.semester} GPA</p><strong>{format(calculated.gpa)}</strong><span>{format(calculated.credits)} credits</span><button type="button" className="grades-primary" onClick={saveSemester}>Save Semester</button><button type="button" className="grades-secondary" onClick={() => setCalculated(null)}>Edit courses</button></div>}</section></div>}
    {targetOpen && <div className="grades-modal-backdrop" role="presentation"><section className="grades-modal grades-modal--small" role="dialog" aria-modal="true" aria-labelledby="target-planner-title"><button type="button" className="grades-modal__close" aria-label="Close target planner" onClick={() => setTargetOpen(false)}><X size={18} /></button><p className="eyebrow">Future planning</p><h2 id="target-planner-title">Target GPA Planner</h2>{cumulative.credits ? <p className="grades-target-current">Current CGPA <strong>{format(cumulative.gpa)}</strong> across {format(cumulative.credits)} credits</p> : <p className="grades-card__empty">Save a semester result before planning a target.</p>}<label className="grades-stacked-label">Target CGPA<input type="number" min="0.01" max="4" step="0.01" value={targetGpa} onChange={(event) => setTargetGpa(event.target.value)} placeholder="3.60" /></label><label className="grades-stacked-label">Next semester credits<input type="number" min="0.5" step="0.5" value={nextCredits} onChange={(event) => setNextCredits(event.target.value)} placeholder="18" /></label><button type="button" className="grades-primary" onClick={calculateTarget}>Calculate target</button>{targetResult && <div className="grades-target-result">{targetResult.error ? targetResult.error : targetResult.required > 4 ? 'This target is not achievable in one semester with this credit load.' : targetResult.required < 0 ? 'Your current CGPA already exceeds this target.' : <>You need approximately <strong>{format(targetResult.required)} GPA</strong> next semester.</>}</div>}</section></div>}
  </section>
}

function HistoryTable({ courses }) {
  const sorted = [...courses].sort((a, b) => Number(b.semester) - Number(a.semester))
  return <section className="grades-history"><div><p className="eyebrow">Academic record</p><h2>Course history</h2></div>{sorted.length ? <div className="grades-history__scroll"><table><thead><tr><th>Course</th><th>Semester</th><th>Credits</th><th>Grade</th><th>Grade Point</th></tr></thead><tbody>{sorted.map((course) => <tr key={course.id}><td>{course.name}</td><td>Semester {course.semester}</td><td>{format(course.credits)}</td><td><span className="grades-grade">{course.grade}</span></td><td>{format(course.gradePoint)}</td></tr>)}</tbody></table></div> : <p className="grades-history__empty">No course history yet. Calculate and save a semester to get started.</p>}</section>
}
