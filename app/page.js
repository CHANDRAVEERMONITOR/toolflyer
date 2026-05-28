import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
      <h1>Bihar Graduation Internship Portal</h1>
      <p>Welcome to ToolFlyer Internship Services</p>
      <div style={{ marginTop: '25px' }}>
        <Link href="/login">
          <button style={{ marginRight: '15px', padding: '10px 20px', cursor: 'pointer' }}>Student Login</button>
        </Link>
        <Link href="/signup">
          <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Register / Sign Up</button>
        </Link>
      </div>
    </div>
  );
}