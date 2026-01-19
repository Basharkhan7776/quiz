import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth, getFirebaseConfig } from "../../firebase";
import { BlurReveal } from "../../components/BlurReveal";
import { Button } from "../../components/ui/Button";

interface LocalQuestion {
  text: string;
  imageUrl?: string;
  options: [string, string, string, string];
  correctIndex: number;
  timeLimit: number;
}

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<LocalQuestion[]>([
    { text: "", options: ["", "", "", ""], correctIndex: 0, timeLimit: 30 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState<number | null>(null);

  const config = getFirebaseConfig();
  // @ts-ignore
  const hasCloudinary =
    config?.cloudinaryCloudName && config?.cloudinaryUploadPreset;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correctIndex: 0, timeLimit: 30 },
    ]);
  };

  const updateQuestion = (
    idx: number,
    field: keyof LocalQuestion,
    value: any,
  ) => {
    const newQ = [...questions];
    newQ[idx] = { ...newQ[idx], [field]: value };
    setQuestions(newQ);
  };

  const updateOption = (qIdx: number, oIdx: number, val: string) => {
    const newQ = [...questions];
    newQ[qIdx].options[oIdx] = val;
    setQuestions(newQ);
  };

  const handleImageUpload = async (file: File, qIdx: number) => {
    if (!hasCloudinary) return alert("Cloudinary not configured in Login.");
    setUploadingImg(qIdx);

    const formData = new FormData();
    formData.append("file", file);
    // @ts-ignore
    formData.append("upload_preset", config.cloudinaryUploadPreset);

    try {
      // @ts-ignore
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (data.secure_url) {
        updateQuestion(qIdx, "imageUrl", data.secure_url);
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploadingImg(null);
    }
  };

  const handleSubmit = async () => {
    if (!title || questions.some((q) => !q.text)) return;
    setSubmitting(true);

    try {
      const quizRef = await addDoc(collection(db, "quizzes"), {
        title,
        status: "draft",
        createdBy: auth.currentUser?.uid,
        createdAt: new Date(),
      });

      const qCol = collection(db, "quizzes", quizRef.id, "questions");
      for (const q of questions) {
        await addDoc(qCol, {
          text: q.text,
          imageUrl: q.imageUrl || null,
          options: q.options,
          correctIndex: q.correctIndex,
          timeLimit: q.timeLimit || 30,
        });
      }

      navigate("/admin/dashboard");
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 pb-24 space-y-8">
      <BlurReveal>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Create Protocol</h1>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
          >
            Cancel
          </Button>
        </div>
        {!hasCloudinary && (
          <p className="text-xs text-yellow-600 mt-2">
            Image upload disabled. Configure Cloudinary keys in Login screen to
            enable.
          </p>
        )}
      </BlurReveal>

      <BlurReveal delay={0.1} className="space-y-4">
        <label className="block text-sm font-medium text-zinc-500">
          Quiz Title
        </label>
        <input
          className="w-full p-3 border border-zinc-200 rounded-md bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="e.g., General Knowledge Protocol v1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </BlurReveal>

      <div className="space-y-12">
        {questions.map((q, qIdx) => (
          <BlurReveal
            key={qIdx}
            delay={0.1 + qIdx * 0.05}
            className="p-6 border border-zinc-200 rounded-xl space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded">
                Q{qIdx + 1}
              </span>
              {hasCloudinary && (
                <div className="relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleImageUpload(e.target.files[0], qIdx)
                    }
                    disabled={!!uploadingImg}
                  />
                  <Button size="sm" variant="outline" type="button">
                    {uploadingImg === qIdx
                      ? "Uploading..."
                      : q.imageUrl
                        ? "Change Image"
                        : "Add Image"}
                  </Button>
                </div>
              )}
            </div>

            {q.imageUrl && (
              <img
                src={q.imageUrl}
                alt="Question"
                className="h-32 object-contain rounded-lg border border-zinc-100 bg-zinc-50"
              />
            )}

            <input
              className="w-full text-lg font-medium border-b border-zinc-200 pb-2 focus:outline-none focus:border-black transition-colors"
              placeholder="Question Text..."
              value={q.text}
              onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
            />

            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-zinc-500">
                Time Limit (sec):
              </label>
              <input
                type="number"
                className="w-20 p-2 text-sm border border-zinc-200 rounded bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-black"
                value={q.timeLimit}
                onChange={(e) =>
                  updateQuestion(
                    qIdx,
                    "timeLimit",
                    parseInt(e.target.value) || 30,
                  )
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctIndex === oIdx}
                    onChange={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                    className="accent-black"
                  />
                  <input
                    className="flex-1 p-2 text-sm border border-zinc-100 rounded bg-zinc-50 focus:bg-white focus:border-zinc-300 outline-none"
                    placeholder={`Option ${oIdx + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </BlurReveal>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-zinc-200 p-4 flex justify-center gap-4 z-10">
        <Button variant="outline" onClick={handleAddQuestion}>
          + Add Question
        </Button>
        <Button onClick={handleSubmit} isLoading={submitting}>
          Save Protocol
        </Button>
      </div>
    </div>
  );
};

export default CreateQuiz;
