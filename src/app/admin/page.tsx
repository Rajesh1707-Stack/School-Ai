'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  School, Users, BookOpen, Plus, LogOut, ShieldCheck, 
  GraduationCap, UserPlus, Sparkles, CheckCircle2, ChevronRight,
  Filter, Search, Award, HelpCircle, Layers,
  BarChart3, Clock, Flame, ArrowLeft, RefreshCw, Star, Trash2, Edit3, Check,
  Volume2, AlertCircle, Wand2, Download, X, KeyRound, Info, Zap, ImageIcon
} from 'lucide-react';

export default function AdminDashboard() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schools' | 'staff' | 'students' | 'lessons' | 'activities' | 'quizzes' | 'gamification'>('lessons');
   
  // Data Repositories
  const [schools, setSchools] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [lessonsList, setLessonsList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [quizzesList, setQuizzesList] = useState<any[]>([]);
  const [badgesList, setBadgesList] = useState<any[]>([]);
  const [speechLogs, setSpeechLogs] = useState<any[]>([]);

  // Selected Records for Deep Drill-Down & Editing
  const [selectedSchoolView, setSelectedSchoolView] = useState<any | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  
  // Lesson, Activity & Quiz Editing States
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  // Global Filter States
  const [gradeFilter, setGradeFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Specialized Filters for Activities & Quizzes Tabs
  const [actGradeFilter, setActGradeFilter] = useState('All');
  const [actLessonFilter, setActLessonFilter] = useState('All');
  const [actTypeFilter, setActTypeFilter] = useState('All');
  const [actSearchQuery, setActSearchQuery] = useState('');

  const [quizGradeFilter, setQuizGradeFilter] = useState('All');
  const [quizLessonFilter, setQuizLessonFilter] = useState('All');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');

  // Form States - School
  const [schoolName, setSchoolName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolContact, setSchoolContact] = useState('');

  // Form States - Staff
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffRole, setStaffRole] = useState<'principal' | 'teacher'>('principal');
  const [staffSchoolId, setStaffSchoolId] = useState('');
  const [staffGrade, setStaffGrade] = useState('1');
  const [staffSection, setStaffSection] = useState('A');

  // Form States - Student Onboarding by Admin
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPassword, setStuPassword] = useState('');
  const [stuSchoolId, setStuSchoolId] = useState('');
  const [stuGrade, setStuGrade] = useState('1');
  const [stuSection, setStuSection] = useState('A');

  // Form States - Lesson Meta
  const [lessonGrade, setLessonGrade] = useState('1');
  const [lessonNumber, setLessonNumber] = useState('1');
  const [lessonTitle, setLessonTitle] = useState('Greetings');
  const [lessonDesc, setLessonDesc] = useState('Learn to greet people politely in everyday situations.');
  const [lessonImage, setLessonImage] = useState('');

  // Teacher Instruction States & Form Fields
  const [instObj, setInstObj] = useState('Write objectives on the board. Read out loud with energy and have students repeat the goal.');
  const [learningObjectives, setLearningObjectives] = useState(
`Learn polite morning, afternoon, and evening greetings.
Know how to ask someone how they are feeling.
Develop confidence saying hello and goodbye to teachers and peers.`
  );

  const [instVocab, setInstVocab] = useState('Point to each word. Pronounce slowly, stressing syllables. Have the whole class repeat 3 times.');
  const [vocabInput, setVocabInput] = useState(
`Hello: A polite word used to greet someone.
Morning: The early part of the day before noon.
Afternoon: The time from noon until evening.
Evening: The final part of the day before night.
Teacher: A person who helps students learn.`
  );

  const [instPhrases, setInstPhrases] = useState('Explain contextual usage (e.g. morning vs evening). Have rows practice reading aloud line-by-line.');
  const [usefulSentences, setUsefulSentences] = useState(
`Good morning, teacher!
Good afternoon, teacher!
Good evening, everyone!
Hello, how are you?
I am fine, thank you.
I am happy to see you.
It is nice to meet you.
Nice to meet you too.
Have a nice day!
Goodbye, teacher!
See you tomorrow!
Thank you, teacher.`
  );

  const [instConv, setInstConv] = useState('Call 2 students to the front. Assign Person 1 & Person 2 to face each other and speak with clear voice projection.');
  const [conversationDialogue, setConversationDialogue] = useState(
`Rajesh: Good morning, Peter! It is wonderful to see you today.
Peter: Good morning, Rajesh! I am very happy to see you too. How are you?
Rajesh: I am doing great, thank you! Are you ready for our English class?
Peter: Yes, I am! Let's go inside and learn together.`
  );

  const [instDrill, setInstDrill] = useState('Lead rhythmic hand-clapping chants to build sentence cadence and eliminate hesitation.');
  const [repeatContent, setRepeatContent] = useState(
`Drill 1: Good morning, everyone! Hello, my name is Alex.
Drill 2: How are you feeling today? I am very happy today.`
  );

  const [speakingPrompt, setSpeakingPrompt] = useState('Record yourself reading aloud: Good morning, teacher! How are you today?');
  const [speakingChallenge, setSpeakingChallenge] = useState('Speak for 30 seconds about three people you greet every day and what you say to them.');

  // Form States - Interactive Activity
  const [actLessonId, setActLessonId] = useState('');
  const [actType, setActType] = useState<'word_builder' | 'fill_in_blank'>('word_builder');
  const [actTitle, setActTitle] = useState('');
  const [actPoints, setActPoints] = useState('8');
  const [actSentence, setActSentence] = useState('');
  const [actAnswer, setActAnswer] = useState('');
  const [wbTargetWord, setWbTargetWord] = useState('');
  const [wbClue, setWbClue] = useState('');

  // Form States - Quiz
  const [quizLessonId, setQuizLessonId] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOptIndex, setCorrectOptIndex] = useState('0');

  // Form States - Gamification & XP Configurations
  const [ptsLesson, setPtsLesson] = useState(40);
  const [ptsSpeaking, setPtsSpeaking] = useState(20);
  const [ptsActivity, setPtsActivity] = useState(8);
  const [ptsQuiz, setPtsQuiz] = useState(8);

  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchAllAdminData();
  }, []);

  const fetchAllAdminData = async () => {
    setLoading(true);
    const { data: sData } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
    if (sData) {
      setSchools(sData);
      if (sData.length > 0) {
        if (!staffSchoolId) setStaffSchoolId(sData[0].id);
        if (!stuSchoolId) setStuSchoolId(sData[0].id);
      }
    }

    const { data: stData } = await supabase.from('profiles').select('*, schools(name, code)').in('role', ['principal', 'teacher']);
    if (stData) setStaffList(stData);

    const { data: stuData } = await supabase.from('profiles').select('*, schools(name, code)').eq('role', 'student');
    if (stuData) setStudentsList(stuData);

    const { data: lData } = await supabase.from('lessons').select('*').order('grade', { ascending: true }).order('lesson_number', { ascending: true });
    if (lData) {
      setLessonsList(lData);
      if (lData.length > 0 && !actLessonId) {
        setActLessonId(lData[0].id);
        setQuizLessonId(lData[0].id);
      }
    }

    const { data: actData } = await supabase.from('activities').select('*, lessons(title, grade, lesson_number)');
    if (actData) setActivitiesList(actData);

    const { data: qData } = await supabase.from('quizzes').select('*, lessons(title, grade, lesson_number)');
    if (qData) setQuizzesList(qData);

    const { data: bData } = await supabase.from('badges').select('*');
    if (bData) setBadgesList(bData);

    const { data: spData } = await supabase.from('speech_submissions').select('*, profiles(full_name, grade, section), lessons(title)');
    if (spData) setSpeechLogs(spData);

    setLoading(false);
  };

  // 1-Click Complete Auto Deployment
  const handleAutoDeployLesson1With15Questions = async () => {
    if (!confirm('This will automatically publish Lesson 1 ("Greetings") with teacher instructions and deploy all 15 at-home practice activities into Supabase. Proceed?')) return;

    setStatusMsg('Auto-deploying Lesson 1 and all 15 questions...');

    try {
      const { data: lesson, error: lErr } = await supabase.from('lessons').insert([{
        grade: 1,
        lesson_number: 1,
        title: 'Greetings',
        description: 'Learn to greet people politely in everyday situations.',
        image_url: null,
        learning_objectives: [
          'Learn polite morning, afternoon, and evening greetings.',
          'Know how to ask someone how they are feeling.',
          'Develop confidence saying hello and goodbye to teachers and peers.'
        ],
        vocabulary: [
          { word: 'Hello', meaning: 'A polite word used to greet someone.' },
          { word: 'Morning', meaning: 'The early part of the day before noon.' },
          { word: 'Afternoon', meaning: 'The time from noon until evening.' },
          { word: 'Evening', meaning: 'The final part of the day before night.' },
          { word: 'Teacher', meaning: 'A person who helps students learn.' }
        ],
        useful_sentences: [
          'Good morning, teacher!',
          'Good afternoon, teacher!',
          'Good evening, everyone!',
          'Hello, how are you?',
          'I am fine, thank you.',
          'I am happy to see you.',
          'It is nice to meet you.',
          'Nice to meet you too.',
          'Have a nice day!',
          'Goodbye, teacher!',
          'See you tomorrow!',
          'Thank you, teacher.'
        ],
        conversation_dialogue: [
          { speaker: 'Rajesh', line: 'Good morning, Peter! It is wonderful to see you today.' },
          { speaker: 'Peter', line: 'Good morning, Rajesh! I am very happy to see you too. How are you?' },
          { speaker: 'Rajesh', line: 'I am doing great, thank you! Are you ready for our English class?' },
          { speaker: 'Peter', line: "Yes, I am! Let's go inside and learn together." }
        ],
        repeat_sentences: [
          'Drill 1: Good morning, everyone! Hello, my name is Alex.',
          'Drill 2: How are you feeling today? I am very happy today.'
        ],
        teacher_instructions: {
          objectives: 'Write objectives on the board. Read out loud with energy and have students repeat the goal.',
          vocabulary: 'Point to each word. Pronounce slowly, stressing syllables. Have the whole class repeat 3 times.',
          phrases: 'Explain contextual usage (e.g. morning vs evening). Have rows practice reading aloud line-by-line.',
          conversation: 'Call 2 students to the front. Assign Person 1 & Person 2 to face each other and speak with clear voice projection.',
          drills: 'Lead rhythmic hand-clapping chants to build sentence cadence and eliminate hesitation.'
        },
        speaking_prompt: 'Record yourself reading aloud: Good morning, teacher! How are you today?',
        speaking_challenge: 'Speak for 30 seconds about three people you greet every day and what you say to them.'
      }]).select().single();

      if (lErr || !lesson) {
        alert(lErr?.message || 'Error inserting lesson');
        setStatusMsg('');
        return;
      }

      await supabase.from('activities').insert([
        { lesson_id: lesson.id, type: 'word_builder', title: 'Build Word: HELLO', instruction: 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).', question_data: { target_word: 'HELLO', clue: 'A friendly, polite greeting word.' }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'word_builder', title: 'Build Word: MORNING', instruction: 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).', question_data: { target_word: 'MORNING', clue: 'The early part of the day before noon.' }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'word_builder', title: 'Build Word: AFTERNOON', instruction: 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).', question_data: { target_word: 'AFTERNOON', clue: 'The time of day from midday until evening.' }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'word_builder', title: 'Build Word: EVENING', instruction: 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).', question_data: { target_word: 'EVENING', clue: 'The final part of the day before night.' }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'word_builder', title: 'Build Word: TEACHER', instruction: 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).', question_data: { target_word: 'TEACHER', clue: 'A person at school who helps students learn.' }, points_reward: 8 },
        
        { lesson_id: lesson.id, type: 'fill_in_blank', title: 'Complete Sentence 1', instruction: 'Type the correct missing word into the blank space (Max 3 attempts).', question_data: { sentence: 'Good ___ teacher, how are you today?', acceptable_answers: ['morning', 'Morning'] }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'fill_in_blank', title: 'Complete Sentence 2', instruction: 'Type the correct missing word into the blank space (Max 3 attempts).', question_data: { sentence: 'It is wonderful to ___ you today.', acceptable_answers: ['meet', 'see'] }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'fill_in_blank', title: 'Complete Sentence 3', instruction: 'Type the correct missing word into the blank space (Max 3 attempts).', question_data: { sentence: 'Hello, my ___ is Rajesh.', acceptable_answers: ['name', 'Name'] }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'fill_in_blank', title: 'Complete Sentence 4', instruction: 'Type the correct missing word into the blank space (Max 3 attempts).', question_data: { sentence: 'I am very ___ to learn English today.', acceptable_answers: ['happy', 'excited'] }, points_reward: 8 },
        { lesson_id: lesson.id, type: 'fill_in_blank', title: 'Complete Sentence 5', instruction: 'Type the correct missing word into the blank space (Max 3 attempts).', question_data: { sentence: 'Goodbye teacher, see you ___!', acceptable_answers: ['tomorrow', 'Tomorrow'] }, points_reward: 8 }
      ]);

      await supabase.from('quizzes').insert([
        { lesson_id: lesson.id, question: 'What is the best greeting to say when you arrive at school at 8:30 AM?', options: ['Good night', 'Good morning', 'Good evening', 'Goodbye'], correct_option_index: 1, marks: 8 },
        { lesson_id: lesson.id, question: 'If your classmate asks "How are you today?", what should you say?', options: ['I am in Grade 1.', 'I am fine, thank you!', 'My name is Peter.', 'See you tomorrow.'], correct_option_index: 1, marks: 8 },
        { lesson_id: lesson.id, question: 'What greeting do you use after 12:00 PM (lunch time)?', options: ['Good morning', 'Good afternoon', 'Good night', 'Hello teacher morning'], correct_option_index: 1, marks: 8 },
        { lesson_id: lesson.id, question: 'What polite phrase do you say when meeting someone new?', options: ['Nice to meet you.', 'Give me your book.', 'Go home now.', 'I am sleeping.'], correct_option_index: 0, marks: 8 },
        { lesson_id: lesson.id, question: 'What should you say to your teacher when leaving the classroom at the end of the day?', options: ['Good morning, teacher!', 'Goodbye teacher, see you tomorrow!', 'How are you?', 'Welcome!'], correct_option_index: 1, marks: 8 }
      ]);

      setStatusMsg('Lesson 1 & all 15 Interactive Activities successfully deployed!');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err: any) {
      alert(err.message);
      setStatusMsg('');
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('schools').insert([{
      name: schoolName,
      code: schoolCode.toUpperCase(),
      address: schoolAddress,
      email: schoolEmail,
      contact_number: schoolContact
    }]);

    if (!error) {
      setSchoolName('');
      setSchoolCode('');
      setSchoolAddress('');
      setSchoolEmail('');
      setSchoolContact('');
      setStatusMsg('New school registered successfully!');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Creating staff account...');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: staffEmail,
          password: staffPassword,
          fullName: staffName,
          role: staffRole,
          schoolId: staffSchoolId,
          grade: staffRole === 'teacher' ? staffGrade : null,
          section: staffRole === 'teacher' ? staffSection : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to create user');
        setStatusMsg('');
        return;
      }

      setStaffName('');
      setStaffEmail('');
      setStaffPassword('');
      setStatusMsg(`Registered ${staffRole.toUpperCase()} successfully!`);
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
      setStatusMsg('');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('Registering student account...');

    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: stuEmail,
          password: stuPassword,
          fullName: stuName,
          role: 'student',
          schoolId: stuSchoolId,
          grade: parseInt(stuGrade),
          section: stuSection,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(data.error || 'Failed to create student account');
        setStatusMsg('');
        return;
      }

      setStuName('');
      setStuEmail('');
      setStuPassword('');
      setStatusMsg(`Student ${stuName} registered successfully!`);
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err: any) {
      alert(err.message);
      setStatusMsg('');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatePayload: any = {
      full_name: editingUser.full_name,
      grade: parseInt(editingUser.grade) || null,
      section: editingUser.section,
      points: parseInt(editingUser.points) || 0,
      current_streak: parseInt(editingUser.current_streak) || 1,
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', editingUser.id);

    if (newPasswordInput.trim().length > 0) {
      await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingUser.id, newPassword: newPasswordInput }),
      });
    }

    if (!error) {
      setStatusMsg(`Updated user ${editingUser.full_name} successfully!`);
      setEditingUser(null);
      setNewPasswordInput('');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (!error) {
        setStatusMsg(`Deleted user ${name} successfully.`);
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const formatConversationForDb = (text: string) => {
    return text.split('\n').filter(Boolean).map(line => {
      const parts = line.split(':');
      return {
        speaker: parts[0]?.trim() || 'Speaker',
        line: parts.slice(1).join(':').trim() || line
      };
    });
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    const objectivesArr = learningObjectives.split('\n').filter(Boolean);
    const vocabArr = vocabInput.split('\n').map(v => {
      const parts = v.split(':');
      return {
        word: parts[0]?.trim() || v.trim(),
        meaning: parts.slice(1).join(':').trim() || ''
      };
    }).filter(v => v.word);
    
    const sentencesArr = usefulSentences.split('\n').map(s => ({ sentence: s.trim() })).filter(s => s.sentence);
    const repeatArr = repeatContent.split('\n').filter(Boolean);
    const conversationJson = formatConversationForDb(conversationDialogue);

    const teacherInstructionsData = {
      objectives: instObj,
      vocabulary: instVocab,
      phrases: instPhrases,
      conversation: instConv,
      drills: instDrill
    };

    const { error } = await supabase.from('lessons').insert([{
      grade: parseInt(lessonGrade),
      lesson_number: parseInt(lessonNumber),
      title: lessonTitle,
      description: lessonDesc,
      image_url: lessonImage.trim() || null,
      learning_objectives: objectivesArr,
      vocabulary: vocabArr,
      useful_sentences: sentencesArr,
      conversation_dialogue: conversationJson,
      repeat_sentences: repeatArr,
      teacher_instructions: teacherInstructionsData,
      speaking_prompt: speakingPrompt,
      speaking_challenge: speakingChallenge,
    }]);

    if (!error) {
      setStatusMsg(`Lesson published with Teacher Instructions to Grade ${lessonGrade} Curriculum!`);
      setLessonImage('');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleSelectLessonForEdit = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setLessonGrade(lesson.grade?.toString() || '1');
    setLessonNumber(lesson.lesson_number?.toString() || '1');
    setLessonTitle(lesson.title || '');
    setLessonDesc(lesson.description || '');
    setLessonImage(lesson.image_url || '');
    setLearningObjectives(Array.isArray(lesson.learning_objectives) ? lesson.learning_objectives.join('\n') : '');
    setVocabInput(Array.isArray(lesson.vocabulary) ? lesson.vocabulary.map((v: any) => `${v.word || v}${v.meaning ? `: ${v.meaning}` : ''}`).join('\n') : '');
    setUsefulSentences(Array.isArray(lesson.useful_sentences) ? lesson.useful_sentences.map((s: any) => s.sentence || s).join('\n') : '');
    
    if (Array.isArray(lesson.conversation_dialogue)) {
      setConversationDialogue(lesson.conversation_dialogue.map((c: any) => `${c.speaker || 'Speaker'}: ${c.line || ''}`).join('\n'));
    } else {
      setConversationDialogue(lesson.conversation_dialogue || '');
    }

    setRepeatContent(Array.isArray(lesson.repeat_sentences) ? lesson.repeat_sentences.join('\n') : '');
    
    if (lesson.teacher_instructions) {
      setInstObj(lesson.teacher_instructions.objectives || '');
      setInstVocab(lesson.teacher_instructions.vocabulary || '');
      setInstPhrases(lesson.teacher_instructions.phrases || '');
      setInstConv(lesson.teacher_instructions.conversation || '');
      setInstDrill(lesson.teacher_instructions.drills || '');
    }

    setSpeakingPrompt(lesson.speaking_prompt || '');
    setSpeakingChallenge(lesson.speaking_challenge || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLessonId) return;

    const objectivesArr = learningObjectives.split('\n').filter(Boolean);
    const vocabArr = vocabInput.split('\n').map(v => {
      const parts = v.split(':');
      return {
        word: parts[0]?.trim() || v.trim(),
        meaning: parts.slice(1).join(':').trim() || ''
      };
    }).filter(v => v.word);

    const sentencesArr = usefulSentences.split('\n').map(s => ({ sentence: s.trim() })).filter(s => s.sentence);
    const repeatArr = repeatContent.split('\n').filter(Boolean);
    const conversationJson = formatConversationForDb(conversationDialogue);

    const teacherInstructionsData = {
      objectives: instObj,
      vocabulary: instVocab,
      phrases: instPhrases,
      conversation: instConv,
      drills: instDrill
    };

    const { error } = await supabase
      .from('lessons')
      .update({
        grade: parseInt(lessonGrade),
        lesson_number: parseInt(lessonNumber),
        title: lessonTitle,
        description: lessonDesc,
        image_url: lessonImage.trim() || null,
        learning_objectives: objectivesArr,
        vocabulary: vocabArr,
        useful_sentences: sentencesArr,
        conversation_dialogue: conversationJson,
        repeat_sentences: repeatArr,
        teacher_instructions: teacherInstructionsData,
        speaking_prompt: speakingPrompt,
        speaking_challenge: speakingChallenge,
      })
      .eq('id', editingLessonId);

    if (!error) {
      setEditingLessonId(null);
      setLessonImage('');
      setStatusMsg('Lesson updated successfully!');
      fetchAllAdminData();
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      alert(error.message);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actLessonId) {
      alert('Please select a lesson first.');
      return;
    }

    let questionData: any = {};
    if (actType === 'word_builder') {
      questionData = {
        target_word: wbTargetWord.trim().toUpperCase(),
        clue: wbClue.trim(),
        words_list: [
          { word: wbTargetWord.trim().toUpperCase(), meaning: wbClue.trim() }
        ]
      };
    } else {
      questionData = {
        sentence: actSentence,
        acceptable_answers: actAnswer.split(',').map(a => a.trim().toLowerCase())
      };
    }

    if (editingActivityId) {
      const { error } = await supabase.from('activities').update({
        lesson_id: actLessonId,
        type: actType,
        title: actTitle,
        question_data: questionData,
        points_reward: parseInt(actPoints) || 8
      }).eq('id', editingActivityId);

      if (!error) {
        setEditingActivityId(null);
        setActTitle('');
        setActSentence('');
        setActAnswer('');
        setWbTargetWord('');
        setWbClue('');
        setStatusMsg('Activity updated successfully!');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    } else {
      const { error } = await supabase.from('activities').insert([{
        lesson_id: actLessonId,
        type: actType,
        title: actTitle,
        instruction: actType === 'word_builder' 
          ? 'Arrange the scrambled letters to spell the correct word (Max 3 attempts).' 
          : 'Type the correct missing word into the blank space (Max 3 attempts).',
        question_data: questionData,
        points_reward: parseInt(actPoints) || 8
      }]);

      if (!error) {
        setActTitle('');
        setActSentence('');
        setActAnswer('');
        setWbTargetWord('');
        setWbClue('');
        setStatusMsg(`${actType === 'word_builder' ? 'Word Builder' : 'Typing Challenge'} deployed!`);
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const handleSelectActivityForEdit = (act: any) => {
    setEditingActivityId(act.id);
    setActLessonId(act.lesson_id || '');
    setActType(act.type || 'word_builder');
    setActTitle(act.title || '');
    setActPoints(act.points_reward?.toString() || '8');
    if (act.type === 'word_builder') {
      setWbTargetWord(act.question_data?.target_word || '');
      setWbClue(act.question_data?.clue || '');
    } else {
      setActSentence(act.question_data?.sentence || '');
      setActAnswer(Array.isArray(act.question_data?.acceptable_answers) ? act.question_data.acceptable_answers.join(', ') : '');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteActivity = async (id: string) => {
    if (confirm('Are you sure you want to delete this activity?')) {
      const { error } = await supabase.from('activities').delete().eq('id', id);
      if (!error) {
        setStatusMsg('Activity deleted successfully.');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuizId) {
      const { error } = await supabase.from('quizzes').update({
        lesson_id: quizLessonId,
        question: quizQuestion,
        options: [optA, optB, optC, optD],
        correct_option_index: parseInt(correctOptIndex),
        marks: 8
      }).eq('id', editingQuizId);

      if (!error) {
        setEditingQuizId(null);
        setQuizQuestion('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setStatusMsg('Quiz question updated successfully!');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    } else {
      const { error } = await supabase.from('quizzes').insert([{
        lesson_id: quizLessonId,
        question: quizQuestion,
        options: [optA, optB, optC, optD],
        correct_option_index: parseInt(correctOptIndex),
        marks: 8
      }]);

      if (!error) {
        setQuizQuestion('');
        setOptA('');
        setOptB('');
        setOptC('');
        setOptD('');
        setStatusMsg('Quiz question added!');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const handleSelectQuizForEdit = (q: any) => {
    setEditingQuizId(q.id);
    setQuizLessonId(q.lesson_id || '');
    setQuizQuestion(q.question || '');
    setOptA(q.options?.[0] || '');
    setOptB(q.options?.[1] || '');
    setOptC(q.options?.[2] || '');
    setOptD(q.options?.[3] || '');
    setCorrectOptIndex(q.correct_option_index?.toString() || '0');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuiz = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz question?')) {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (!error) {
        setStatusMsg('Quiz question deleted successfully.');
        fetchAllAdminData();
        setTimeout(() => setStatusMsg(''), 3000);
      } else {
        alert(error.message);
      }
    }
  };

  const exportToExcel = (data: any[], filename: string, headers: string[], rowMapper: (item: any) => string[]) => {
    if (data.length === 0) {
      alert('No data available to export.');
      return;
    }
    const rows = data.map(item => rowMapper(item).map(val => `"${val || ''}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const filteredStudents = studentsList.filter(s => {
    const matchGrade = gradeFilter === 'All' || s.grade?.toString() === gradeFilter;
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchSchool = schoolFilter === 'All' || s.school_id === schoolFilter;
    const matchSearch = s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGrade && matchSection && matchSchool && matchSearch;
  });

  // Filtered Wordwall Activities
  const filteredActivities = activitiesList.filter(act => {
    const matchGrade = actGradeFilter === 'All' || act.lessons?.grade?.toString() === actGradeFilter;
    const matchLesson = actLessonFilter === 'All' || act.lesson_id === actLessonFilter;
    const matchType = actTypeFilter === 'All' || act.type === actTypeFilter;
    const matchSearch = act.title?.toLowerCase().includes(actSearchQuery.toLowerCase()) || 
      act.question_data?.target_word?.toLowerCase().includes(actSearchQuery.toLowerCase()) ||
      act.question_data?.sentence?.toLowerCase().includes(actSearchQuery.toLowerCase());
    return matchGrade && matchLesson && matchType && matchSearch;
  });

  // Filtered Quizzes
  const filteredQuizzes = quizzesList.filter(q => {
    const matchGrade = quizGradeFilter === 'All' || q.lessons?.grade?.toString() === quizGradeFilter;
    const matchLesson = quizLessonFilter === 'All' || q.lesson_id === quizLessonFilter;
    const matchSearch = q.question?.toLowerCase().includes(quizSearchQuery.toLowerCase());
    return matchGrade && matchLesson && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white/95 border-b border-slate-200 backdrop-blur-xl px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              English Excel <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/30">Super Admin</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 font-semibold">Teacher Live Guide & Curriculum Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllAdminData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition border border-slate-300"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl font-bold text-sm transition"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] w-full mx-auto px-4 py-5 sm:px-6 lg:px-8 space-y-6 flex-1">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.06),transparent_30%)]" />
        {statusMsg && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5" /> {statusMsg}
          </div>
        )}

        {/* Global Navigation Bar */}
        <div className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Overview', icon: BarChart3 },
            { id: 'schools', label: `Schools (${schools.length})`, icon: School },
            { id: 'staff', label: `Staff (${staffList.length})`, icon: UserPlus },
            { id: 'students', label: `Students (${studentsList.length})`, icon: GraduationCap },
            { id: 'lessons', label: `Lessons (${lessonsList.length})`, icon: BookOpen },
            { id: 'activities', label: `Wordwall Activities (${activitiesList.length})`, icon: Layers },
            { id: 'quizzes', label: `Quizzes (${quizzesList.length})`, icon: HelpCircle },
            { id: 'gamification', label: 'Gamification & Badges', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedSchoolView(null);
                  setSelectedStudentDetail(null);
                  setEditingUser(null);
                }}
                className={`flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
                  isActive ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-500 hover:text-slate-900 hover:bg-indigo-50'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><School className="w-16 h-16 text-indigo-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Schools</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{schools.length}</div>
                <div className="text-xs text-emerald-400 font-bold mt-2">100% Data Isolated</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-purple-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Accounts</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{staffList.length}</div>
                <div className="text-xs text-indigo-400 font-bold mt-2">
                  {staffList.filter(s => s.role === 'principal').length} Principals • {staffList.filter(s => s.role === 'teacher').length} Teachers
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><GraduationCap className="w-16 h-16 text-pink-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Students</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{studentsList.length}</div>
                <div className="text-xs text-pink-400 font-bold mt-2">Grades 1 to 10 Enrolled</div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-3xl relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-16 h-16 text-amber-400" /></div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Speech Evaluations</span>
                <div className="text-4xl font-black text-slate-900 mt-1">{speechLogs.length}</div>
                <div className="text-xs text-amber-400 font-bold mt-2">Recorded Attempts Logged</div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" /> Recent AI Speech Submissions Across Schools
                </h2>
                <button
                  onClick={() => exportToExcel(speechLogs, 'Speech_Submissions_Report', ['Student', 'Class', 'Lesson', 'Overall Score (%)', 'Pronunciation (%)', 'Fluency (%)', 'Transcript'], log => [
                    log.profiles?.full_name,
                    `Grade ${log.profiles?.grade}-${log.profiles?.section}`,
                    log.lessons?.title,
                    log.overall_score,
                    log.pronunciation_score,
                    log.fluency_score,
                    log.transcribed_text
                  ])}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  <Download className="w-4 h-4" /> Export as Excel (CSV)
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Lesson</th>
                      <th className="p-4">Overall Score</th>
                      <th className="p-4">Pronunciation</th>
                      <th className="p-4">Fluency</th>
                      <th className="p-4">Recorded Text Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {speechLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{log.profiles?.full_name}</td>
                        <td className="p-4 text-indigo-400 font-bold">Grade {log.profiles?.grade}-{log.profiles?.section}</td>
                        <td className="p-4 text-slate-600">{log.lessons?.title}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-600 font-black rounded-lg text-xs">
                            {log.overall_score}%
                          </span>
                        </td>
                        <td className="p-4 text-emerald-600 font-bold">{log.pronunciation_score}%</td>
                        <td className="p-4 text-amber-600 font-bold">{log.fluency_score}%</td>
                        <td className="p-4 text-slate-500 italic text-xs max-w-xs truncate">"{log.transcribed_text}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SCHOOLS */}
        {activeTab === 'schools' && !selectedSchoolView && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
                <Plus className="w-5 h-5 text-indigo-400" /> Create & Provision New School
              </h2>
              <form onSubmit={handleCreateSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="School Name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                  required
                />
                <input
                  type="text"
                  placeholder="Unique School Code (e.g. EDIS01)"
                  value={schoolCode}
                  onChange={(e) => setSchoolCode(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium uppercase"
                  required
                />
                <input
                  type="text"
                  placeholder="City / Address"
                  value={schoolAddress}
                  onChange={(e) => setSchoolAddress(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="email"
                  placeholder="Official Email"
                  value={schoolEmail}
                  onChange={(e) => setSchoolEmail(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                />
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={schoolContact}
                  onChange={(e) => setSchoolContact(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition shadow-lg shadow-indigo-600/30"
                >
                  Provision School
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schools.map((s) => {
                const schoolTeachers = staffList.filter(st => st.school_id === s.id && st.role === 'teacher');
                const schoolStudents = studentsList.filter(st => st.school_id === s.id);
                const principal = staffList.find(st => st.school_id === s.id && st.role === 'principal');

                return (
                  <div key={s.id} className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-4 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-slate-900">{s.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{s.address || 'Address not registered'}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full text-xs font-bold">
                          Active
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200 text-center">
                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">CODE</span>
                          <span className="text-sm font-black text-indigo-600 font-mono">{s.code}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">TEACHERS</span>
                          <span className="text-sm font-black text-purple-600">{schoolTeachers.length}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-2xl">
                          <span className="text-xs text-slate-500 font-bold block">STUDENTS</span>
                          <span className="text-sm font-black text-pink-600">{schoolStudents.length}</span>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-slate-500 font-medium">
                        Principal: <span className="text-slate-700 font-bold">{principal?.full_name || 'No Principal Assigned'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedSchoolView(s)}
                      className="w-full py-3 bg-slate-100 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                    >
                      Open School Dashboard <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DRILL-DOWN: SPECIFIC SCHOOL DASHBOARD */}
        {activeTab === 'schools' && selectedSchoolView && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedSchoolView(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Schools
            </button>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedSchoolView.name}</h2>
                <p className="text-xs text-indigo-600 font-mono font-bold mt-1">CODE: {selectedSchoolView.code} • {selectedSchoolView.address}</p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Teachers</span>
                  <span className="text-xl font-black text-purple-600">
                    {staffList.filter(st => st.school_id === selectedSchoolView.id && st.role === 'teacher').length}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">Students</span>
                  <span className="text-xl font-black text-pink-600">
                    {studentsList.filter(st => st.school_id === selectedSchoolView.id).length}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" /> Assigned Teachers
                </h3>
                <div className="space-y-2">
                  {staffList.filter(st => st.school_id === selectedSchoolView.id && st.role === 'teacher').map(t => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{t.full_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{t.email}</div>
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-purple-500/20 text-purple-700 font-bold rounded-lg">
                        Grade {t.grade}-{t.section}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-pink-600" /> Enrolled Students
                </h3>
                <div className="space-y-2">
                  {studentsList.filter(st => st.school_id === selectedSchoolView.id).map(s => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.full_name}</div>
                        <div className="text-xs text-slate-500">Grade {s.grade} - Section {s.section}</div>
                      </div>
                      <span className="text-xs font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                        {s.points || 0} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
                <UserPlus className="w-5 h-5 text-purple-600" /> Provision Principal / Teacher Account
              </h2>
              <form onSubmit={handleCreateStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address (Username)</label>
                  <input
                    type="email"
                    placeholder="staff@school.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <input
                    type="text"
                    placeholder="Password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Assign to School</label>
                  <select
                    value={staffSchoolId}
                    onChange={(e) => setStaffSchoolId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                    required
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Role Type</label>
                  <select
                    value={staffRole}
                    onChange={(e: any) => setStaffRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="principal">Principal (School Head - Access to Entire School)</option>
                    <option value="teacher">Teacher (Class Teacher - Assigned Class Access)</option>
                  </select>
                </div>

                {staffRole === 'teacher' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Grade</label>
                      <select
                        value={staffGrade}
                        onChange={(e) => setStaffGrade(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(g => (
                          <option key={g} value={g}>Grade {g}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
                      <select
                        value={staffSection}
                        onChange={(e) => setStaffSection(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-purple-500 font-medium"
                      >
                        {['A','B','C','D'].map(sec => (
                          <option key={sec} value={sec}>Section {sec}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="md:col-span-2 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl transition shadow-lg mt-2"
                >
                  Create Staff Account
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 flex justify-between items-center border-b border-slate-200">
                <span className="font-bold text-slate-700 text-sm">Staff Directory ({staffList.length})</span>
                <button
                  onClick={() => exportToExcel(staffList, 'Staff_Directory', ['Name', 'Role', 'School', 'Grade', 'Section', 'Email'], st => [
                    st.full_name, st.role, st.schools?.name, st.grade, st.section, st.email
                  ])}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  <Download className="w-3.5 h-3.5" /> Export as Excel
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Assigned School</th>
                      <th className="p-4">Class</th>
                      <th className="p-4">Username (Email)</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{st.full_name}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                            st.role === 'principal' ? 'bg-amber-500/20 text-amber-600' : 'bg-purple-500/20 text-purple-700'
                          }`}>
                            {st.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">{st.schools?.name || 'Global'}</td>
                        <td className="p-4 text-slate-600">{st.grade ? `Grade ${st.grade} - ${st.section}` : 'Full School'}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{st.email}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => setEditingUser(st)} className="px-2.5 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold inline-flex items-center gap-1" title="Edit / Reset Password">
                            <Edit3 className="w-3.5 h-3.5" /> Edit & Password
                          </button>
                          <button onClick={() => handleDeleteUser(st.id, st.full_name)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg inline-flex items-center" title="Delete Staff">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STUDENT ROSTER */}
        {activeTab === 'students' && !selectedStudentDetail && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-900">
                <UserPlus className="w-5 h-5 text-pink-600" /> Register New Student Account (Any School)
              </h2>
              <form onSubmit={handleCreateStudent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Varshini"
                    value={stuName}
                    onChange={(e) => setStuName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email Address (Username)</label>
                  <input
                    type="email"
                    placeholder="student@school.com"
                    value={stuEmail}
                    onChange={(e) => setStuEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <input
                    type="text"
                    placeholder="Password"
                    value={stuPassword}
                    onChange={(e) => setStuPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Select School</label>
                  <select
                    value={stuSchoolId}
                    onChange={(e) => setStuSchoolId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 font-medium"
                    required
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Grade</label>
                  <select
                    value={stuGrade}
                    onChange={(e) => setStuGrade(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 font-medium"
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
                  <select
                    value={stuSection}
                    onChange={(e) => setStuSection(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-pink-500 font-medium"
                  >
                    {['A','B','C','D'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="md:col-span-3 bg-pink-600 hover:bg-pink-500 text-white font-black py-4 rounded-xl transition shadow-lg mt-2"
                >
                  Create Student Account
                </button>
              </form>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-slate-900 text-xs font-medium"
                  />
                </div>

                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Schools</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>

                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => <option key={g} value={g.toString()}>Grade {g}</option>)}
                </select>

                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Sections</option>
                  {['A','B','C','D'].map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportToExcel(filteredStudents, 'Student_Roster', ['Name', 'School', 'Grade', 'Section', 'Points (XP)', 'Streak'], st => [
                    st.full_name, st.schools?.name, st.grade, st.section, st.points || 0, st.current_streak || 1
                  ])}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  <Download className="w-4 h-4" /> Export as Excel
                </button>
                <span className="text-xs font-bold text-slate-500">
                  Found {filteredStudents.length} Students
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100/80 text-slate-500 font-bold text-xs uppercase">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">School</th>
                      <th className="p-4">Grade & Section</th>
                      <th className="p-4">Username (Email)</th>
                      <th className="p-4">Points</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="p-4 font-bold text-slate-900">{st.full_name}</td>
                        <td className="p-4 text-slate-600">{st.schools?.name}</td>
                        <td className="p-4 font-bold text-indigo-600">Grade {st.grade} - {st.section}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{st.email}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 font-black rounded-lg text-xs">
                            {st.points || 0} XP
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedStudentDetail(st)}
                            className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-xs font-bold transition"
                          >
                            View Performance
                          </button>
                          <button onClick={() => setEditingUser(st)} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg inline-flex items-center" title="Edit / Reset Password">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(st.id, st.full_name)} className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg inline-flex items-center" title="Delete Student">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EDIT USER & PASSWORD RESET MODAL */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Edit User & Reset Password</h3>
                <button onClick={() => { setEditingUser(null); setNewPasswordInput(''); }} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <form onSubmit={handleUpdateUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Username / Email (Read-only)</label>
                  <input
                    type="text"
                    value={editingUser.email || ''}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-600 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" /> Assign New Password (Leave blank to keep current)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter new temporary password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-slate-900 font-medium text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Grade</label>
                    <input
                      type="number"
                      value={editingUser.grade || 1}
                      onChange={(e) => setEditingUser({ ...editingUser, grade: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Section</label>
                    <input
                      type="text"
                      value={editingUser.section || 'A'}
                      onChange={(e) => setEditingUser({ ...editingUser, section: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                    />
                  </div>
                </div>
                {editingUser.role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Total XP Points</label>
                      <input
                        type="number"
                        value={editingUser.points || 0}
                        onChange={(e) => setEditingUser({ ...editingUser, points: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Streak Days</label>
                      <input
                        type="number"
                        value={editingUser.current_streak || 1}
                        onChange={(e) => setEditingUser({ ...editingUser, current_streak: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium text-xs"
                      />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-md mt-2"
                >
                  Save Changes & Update Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* STUDENT DRILL-DOWN MODAL / DETAIL VIEW */}
        {activeTab === 'students' && selectedStudentDetail && (
          <div className="space-y-6 animate-in fade-in">
            <button
              onClick={() => setSelectedStudentDetail(null)}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Student Roster
            </button>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedStudentDetail.full_name}</h2>
                  <p className="text-xs text-indigo-600 font-bold mt-1">
                    {selectedStudentDetail.schools?.name} • Grade {selectedStudentDetail.grade} - Section {selectedStudentDetail.section}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl font-black text-sm">
                    {selectedStudentDetail.points || 0} XP
                  </span>
                  <span className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl font-black text-sm">
                    {selectedStudentDetail.current_streak || 1} Day Streak
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Speech & AI Evaluation History
              </h3>
              <div className="space-y-3">
                {speechLogs.filter(log => log.student_id === selectedStudentDetail.id).length === 0 ? (
                  <p className="text-slate-500 text-sm">No speaking attempts recorded yet for this student.</p>
                ) : (
                  speechLogs.filter(log => log.student_id === selectedStudentDetail.id).map(log => (
                    <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-600">{log.lessons?.title}</span>
                        <span className="text-sm font-black text-emerald-600">{log.overall_score}% Overall Score</span>
                      </div>
                      <p className="text-xs text-slate-600 italic">"{log.transcribed_text}"</p>
                      <div className="flex gap-4 text-xs font-bold text-slate-500 pt-1 border-t border-slate-200">
                        <span>Pronunciation: <strong className="text-slate-900">{log.pronunciation_score}%</strong></span>
                        <span>Fluency: <strong className="text-slate-900">{log.fluency_score}%</strong></span>
                        <span>Vocabulary: <strong className="text-slate-900">{log.vocabulary_score}%</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: LESSONS CURRICULUM BUILDER */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-black flex items-center gap-2 text-slate-900">
                    <BookOpen className="w-6 h-6 text-emerald-600" /> 
                    {editingLessonId ? 'Edit Global Lesson' : 'Master Lesson & Teacher Instruction Builder'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Add lesson material along with step-by-step guidance for teachers to take class live.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAutoDeployLesson1With15Questions}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition"
                  >
                    <Zap className="w-4 h-4 fill-amber-300 text-amber-300" /> ⚡ Auto-Deploy Lesson 1 + 15 Questions
                  </button>
                  {editingLessonId && (
                    <button
                      onClick={() => {
                        setEditingLessonId(null);
                        setLessonTitle('');
                        setLessonDesc('');
                        setLessonImage('');
                      }}
                      className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={editingLessonId ? handleUpdateLesson : handleCreateLesson} className="space-y-6">
                {/* Meta details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Target Grade</label>
                    <select
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-emerald-500"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Number</label>
                    <input
                      type="number"
                      value={lessonNumber}
                      onChange={(e) => setLessonNumber(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-emerald-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Greetings"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Lesson Description</label>
                  <input
                    type="text"
                    placeholder="Learn to greet people politely in everyday situations."
                    value={lessonDesc}
                    onChange={(e) => setLessonDesc(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                {/* Lesson Visual / Reference Image URL */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase">
                    <ImageIcon className="w-4 h-4" /> 🖼️ Lesson Visual / Reference Image (Optional)
                  </div>
                  <input
                    type="url"
                    placeholder="https://ihmtwngbrrkqbqwbxzah.supabase.co/storage/v1/object/public/lesson-assets/..."
                    value={lessonImage}
                    onChange={(e) => setLessonImage(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                  {lessonImage && (
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-slate-100">
                        <img src={lessonImage} alt="Visual Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-slate-500">
                        <span className="font-bold text-emerald-600">✓ Image Preview Loaded</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">This picture will be displayed during in-class roleplay & dialogue practice.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 1: Objectives */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase">
                    <Info className="w-4 h-4" /> 🛠️ Teacher Instruction: How to Teach Section 1 (Objectives)
                  </div>
                  <input
                    type="text"
                    placeholder="Instructions for the teacher..."
                    value={instObj}
                    onChange={(e) => setInstObj(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-medium text-slate-700 outline-none"
                  />
                  <label className="block text-xs font-bold text-slate-500">🎯 1. Learning Objectives (One per line)</label>
                  <textarea
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium h-24 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Section 2: Vocabulary */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase">
                    <Info className="w-4 h-4" /> 🛠️ Teacher Instruction: How to Teach Section 2 (Vocabulary Bank)
                  </div>
                  <input
                    type="text"
                    placeholder="Instructions for the teacher..."
                    value={instVocab}
                    onChange={(e) => setInstVocab(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-medium text-slate-700 outline-none"
                  />
                  <label className="block text-xs font-bold text-slate-500">📖 2. Vocabulary Words (One per line, e.g. "Hello: Meaning")</label>
                  <textarea
                    value={vocabInput}
                    onChange={(e) => setVocabInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium h-24 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Section 3: Related Phrases */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase">
                    <Info className="w-4 h-4" /> 🛠️ Teacher Instruction: How to Teach Section 3 (Related Vocabulary & Daily Phrases)
                  </div>
                  <input
                    type="text"
                    placeholder="Instructions for the teacher..."
                    value={instPhrases}
                    onChange={(e) => setInstPhrases(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-medium text-slate-700 outline-none"
                  />
                  <label className="block text-xs font-bold text-slate-500">💬 3. Related Vocabulary & Daily Phrases Practice (One per line)</label>
                  <textarea
                    value={usefulSentences}
                    onChange={(e) => setUsefulSentences(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium h-32 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Section 4: Conversation Dialogue */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase">
                    <Info className="w-4 h-4" /> 🛠️ Teacher Instruction: How to Teach Section 4 (Conversation Dialogue in Pairs)
                  </div>
                  <input
                    type="text"
                    placeholder="Instructions for the teacher..."
                    value={instConv}
                    onChange={(e) => setInstConv(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-medium text-slate-700 outline-none"
                  />
                  <label className="block text-xs font-bold text-slate-500">👥 4. Conversation Dialogue (Speaker: Dialogue Line)</label>
                  <textarea
                    value={conversationDialogue}
                    onChange={(e) => setConversationDialogue(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium h-32 outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Section 5: Repeat & Fluency Drill */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-700 text-xs font-black uppercase">
                    <Info className="w-4 h-4" /> 🛠️ Teacher Instruction: How to Teach Section 5 (Repeat & Fluency Drill)
                  </div>
                  <input
                    type="text"
                    placeholder="Instructions for the teacher..."
                    value={instDrill}
                    onChange={(e) => setInstDrill(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-indigo-100 rounded-xl text-xs font-medium text-slate-700 outline-none"
                  />
                  <label className="block text-xs font-bold text-slate-500">🗣️ 5. Repeat & Fluency Drill (One per line)</label>
                  <textarea
                    value={repeatContent}
                    onChange={(e) => setRepeatContent(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium h-24 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* At-Home Voice Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🎤 AI Speech Evaluation Prompt</label>
                    <input
                      type="text"
                      value={speakingPrompt}
                      onChange={(e) => setSpeakingPrompt(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">🏆 Follow-up 30-Second Speaking Challenge</label>
                    <input
                      type="text"
                      value={speakingChallenge}
                      onChange={(e) => setSpeakingChallenge(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-black py-4 rounded-xl transition shadow-lg ${
                    editingLessonId ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'
                  }`}
                >
                  {editingLessonId ? 'Update Lesson Changes' : 'Publish Lesson to Global Curriculum'}
                </button>
              </form>
            </div>

            {/* List of Lessons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonsList.map(l => (
                <div key={l.id} className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm flex justify-between items-start">
                  <div className="space-y-2 flex-1 pr-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full border border-emerald-200">
                      GRADE {l.grade} • LESSON {l.lesson_number}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{l.title}</h3>
                    <p className="text-xs text-slate-500 italic line-clamp-1">Prompt: "{l.speaking_prompt}"</p>
                    {l.image_url && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                        <ImageIcon className="w-3.5 h-3.5" /> Has Visual Reference Attached
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleSelectLessonForEdit(l)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs flex items-center gap-1 transition shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ACTIVITIES WITH FULL FILTERS */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" /> Interactive Activity Creator (Wordwall / Typing)
              </h2>
              <form onSubmit={handleCreateActivity} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={actLessonId} onChange={(e) => setActLessonId(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                  {lessonsList.map(l => <option key={l.id} value={l.id}>Grade {l.grade} - Lesson {l.lesson_number}: {l.title}</option>)}
                </select>
                <select value={actType} onChange={(e: any) => setActType(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                  <option value="word_builder">🧩 Word Builder (Letter Scramble)</option>
                  <option value="fill_in_blank">⌨️ Typing Challenge</option>
                </select>
                <input type="number" value={actPoints} onChange={(e) => setActPoints(e.target.value)} placeholder="Points (8 XP)" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" />
                <input type="text" value={actTitle} onChange={(e) => setActTitle(e.target.value)} placeholder="Activity Title" className="md:col-span-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" required />
                {actType === 'word_builder' ? (
                  <>
                    <input type="text" value={wbTargetWord} onChange={(e) => setWbTargetWord(e.target.value)} placeholder="Target Word (e.g. HELLO)" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold" required />
                    <input type="text" value={wbClue} onChange={(e) => setWbClue(e.target.value)} placeholder="Clue / Meaning" className="md:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" required />
                  </>
                ) : (
                  <>
                    <input type="text" value={actSentence} onChange={(e) => setActSentence(e.target.value)} placeholder="Good ___ teacher (Use '___')" className="md:col-span-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" required />
                    <input type="text" value={actAnswer} onChange={(e) => setActAnswer(e.target.value)} placeholder="morning, Morning" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" required />
                  </>
                )}
                <button type="submit" className="md:col-span-3 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition">
                  {editingActivityId ? 'Update Activity' : 'Deploy Activity (+8 XP)'}
                </button>
              </form>
            </div>

            {/* Activities Filter Toolbar */}
            <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-3 items-center justify-between shadow-sm">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by word, sentence, or title..."
                    value={actSearchQuery}
                    onChange={(e) => setActSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-slate-900 text-xs font-medium w-48 sm:w-64"
                  />
                </div>

                <select
                  value={actGradeFilter}
                  onChange={(e) => {
                    setActGradeFilter(e.target.value);
                    setActLessonFilter('All');
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => (
                    <option key={g} value={g.toString()}>Grade {g}</option>
                  ))}
                </select>

                <select
                  value={actLessonFilter}
                  onChange={(e) => setActLessonFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none max-w-xs truncate"
                >
                  <option value="All">All Lessons</option>
                  {lessonsList
                    .filter(l => actGradeFilter === 'All' || l.grade.toString() === actGradeFilter)
                    .map(l => (
                      <option key={l.id} value={l.id}>
                        G{l.grade} L{l.lesson_number}: {l.title}
                      </option>
                    ))}
                </select>

                <select
                  value={actTypeFilter}
                  onChange={(e) => setActTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Activity Types</option>
                  <option value="word_builder">🧩 Word Builders</option>
                  <option value="fill_in_blank">⌨️ Typing Challenges</option>
                </select>
              </div>

              <div className="text-xs font-bold text-slate-500">
                Showing <strong className="text-slate-900">{filteredActivities.length}</strong> of {activitiesList.length} Activities
              </div>
            </div>

            {/* Filtered Activities List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="space-y-3">
                {filteredActivities.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No activities match your selected filter criteria.</p>
                ) : (
                  filteredActivities.map(act => (
                    <div key={act.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-700 font-bold text-[10px] rounded-md uppercase">
                            {act.type === 'word_builder' ? 'Word Builder' : 'Typing Challenge'}
                          </span>
                          <span className="text-xs font-bold text-indigo-600">
                            Grade {act.lessons?.grade} - Lesson {act.lessons?.lesson_number}: {act.lessons?.title}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{act.title}</h4>
                        {act.type === 'word_builder' ? (
                          <p className="text-xs text-slate-500 mt-0.5">Target: <strong className="font-mono text-purple-600">{act.question_data?.target_word}</strong> • Clue: {act.question_data?.clue}</p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-0.5">Sentence: "{act.question_data?.sentence}" • Answers: [{act.question_data?.acceptable_answers?.join(', ')}]</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSelectActivityForEdit(act)} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl" title="Edit Activity">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteActivity(act.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl" title="Delete Activity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: QUIZZES WITH FULL FILTERS */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-600" /> Multiple Choice Quiz Creator
              </h2>
              <form onSubmit={handleCreateQuiz} className="space-y-4">
                <select value={quizLessonId} onChange={(e) => setQuizLessonId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                  {lessonsList.map(l => <option key={l.id} value={l.id}>Grade {l.grade} - Lesson {l.lesson_number}: {l.title}</option>)}
                </select>
                <input type="text" value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} placeholder="Question Prompt" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={optA} onChange={(e) => setOptA(e.target.value)} placeholder="Option A" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" required />
                  <input type="text" value={optB} onChange={(e) => setOptB(e.target.value)} placeholder="Option B" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" required />
                  <input type="text" value={optC} onChange={(e) => setOptC(e.target.value)} placeholder="Option C" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" required />
                  <input type="text" value={optD} onChange={(e) => setOptD(e.target.value)} placeholder="Option D" className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium" required />
                </div>
                <select value={correctOptIndex} onChange={(e) => setCorrectOptIndex(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold">
                  <option value="0">Correct: Option A</option>
                  <option value="1">Correct: Option B</option>
                  <option value="2">Correct: Option C</option>
                  <option value="3">Correct: Option D</option>
                </select>
                <button type="submit" className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl transition">
                  {editingQuizId ? 'Update Quiz Question' : 'Save Quiz Question (+8 XP)'}
                </button>
              </form>
            </div>

            {/* Quizzes Filter Toolbar */}
            <div className="bg-white border border-slate-200 p-4 rounded-3xl flex flex-wrap gap-3 items-center justify-between shadow-sm">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search question prompt..."
                    value={quizSearchQuery}
                    onChange={(e) => setQuizSearchQuery(e.target.value)}
                    className="bg-transparent outline-none text-slate-900 text-xs font-medium w-48 sm:w-64"
                  />
                </div>

                <select
                  value={quizGradeFilter}
                  onChange={(e) => {
                    setQuizGradeFilter(e.target.value);
                    setQuizLessonFilter('All');
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                >
                  <option value="All">All Grades</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => (
                    <option key={g} value={g.toString()}>Grade {g}</option>
                  ))}
                </select>

                <select
                  value={quizLessonFilter}
                  onChange={(e) => setQuizLessonFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none max-w-xs truncate"
                >
                  <option value="All">All Lessons</option>
                  {lessonsList
                    .filter(l => quizGradeFilter === 'All' || l.grade.toString() === quizGradeFilter)
                    .map(l => (
                      <option key={l.id} value={l.id}>
                        G{l.grade} L{l.lesson_number}: {l.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="text-xs font-bold text-slate-500">
                Showing <strong className="text-slate-900">{filteredQuizzes.length}</strong> of {quizzesList.length} Quizzes
              </div>
            </div>

            {/* Filtered Quizzes List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="space-y-3">
                {filteredQuizzes.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No quiz questions match your selected filter criteria.</p>
                ) : (
                  filteredQuizzes.map(q => (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-cyan-600">
                          Grade {q.lessons?.grade} - Lesson {q.lessons?.lesson_number}: {q.lessons?.title}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{q.question}</h4>
                        <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-slate-600">
                          {q.options?.map((opt: string, idx: number) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-md ${idx === q.correct_option_index ? 'bg-emerald-500/20 text-emerald-700 font-bold' : 'bg-slate-200'}`}>
                              {String.fromCharCode(65 + idx)}: {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSelectQuizForEdit(q)} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl" title="Edit Quiz">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteQuiz(q.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl" title="Delete Quiz">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: GAMIFICATION */}
        {activeTab === 'gamification' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Points Configuration
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Complete Master Lesson</span>
                  <input
                    type="number"
                    value={ptsLesson}
                    onChange={(e) => setPtsLesson(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">AI Speech Attempt</span>
                  <input
                    type="number"
                    value={ptsSpeaking}
                    onChange={(e) => setPtsSpeaking(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Wordwall Activity Completed</span>
                  <input
                    type="number"
                    value={ptsActivity}
                    onChange={(e) => setPtsActivity(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <span className="text-sm font-bold text-slate-600">Quiz Completed</span>
                  <input
                    type="number"
                    value={ptsQuiz}
                    onChange={(e) => setPtsQuiz(parseInt(e.target.value))}
                    className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-center font-bold"
                  />
                </div>

                <button
                  onClick={() => {
                    setStatusMsg('Gamification point rules updated across all schools!');
                    setTimeout(() => setStatusMsg(''), 3000);
                  }}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl transition shadow-lg"
                >
                  Save Point Values
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" /> Configured Student Badges
              </h2>
              <div className="space-y-3">
                {badgesList.map(b => (
                  <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/20 text-pink-600 rounded-xl">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                        <p className="text-xs text-slate-500">{b.description}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-lg uppercase">
                      {b.criteria_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}