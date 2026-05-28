"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase'; 
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [regNo, setRegNo] = useState('');
  const [mobNo, setMobNo] = useState('');
  const [dob, setDob] = useState('');
  const [college, setCollege] = useState('');
  const [university, setUniversity] = useState('');
  const [referredBy, setReferredBy] = useState(''); // जिसने रेफर किया
  const router = useRouter();

  // रेफरल कोड बनाने का फंक्शन
  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      if (data.user) {
        const myReferralCode = generateReferralCode(); // छात्र का अपना कोड

        const { error: profileError } = await supabase.from('profiles').insert([
          { 
            id: data.user.id, 
            full_name: fullName, 
            email: email, 
            father_name: fatherName, 
            roll_no: rollNo, 
            reg_no: regNo, 
            mob_no: mobNo, 
            dob: dob, 
            college_name: college, 
            university_name: university,
            referral_code: myReferralCode, // अपना यूनिक कोड
            referred_by: referredBy, // जिसने रेफर किया उसका कोड
            role: 'student' 
          }
        ]);
        if (profileError) throw profileError;
        alert("Registration Successful!");
        router.push('/login');
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Student Registration</h2>
        
        <input type="text" placeholder="Full Name" className="w-full p-2 border rounded" onChange={(e) => setFullName(e.target.value)} required />
        <input type="text" placeholder="Father's Name" className="w-full p-2 border rounded" onChange={(e) => setFatherName(e.target.value)} required />
        
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Roll No" className="w-full p-2 border rounded" onChange={(e) => setRollNo(e.target.value)} required />
          <input type="text" placeholder="Reg No" className="w-full p-2 border rounded" onChange={(e) => setRegNo(e.target.value)} required />
        </div>

        <input type="text" placeholder="College Name" className="w-full p-2 border rounded" onChange={(e) => setCollege(e.target.value)} required />
        <input type="text" placeholder="University Name" className="w-full p-2 border rounded" onChange={(e) => setUniversity(e.target.value)} required />
        
        <input type="text" placeholder="Mobile Number" className="w-full p-2 border rounded" onChange={(e) => setMobNo(e.target.value)} required />
        <input type="date" className="w-full p-2 border rounded" onChange={(e) => setDob(e.target.value)} required />
        
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Referral Code (Optional)</label>
          <input type="text" placeholder="Enter Referral Code" className="w-full p-2 border rounded" onChange={(e) => setReferredBy(e.target.value)} />
        </div>

        <input type="email" placeholder="Email Address" className="w-full p-2 border rounded" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-2 border rounded" onChange={(e) => setPassword(e.target.value)} required />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
          Register Now
        </button>
      </form>
    </div>
  );
}
