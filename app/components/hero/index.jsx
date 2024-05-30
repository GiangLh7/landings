import Image from 'next/image';
import './hero.scss';

export default function Hero() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center justify-center font-bold mt-4 sm:mt-24 xs:mt-16">
        <div className="">
          <button className="">
            <div className="btn-video-bg px-4 py-2 rounded-full">
              <span>See the launch video</span>
            </div>
          </button>
        </div>
        <div className="mt-3 flex flex-col content-center items-center gap-3 max-w-lg">
          <h1 className="hero-bg-grd xl:text-6xl font-extrabold text-center tracking-tight bg-clip-text text-transparent">Go beyond your mind’s limitations</h1>
          <div>
            <h2 className="xl:text-3xl text-[10.5vw]/[115%] font-semibold text-[#b2b2bd] text-center">Personalized AI powered by what you’ve seen, said, and heard.</h2>
          </div>
          <div>
            <button className="mt-2 sm:mt-4 border-none shadow-none px-4 py-2 rounded-xl bg-black active:bg-gray-900 text-white">
              <span className="text-lg font-normal">Get started for free</span>
            </button>
          </div>
        </div>
      </div>

      <div className='w-full relative pt-0' style={{ background: 'radial-gradient(70% 70% at 50% 100%, rgb(226 226 255) 50%, #e6e5f6 65%, rgb(255, 255, 255) 100%)' }}>
        <div className='relative flex items-center justify-center mx-auto overflow-hidden lg:max-w-5xl max-w-xl pt-20 md:pt-28 flex-col-reverse'>
          <div className='flex self-center max-w-[calc(100%-3rem)] sm:max-w-md md:max-w-lg lg:max-w-xl translate-x-[-14%]'>
            <div className='rounded-t-xl border-gray-300 overflow-hidden border-spacing-1'>
              <Image className='max-w-full' src={'/hero-meeting.webp'} width={1214} height={1064}></Image>
            </div>
          </div>
          <div className='relative w-full h-full max-w-5xl gap-0 flex flex-col-reverse items-end justify-center lg:justify-end'>
            <div className='origin-bottom absolute z-0 translate-y-[25%]'>
              <Image className='w-[200px] h-[200px] lg:w-[400px] lg:h-[400px]' src={'/product.png'} width={670} height={670}></Image>
            </div>
          </div>
          <div className='hidden lg:flex gap-3 max-w-[18rem] absolute right-[-0.5rem] top-[25%] items-start flex-col'>
            <span className='font-bold'>The world’s most wearable AI.</span>
            <span className='text-[#9aa5b3]'>Preserve conversations and ask your personalized AI anything</span>
          </div>
        </div>
      </div>
    </div>
  );
}