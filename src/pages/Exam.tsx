import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI } from '../api/services';
import { useTimer } from '../hooks/useTimer';
import { useFullscreen } from '../hooks/useFullscreen';
import { useTabSwitch } from '../hooks/useTabSwitch';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

interface Question {
  id: number;
  question_text: string;
  options: string[];
}

const Exam: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { formattedTime, isTimeUp } = useTimer(45, handleAutoSubmit);
  useFullscreen(true);
  const { tabSwitchCount, showWarning, warningMessage, closeWarning, shouldAutoSubmit } = useTabSwitch(true, 3);

  useEffect(() => {
    startExam();
  }, []);

  useEffect(() => {
    if (isTimeUp || shouldAutoSubmit) {
      handleAutoSubmit();
    }
  }, [isTimeUp, shouldAutoSubmit]);

  const startExam = async () => {
    try {
      const response = await examAPI.start(parseInt(topicId!));
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to start exam', 'error');
      navigate('/topics');
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  async function handleAutoSubmit() {
    if (submitting) return;
    await submitExam();
  }

  const handleManualSubmit = () => {
    setShowConfirm(true);
  };

  const submitExam = async () => {
    setSubmitting(true);
    setShowConfirm(false);
    try {
      const submissionData = {
        topic_id: parseInt(topicId!),
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          question_id: parseInt(questionId),
          selected_answer: selectedAnswer,
        })),
        tab_switch_count: tabSwitchCount,
      };

      const response = await examAPI.submit(submissionData);
      navigate('/completion', { state: { result: response.data } });
    } catch (error) {
      showToast('Failed to submit exam. Please try again.', 'error');
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="exam-page">
      {submitting && <Loader />}
      
      {showWarning && (
        <div className="warning-modal">
          <div className="warning-content">
            <h3>⚠️ Warning</h3>
            <p>{warningMessage}</p>
            <button onClick={closeWarning} className="btn-primary">
              OK
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          title="Submit Exam"
          message="Are you sure you want to submit the exam? You cannot change your answers after submission."
          onConfirm={submitExam}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      <div className="exam-header">
        <div className="exam-info">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="timer">
          <span>⏱️ Time Left: {formattedTime}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="exam-content">
        <div className="question-card">
          <h2>{currentQuestion.question_text}</h2>
          
          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`option ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
                onClick={() => handleAnswerSelect(option)}
              >
                <input
                  type="radio"
                  name="answer"
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswerSelect(option)}
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary"
          >
            Previous
          </button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleManualSubmit}
              disabled={submitting}
              className="btn-success"
            >
              Submit Exam
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">
              Next
            </button>
          )}
        </div>

        <div className="answered-count">
          Answered: {Object.keys(answers).length} / {questions.length}
        </div>
      </div>
    </div>
  );
};

export default Exam;
