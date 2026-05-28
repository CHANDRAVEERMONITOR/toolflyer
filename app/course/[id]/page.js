"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function CoursePlayer({ params }) {
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // 1. कोर्स की जानकारी लाएं
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', params.id).single();
      setCourse(courseData);

      // 2. उस कोर्स के सभी वीडियो (लेसन्स) लाएं
      const { data: lessonsData } = await supabase.from('course_lessons').select('*').eq('course_id', params.id).order('order_index', { ascending: true });
      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0) setCurrentLesson(lessonsData[0]);

      // 3. छात्र की प्रोग्रेस चेक करें
      const { data: completed } = await supabase.from('user_progress').select('lesson_id').eq('user_id', user.id);
      const completionRate = (completed.length / (lessonsData?.length || 1)) * 100;
      setProgress(completionRate);
    };
    loadData();
  }, [params.id]);

  const markAsComplete = async (lessonId) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('user_progress').upsert({ user_id: user.id, lesson_id: lessonId, is_completed: true });
    window.location.reload(); // प्रोग्रेस अपडेट करने के लिए
  };

  if (!course) return <div className="flex justify-center items-center min-h-screen">Loading Course...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="mb-4 text-blue-600 font-medium">← Back to Dashboard</button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* वीडियो प्लेयर सेक्शन */}
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
              <iframe 
                width="100%" height="100%" 
                src={currentLesson?.video_url} 
                title="Course Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen 
              />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-2xl font-bold">{currentLesson?.title}</h2>
              <button onClick={() => markAsComplete(currentLesson.id)} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">
                Mark as Completed ✅
              </button>
            </div>
          </div>

          {/* प्लेलिस्ट सेक्शन */}
          <div className="bg-white rounded-xl shadow-md p-4 overflow-y-auto max-h-[600px]">
            <h3 className="font-bold text-xl mb-4">Course Content</h3>
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  onClick={() => setCurrentLesson(lesson)} 
                  className={`p-3 cursor-pointer rounded-lg transition ${currentLesson?.id === lesson.id ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}
                >
                  <p className="text-sm font-medium">{lesson.order_index}. {lesson.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-bold mb-2">Course Progress: {progress.toFixed(0)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              {progress >= 80 ? (
                <button className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg font-bold">Unlock Certificate 🎓</button>
              ) : (
                <p className="text-xs text-red-500 mt-2">Watch 80% of videos to unlock.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
