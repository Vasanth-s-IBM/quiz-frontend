import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Loader from '../components/Loader';

interface Topic {
  id: number;
  name: string;
  question_count: number;
}

const Topics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await topicAPI.getAll();
      setTopics(response.data);
    } catch (error) {
      showToast('Failed to fetch topics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topicId: number) => {
    navigate(`/instructions/${topicId}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="topics-page">
      <Header />

      <div className="topics-container">
        <h1>Select a Topic</h1>
        <div className="topics-grid">
          {topics.map((topic) => (
            <div key={topic.id} className="topic-card">
              <h3>{topic.name}</h3>
              <div className="topic-info">
                <span>Questions: {topic.question_count}</span>
                <span>Duration: 45 min</span>
              </div>
              <button className="btn-success" onClick={() => handleTopicClick(topic.id)}>
                Start Exam
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
