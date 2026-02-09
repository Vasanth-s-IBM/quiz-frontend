import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { questionAPI, topicAPI } from "../api/services";
import { useToast } from "../context/ToastContext";
import Header from "../components/Header";
import Loader from "../components/Loader";

interface Topic {
  id: number;
  name: string;
}

interface Question {
  id: number;
  question_text: string;
  topic_id: number;
  options: string[];
  correct_answer: string;
}

const AdminQuestions: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | "">("");
  const [topicId, setTopicId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await topicAPI.getAll();
        setTopics(res.data);
      } catch {
        showToast("Failed to load topics", "error");
      } finally {
        setLoading(false);
      }
    };
    loadTopics();
  }, []);

  const fetchQuestions = async (id: number) => {
    try {
      const res = await questionAPI.getByTopic(id);
      setQuestions(res.data);
    } catch {
      showToast("Failed to fetch questions", "error");
    }
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("");
    setTopicId(selectedTopicId);
    setShowModal(true);
  };

  const openEditModal = (q: Question) => {
    // TODO: Implement edit question functionality
    setEditingQuestion(q);
    setQuestionText(q.question_text);
    setOptionA(q.options[0] || "");
    setOptionB(q.options[1] || "");
    setOptionC(q.options[2] || "");
    setOptionD(q.options[3] || "");
    setCorrectAnswer(q.correct_answer);
    setTopicId(q.topic_id);
    setShowModal(true);
  };

  const saveQuestion = async () => {
    if (!topicId || !questionText.trim()) {
      showToast("Topic and question text are required", "error");
      return;
    }

    const options = [optionA, optionB, optionC, optionD].filter(Boolean);

    if (options.length < 2) {
      showToast("At least two options are required", "error");
      return;
    }

    if (!correctAnswer || !options.includes(correctAnswer)) {
      showToast("Correct answer must be one of the options", "error");
      return;
    }

    const payload = {
      question_text: questionText,
      topic_id: topicId,
      options,
      correct_answer: correctAnswer,
      question_type: "multiple_choice",
    };

    try {
      if (editingQuestion) {
        await questionAPI.update(editingQuestion.id, payload);
        showToast("Question updated successfully", "success");
      } else {
        await questionAPI.create(payload);
        showToast("Question created successfully", "success");
      }
      setShowModal(false);
      fetchQuestions(topicId as number);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to save question", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      <Header isAdmin />

      <div className="admin-container">
        <div className="admin-toolbar">
          <h1>Question Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => navigate("/admin/dashboard")}>
              Back
            </button>
            <button className="btn-primary" onClick={openAddModal} disabled={!selectedTopicId}>
              + Add Question
            </button>
          </div>
        </div>

        <div className="filters-bar">
          <select
            value={selectedTopicId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedTopicId(id);
              fetchQuestions(id);
            }}
          >
            <option value="">Select Topic</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Correct Answer</th>
                <th style={{ width: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: 20 }}>
                    No questions found
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id}>
                    <td>{q.question_text}</td>
                    <td>{q.correct_answer}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn-ghost"
                          onClick={() => openEditModal(q)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{editingQuestion ? "Edit Question" : "Add Question"}</h3>

            <select
              value={topicId}
              onChange={(e) => setTopicId(Number(e.target.value))}
            >
              <option value="">Select Topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <textarea
              rows={3}
              placeholder="Enter question text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              style={{ width: "100%", marginBottom: 12 }}
            />

            <input
              placeholder="Option A"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
            />
            <input
              placeholder="Option B"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
            />
            <input
              placeholder="Option C (optional)"
              value={optionC}
              onChange={(e) => setOptionC(e.target.value)}
            />
            <input
              placeholder="Option D (optional)"
              value={optionD}
              onChange={(e) => setOptionD(e.target.value)}
            />

            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            >
              <option value="">Select Correct Answer</option>
              {[optionA, optionB, optionC, optionD]
                .filter(Boolean)
                .map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
            </select>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveQuestion}>
                {editingQuestion ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
