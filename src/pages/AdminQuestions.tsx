import React, { useEffect, useState } from 'react';
import { questionAPI, topicAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { SkeletonTable } from '../components/Loader';
import { PenToolIcon, XIcon } from '../components/Icons';

interface Topic    { id: number; name: string; }
interface Question { id: number; question_text: string; topic_id: number; options: string[]; correct_answer: string; }

const AdminQuestions: React.FC = () => {
  const [topics, setTopics]               = useState<Topic[]>([]);
  const [questions, setQuestions]         = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | ''>('');
  const [topicId, setTopicId]             = useState<number | ''>('');
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText]   = useState('');
  const [optionA, setOptionA]             = useState('');
  const [optionB, setOptionB]             = useState('');
  const [optionC, setOptionC]             = useState('');
  const [optionD, setOptionD]             = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    topicAPI.getAll()
      .then(r => setTopics(r.data))
      .catch(() => showToast('Failed to load topics', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const fetchQuestions = async (id: number) => {
    try { const r = await questionAPI.getByTopic(id); setQuestions(r.data); }
    catch { showToast('Failed to fetch questions', 'error'); }
  };

  const openAdd = () => {
    setEditingQuestion(null); setQuestionText('');
    setOptionA(''); setOptionB(''); setOptionC(''); setOptionD('');
    setCorrectAnswer(''); setTopicId(selectedTopicId); setShowModal(true);
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q); setQuestionText(q.question_text);
    setOptionA(q.options[0] || ''); setOptionB(q.options[1] || '');
    setOptionC(q.options[2] || ''); setOptionD(q.options[3] || '');
    setCorrectAnswer(q.correct_answer); setTopicId(q.topic_id); setShowModal(true);
  };

  const saveQuestion = async () => {
    if (!topicId || !questionText.trim()) { showToast('Topic and question required', 'error'); return; }
    const options = [optionA, optionB, optionC, optionD].filter(Boolean);
    if (options.length < 2) { showToast('At least 2 options required', 'error'); return; }
    if (!correctAnswer || !options.includes(correctAnswer)) { showToast('Correct answer must match an option', 'error'); return; }
    const payload = { question_text: questionText, topic_id: topicId, options, correct_answer: correctAnswer, question_type: 'multiple_choice' };
    try {
      if (editingQuestion) { await questionAPI.update(editingQuestion.id, payload); showToast('Question updated', 'success'); }
      else { await questionAPI.create(payload); showToast('Question created', 'success'); }
      setShowModal(false); fetchQuestions(topicId as number);
    } catch (e: any) { showToast(e.response?.data?.detail || 'Failed', 'error'); }
  };

  if (loading) return <AdminLayout title="Questions"><SkeletonTable cols={3} rows={6} /></AdminLayout>;

  const activeOptions = [optionA, optionB, optionC, optionD].filter(Boolean);

  return (
    <AdminLayout title="Questions">
      <div className="admin-page-header">
        <div><h2>Question Management</h2><p>{questions.length} questions loaded</p></div>
        <button className="btn-primary" disabled={!selectedTopicId} onClick={openAdd}>+ Add Question</button>
      </div>

      <div className="filters-bar" style={{ marginBottom: '1.25rem' }}>
        <select value={selectedTopicId} onChange={e => { const id = Number(e.target.value); setSelectedTopicId(id); fetchQuestions(id); }}>
          <option value="">Select a topic to view questions</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Question</th><th>Correct Answer</th><th>Actions</th></tr></thead>
            <tbody>
              {questions.length === 0 ? (
                <tr><td colSpan={3}><div className="table-empty">
                  <div className="empty-icon"><PenToolIcon size={36} /></div>
                  <p>{selectedTopicId ? 'No questions for this topic' : 'Select a topic to view questions'}</p>
                </div></td></tr>
              ) : questions.map(q => (
                <tr key={q.id}>
                  <td style={{ maxWidth: 480 }}>{q.question_text}</td>
                  <td><span className="badge badge-success">{q.correct_answer}</span></td>
                  <td><div className="row-actions"><button className="btn-ghost btn-sm" onClick={() => openEdit(q)}>Edit</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3>{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Topic</label>
                <select value={topicId} onChange={e => setTopicId(Number(e.target.value))}>
                  <option value="">Select topic</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Question</label>
                <textarea rows={3} placeholder="Enter question text" value={questionText} onChange={e => setQuestionText(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div className="form-group"><label>Option A</label><input placeholder="Option A" value={optionA} onChange={e => setOptionA(e.target.value)} /></div>
                <div className="form-group"><label>Option B</label><input placeholder="Option B" value={optionB} onChange={e => setOptionB(e.target.value)} /></div>
                <div className="form-group"><label>Option C</label><input placeholder="Option C (optional)" value={optionC} onChange={e => setOptionC(e.target.value)} /></div>
                <div className="form-group"><label>Option D</label><input placeholder="Option D (optional)" value={optionD} onChange={e => setOptionD(e.target.value)} /></div>
              </div>
              <div className="form-group"><label>Correct Answer</label>
                <select value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}>
                  <option value="">Select correct answer</option>
                  {activeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveQuestion}>{editingQuestion ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;
