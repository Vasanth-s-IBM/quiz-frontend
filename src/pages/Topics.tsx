import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import { SkeletonGrid } from '../components/Loader';
import {
  BookIcon, ClockIcon, ArrowRightIcon, ZapIcon,
  PenToolIcon, GridIcon, StarIcon, AwardIcon, ShieldIcon, InfoIcon
} from '../components/Icons';

interface Topic { id: number; name: string; question_count: number; }

const TOPIC_ICONS = [BookIcon, ZapIcon, PenToolIcon, GridIcon, StarIcon, AwardIcon, ShieldIcon, InfoIcon];

const Topics: React.FC = () => {
  const [topics, setTopics]   = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    topicAPI.getAll()
      .then(r => setTopics(r.data))
      .catch(() => showToast('Failed to fetch topics', 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <Header />
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>Available Topics</h1>
            <p className="text-muted text-sm mt-1">Choose a topic to start your exam</p>
          </div>
        </div>

        {loading ? (
          <SkeletonGrid count={6} />
        ) : topics.length === 0 ? (
          <div className="table-empty">
            <div className="empty-icon"><BookIcon size={40} /></div>
            <p>No topics available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="topics-grid">
            {topics.map((topic, i) => {
              const IconComp = TOPIC_ICONS[i % TOPIC_ICONS.length];
              return (
                <div key={topic.id} className="topic-card" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="topic-card-icon"><IconComp size={24} /></div>
                  <h3>{topic.name}</h3>
                  <div className="topic-meta">
                    <span className="topic-meta-item"><BookIcon size={12} /> {topic.question_count} questions</span>
                    <span className="topic-meta-item"><ClockIcon size={12} /> 45 min</span>
                  </div>
                  <div className="topic-card-footer">
                    <button
                      className="btn-primary btn-full"
                      onClick={() => navigate(`/instructions/${topic.id}`)}
                      aria-label={`Start exam for ${topic.name}`}
                    >
                      Start Exam <ArrowRightIcon size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Topics;
