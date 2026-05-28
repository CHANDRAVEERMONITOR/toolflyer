"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      // 1. चेक करें कि यूजर लॉगिन है या नहीं
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. प्रोफाइल डेटा लाएं (नाम, कॉलेज, यूनिवर्सिटी, रेफरल कोड)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // 3. डेटाबेस से सभी उपलब्ध कोर्सेज लाएं
      const { data: coursesData, error: courseError } = await supabase
        .from('courses')
        .select('*');
      
      if (coursesData) setCourses(coursesData);

      // 4. चेक करें कि छात्र ने कौन-कौन से कोर्सेज में एनरोल किया है
      const { data: enrollmentData, error: enrollError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id);
      
      if (enrollmentData) {
        setMyEnrollments(enrollmentData.map(e => e.course_id));
      }
    };

    fetchData();
  }, [router]);

  // कोर्स में एनरोल करने का फंक्शन
  const handleEnroll = async (courseId) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('enrollments')
      .insert([
        { user_id: user.id, course_id: courseId, status: 'started' }
      ]);

    if (error) {
      alert("Enrollment failed: " + error.message);
    } else {
      alert("Successfully Enrolled in the course!");
      // पेज को रिफ्रेश करें ताकि "Enroll Now" बटन "Continue Learning" में बदल जाए
      window.location.reload();
    }
  };

  if (!profile) return <div className="flex justify-center items-center min-h-screen font-bold text-xl">Loading your dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {profile.full_name}! 👋</h1>
            <p className="text-gray-500 font-medium">Student ID: {profile.roll_no || "Not assigned"}</p>
          </div>
          <button 
            onClick={async () => { 
              await supabase.auth.signOut(); 
              router.push('/login'); 
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition shadow-md"
          >
            Logout
          </button>
        </header>

        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-blue-500">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">College</h3>
            <p className="text-xl font-bold text-gray-800">{profile.college_name || "Not Added"}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-green-500">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">University</h3>
            <p className="text-xl font-bold text-gray-800">{profile.university_name || "Not Added"}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-8 border-purple-500">
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider">Your Referral Code</h3>
            <p className="text-xl font-black text-purple-600">{profile.referral_code || "Generating..."}</p>
          </div>
        </div>

        {/* Courses Section */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          📚 Available Courses
        </h2>
        
        {courses.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">No courses available at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div key={course.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3">{course.description}</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-black text-blue-600">₹{course.price}</span>
                  {myEnrollments.includes(course.id) ? (
                    <button 
                      onClick={() => router.push(`/course/${course.id}`)}
                      className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
                    >
                      Continue Learning
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEnroll(course.id)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg"
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
