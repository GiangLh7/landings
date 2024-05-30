import './nav.scss';

export default function Nav() {
  return (
    <div className="group py-3 sticky top-0 flex bg-white/70% items-center justify-center w-full backdrop-blur-lg z-50">
      <div className='flex w-full max-w-5xl'>
        <div className='flex items-center'>
          <a className="logo">Logo</a>
        </div>
        <nav className='mx-auto'>
          <ul className='flex items-center gap-4 nav'>
            <li>Meetings</li>
            <li>Pendant</li>
            <li>Privacy</li>
          </ul>
        </nav>
        <div className='hidden md:flex items-center'>
          <a className='btn-signout'>Get Started</a>
        </div>
      </div>
    </div>
  );
}