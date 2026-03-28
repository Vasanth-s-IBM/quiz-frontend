import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { topicAPI } from '../api/services';
import Loader from '../components/Loader';
import Header from '../components/Header';
import {
  BookIcon, AwardIcon, ClockIcon, CheckIcon,
  AlertTriangleIcon, ArrowLeftIcon, ArrowRightIcon, InfoIcon, ShieldIcon
} from '../components/Icons';

const Instructions: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    topicAPI.getAll()
      .then(r => {
        const found = r.data.find((t: any) => t.id === parseInt(topicId!));
        if (!found) navigate('/topics'); else setTopic(found);
      })
      .catch(() => navigate('/topics'));
  }, []);

  if (!topic) return <Loader text="Loading exam details…" />;

  return (
    <div className="instructions-page">
      <Header />
      <div className="instructions-body">
        <div className="instructions-header">
          <h1>Exam Instructions</h1>
          <p>{topic.name}</p>
        </div>

        <div className="instructions-grid">
          <div className="info-box">
            <h3><span className="icon-wrap"><InfoIcon size={14} /></span>Exam Details</h3>
            <ul>
              <li><BookIcon size={14} className="list-icon" /><span>Questions: <strong>{topic.question_count}</strong></span></li>
              <li><AwardIcon size={14} className="list-icon" /><span>Each question: <strong>1 mark</strong></span></li>
              <li><ClockIcon size={14} className="list-icon" /><span>Total time: <strong>45 minutes</strong></span></li>
              <li><CheckIcon size={14} className="list-icon" /><span>Passing score: <strong>60%</strong></span></li>
            </ul>
          </div>

          <div className="rules-box">
            <h3><span className="icon-wrap"><ShieldIcon size={14} /></span>Important Rules</h3>
            <ul>
              <li><CheckIcon size={14} className="list-icon" /><span>Exam starts in fullscreen mode</span></li>
              <li><CheckIcon size={14} className="list-icon" /><span>Timer begins immediately on start</span></li>
              <li><CheckIcon size={14} className="list-icon" /><span>One question displayed at a time</span></li>
              <li><CheckIcon size={14} className="list-icon" /><span>Navigate between questions freely</span></li>
              <li><CheckIcon size={14} className="list-icon" /><span>Exam auto-submits when time ends</span></li>
            </ul>
          </div>

          <div className="warning-box">
            <h3><span className="icon-wrap"><AlertTriangleIcon size={14} /></span>Malpractice Detection</h3>
            <ul>
              <li><AlertTriangleIcon size={14} className="list-icon" /><span>Tab switches are tracked</span></li>
              <li><AlertTriangleIcon size={14} className="list-icon" /><span>1st switch — Warning popup</span></li>
              <li><AlertTriangleIcon size={14} className="list-icon" /><span>2nd switch — Final warning</span></li>
              <li><AlertTriangleIcon size={14} className="list-icon" /><span>3rd switch — Auto-submit + Malpractice flag</span></li>
            </ul>
          </div>

          <div className="completion-box">
            <h3><span className="icon-wrap" style={{ color: 'var(--success)' }}><AwardIcon size={14} /></span>After Completion</h3>
            <p>Your score is calculated immediately. A certificate will be issued after admin approval.</p>
          </div>
        </div>

        <div className="button-group">
          <button className="btn-secondary btn-lg" onClick={() => navigate('/topics')}>
            <ArrowLeftIcon size={16} /> Back
          </button>
          <button className="btn-success btn-lg" onClick={() => navigate(`/exam/${topicId}`)}>
            Start Exam <ArrowRightIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
