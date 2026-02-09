import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { topicAPI } from '../api/services';
import Loader from '../components/Loader';

const Instructions: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopic();
  }, []);

  const fetchTopic = async () => {
    try {
      const response = await topicAPI.getAll();
      const foundTopic = response.data.find((t: any) => t.id === parseInt(topicId!));
      setTopic(foundTopic);
    } catch (error) {
      console.error('Error fetching topic:', error);
    }
  };

  const handleStartExam = () => {
    navigate(`/exam/${topicId}`);
  };

  const handleBack = () => {
    navigate('/topics');
  };

  if (!topic) return <Loader />;

  return (
    <div className="instructions-page">
      <div className="instructions-card">
        <h1>Exam Instructions</h1>
        <h2>{topic.name}</h2>
        
        <div className="instructions-content">
          <div className="info-box">
            <h3>Exam Details</h3>
            <ul>
              <li>Number of Questions: <strong>{topic.question_count}</strong></li>
              <li>Each Question: <strong>1 mark</strong></li>
              <li>Total Time: <strong>45 minutes</strong></li>
              <li>Passing Score: <strong>60%</strong></li>
            </ul>
          </div>

          <div className="rules-box">
            <h3>Important Rules</h3>
            <ul>
              <li>✓ Exam will start in fullscreen mode</li>
              <li>✓ Timer starts immediately when you begin</li>
              <li>✓ One question will be displayed at a time</li>
              <li>✓ You can navigate between questions</li>
              <li>✓ Exam auto-submits when time ends</li>
            </ul>
          </div>

          <div className="warning-box">
            <h3>⚠️ Malpractice Detection</h3>
            <ul>
              <li>Tab switches are tracked</li>
              <li>1st switch → Warning popup</li>
              <li>2nd switch → Final warning</li>
              <li>3rd switch → Auto-submit + Malpractice flag</li>
            </ul>
          </div>

          <div className="completion-box">
            <h3>After Completion</h3>
            <p>Your score will be calculated immediately. A certificate will be emailed to you shortly after admin approval.</p>
          </div>
        </div>

        <div className="button-group">
          <button onClick={handleBack} className="btn-secondary">
            Back to Topics
          </button>
          <button onClick={handleStartExam} className="btn-success">
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
