import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'text';
  question: string;
  options?: string[];
  required: boolean;
  correctAnswer?: string | string[];
  score: number;
}

interface TrainingExamPageProps {
  examId: string;
  title: string;
  questions: Question[];
  passingScore: number;
  onComplete: (score: number, passed: boolean) => void;
  onBack: () => void;
}

export default function TrainingExamPage({ examId, title, questions, passingScore, onComplete, onBack }: TrainingExamPageProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSingleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleMultipleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [questionId]: updated };
    });
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId] && value.trim()) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateAnswers = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    questions.forEach((question) => {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0) || (typeof answer === 'string' && !answer.trim())) {
          newErrors[question.id] = '此题为必填项';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const calculateScore = (): number => {
    let totalScore = 0;
    let earnedScore = 0;

    questions.forEach((question) => {
      totalScore += question.score;
      const userAnswer = answers[question.id];

      if (question.type === 'single' && question.correctAnswer) {
        if (userAnswer === question.correctAnswer) {
          earnedScore += question.score;
        }
      } else if (question.type === 'multiple' && question.correctAnswer) {
        const correct = question.correctAnswer as string[];
        const user = userAnswer as string[];
        if (user.length === correct.length && user.every((item) => correct.includes(item))) {
          earnedScore += question.score;
        }
      } else if (question.type === 'text') {
        earnedScore += question.score;
      }
    });

    return Math.round((earnedScore / totalScore) * 100);
  };

  const handleSubmit = () => {
    if (!validateAnswers()) {
      return;
    }

    const finalScore = calculateScore();
    const isPassed = finalScore >= passingScore;
    setScore(finalScore);
    setPassed(isPassed);
    setSubmitted(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPassed(false);
    setErrors({});
  };

  const handleComplete = () => {
    onComplete(score, passed);
  };

  const answeredCount = Object.keys(answers).filter((key) => {
    const answer = answers[key];
    return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim());
  }).length;

  const requiredCount = questions.filter((q) => q.required).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-800 text-sm flex-1 truncate">{title}</h1>
        <div className="text-xs text-gray-500">
          {answeredCount}/{requiredCount} 必答题
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className={`bg-white rounded-2xl shadow-sm border ${
                errors[question.id] ? 'border-red-300' : 'border-gray-100'
              } overflow-hidden`}
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-red-600">{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{question.question}</p>
                    {question.required && (
                      <span className="text-xs text-red-500 mt-1 inline-block">* 必填</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{question.score}分</span>
                </div>
              </div>

              <div className="p-4">
                {question.type === 'single' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleSingleSelect(question.id, option)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          answers[question.id] === option
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              answers[question.id] === option
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {answers[question.id] === option && (
                              <div className="w-2.5 h-2.5 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'multiple' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleMultipleSelect(question.id, option)}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          (answers[question.id] as string[])?.includes(option)
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              (answers[question.id] as string[])?.includes(option)
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {(answers[question.id] as string[])?.includes(option) && (
                              <CheckCircle size={12} className="text-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-700">{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'text' && (
                  <textarea
                    value={(answers[question.id] as string) || ''}
                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                    placeholder="请输入您的答案..."
                    className={`w-full px-4 py-3 rounded-xl border-2 resize-none focus:outline-none transition-all ${
                      errors[question.id]
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-red-500'
                    }`}
                    rows={4}
                  />
                )}

                {errors[question.id] && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
                    <AlertCircle size={14} />
                    <span>{errors[question.id]}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 p-4 sticky bottom-0 z-10">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="space-y-3">
              <div
                className={`rounded-2xl p-4 ${
                  passed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {passed ? (
                    <CheckCircle size={24} className="text-green-600" />
                  ) : (
                    <XCircle size={24} className="text-red-600" />
                  )}
                  <div>
                    <p className={`font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>
                      {passed ? '考试通过！' : '考试未通过'}
                    </p>
                    <p className={`text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
                      得分：{score}分 / 及格线：{passingScore}分
                    </p>
                  </div>
                </div>
                {!passed && (
                  <p className="text-xs text-gray-600">
                    很遗憾，您的得分未达到及格线，请重新学习后再考试。
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                {!passed && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 rounded-xl font-medium text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                  >
                    重新考试
                  </button>
                )}
                <button
                  onClick={handleComplete}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors ${
                    passed
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {passed ? '完成考试' : '返回学习'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < requiredCount}
              className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${
                answeredCount >= requiredCount
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {answeredCount >= requiredCount ? '提交试卷' : `请完成必答题（${requiredCount - answeredCount}题未完成）`}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
