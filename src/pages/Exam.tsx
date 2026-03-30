import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { examAPI, proctorAPI } from '../api/services';
import { useTimer } from '../hooks/useTimer';
import { useFullscreen } from '../hooks/useFullscreen';
import { useTabSwitch } from '../hooks/useTabSwitch';
import { useFaceProctor } from '../hooks/useFaceProctor';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';
import { AlertTriangleIcon, XIcon, CheckIcon } from '../components/Icons';

interface Question { id: number; question_text: string; options: string[]; }

const MAX_FACE_VIOLATIONS = 5;

const Exam: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [questions, setQuestions]               = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers]                   = useState<{ [key: number]: string }>({});
  const [loading, setLoading]                   = useState(true);
  const [submitting, setSubmitting]             = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [checkInterval, setCheckInterval]       = useState(30000);
  const [maxViolations, setMaxViolations]       = useState(MAX_FACE_VIOLATIONS);

  const submittingRef = useRef(false);
  const webcamRef     = useRef<HTMLVideoElement>(null);
  const examActiveRef = useRef(true);

  const { formattedTime, isTimeUp } = useTimer(45, handleAutoSubmit);
  useFullscreen(true);
  const { tabSwitchCount, showWarning: showTabWarning, warningMessage: tabWarningMsg, closeWarning, shouldAutoSubmit } = useTabSwitch(true, 3);
  const { faceStatus, warningMessage: faceWarningMsg, showFaceModal, setShowFaceModal, violationCount, cameraError } = useFaceProctor({
    enabled: proctoringEnabled && !submitting,
    videoRef: webcamRef,
    intervalMs: checkInterval,
    maxViolations: maxViolations,
    onAutoSubmit: handleAutoSubmit,
  });

  // Block browser back button — show leave confirm instead
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setShowLeaveConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Block browser close/refresh — show native dialog
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!examActiveRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => { startExam(); }, []);
  useEffect(() => { if (isTimeUp || shouldAutoSubmit) handleAutoSubmit(); }, [isTimeUp, shouldAutoSubmit]);

  const startExam = async () => {
    try {
      const [examRes, configRes] = await Promise.all([
        examAPI.start(parseInt(topicId!)),
        proctorAPI.getConfig(),
      ]);
      setQuestions(examRes.data.questions);
      const cfg = configRes.data;
      setProctoringEnabled(cfg.enabled);
      setCheckInterval(cfg.check_interval_seconds * 1000);
      setMaxViolations(cfg.max_violations);
      setLoading(false);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to start exam', 'error');
      navigate('/topics');
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({ ...answers, [questions[currentQuestionIndex].id]: answer });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  async function handleAutoSubmit() {
    if (submittingRef.current) return;
    await submitExam();
  }

  const submitExam = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    examActiveRef.current = false;
    setSubmitting(true); setShowConfirm(false);
    try {
      const response = await examAPI.submit({
        topic_id: parseInt(topicId!),
        answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({
          question_id: parseInt(questionId), selected_answer: selectedAnswer,
        })),
        tab_switch_count: tabSwitchCount,
        face_violation_count: violationCount,
      });
      navigate('/completion', { state: { result: response.data } });
    } catch {
      showToast('Failed to submit exam. Please try again.', 'error');
      submittingRef.current = false;
      examActiveRef.current = true;
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="exam-page">
      {submitting && <Loader />}

      {/* Tab switch warning */}
      {showTabWarning && (
        <div className="warning-modal">
          <div className="warning-content">
            <h3>⚠️ Warning</h3>
            <p>{tabWarningMsg}</p>
            <button onClick={closeWarning} className="btn-primary">OK</button>
          </div>
        </div>
      )}

      {/* Submit confirm */}
      {showConfirm && (
        <ConfirmModal
          title="Submit Exam"
          message="Are you sure you want to submit? You cannot change your answers after submission."
          onConfirm={submitExam}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* Leave site confirm */}
      {showLeaveConfirm && (
        <div className="warning-modal">
          <div className="warning-content">
            <div style={{ color: 'var(--warning)', marginBottom: '.75rem', display: 'flex', justifyContent: 'center' }}>
              <AlertTriangleIcon size={36} />
            </div>
            <h3 style={{ color: 'var(--warning-dark)' }}>Leave Exam?</h3>
            <p>If you leave now your exam progress will be lost and malpractice will be flagged.</p>
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
              <button
                className="btn-danger"
                onClick={() => {
                  examActiveRef.current = false;
                  submitExam();
                }}
              >
                <XIcon size={15} /> Yes, Leave
              </button>
              <button className="btn-primary" onClick={() => setShowLeaveConfirm(false)}>
                <CheckIcon size={15} /> No, Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Face violation modal */}
      {showFaceModal && (
        <div className="warning-modal">
          <div className="warning-content">
            <h3>{faceStatus === 'no_face' ? '⚠️ No Face Detected' : '🚫 Multiple Faces Detected'}</h3>
            <p>{faceWarningMsg}</p>
            {violationCount >= MAX_FACE_VIOLATIONS - 1 && (
              <p style={{ color: '#f44336', fontWeight: 600 }}>⚠️ Next violation will auto-submit your exam!</p>
            )}
            <p style={{ fontSize: 13, color: '#888' }}>Violation {violationCount} of {MAX_FACE_VIOLATIONS}</p>
            <button onClick={() => setShowFaceModal(false)} className="btn-primary">OK, I Understand</button>
          </div>
        </div>
      )}

      {/* Face inline alert */}
      {faceWarningMsg && !cameraError && !showFaceModal && (
        <div className="face-alert-banner">
          ⚠️ {faceWarningMsg}
          {violationCount >= MAX_FACE_VIOLATIONS - 1 && (
            <strong> — Exam will be auto-submitted on next violation.</strong>
          )}
        </div>
      )}

      {/* Header */}
      <div className="exam-header">
        <div className="exam-info">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="timer">
          <span>⏱️ Time Left: {formattedTime}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
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
                <input type="radio" name="answer"
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleAnswerSelect(option)} />
                <label>{option}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className="btn-secondary">
            Previous
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
            <button onClick={() => setShowConfirm(true)} disabled={submitting} className="btn-success">
              Submit Exam
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary">Next</button>
          )}
        </div>

        <div className="answered-count">
          Answered: {Object.keys(answers).length} / {questions.length}
        </div>
      </div>

      {/* PiP webcam with violation count */}
      {proctoringEnabled && (
        <div className="cam-widget">
          <video ref={webcamRef} autoPlay muted playsInline className="cam-feed" />
          {violationCount > 0 && (
            <div className="cam-violation-badge">
              ⚠️ {violationCount}/{maxViolations} warnings
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Exam;
