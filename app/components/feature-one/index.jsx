'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useScroll } from 'framer-motion';
import './style.scss';

export default function FeatureOne() {
  const element = useRef(null);
  const { scrollYProgress } = useScroll({
    target: element.current,
    offset: ['center center', 'end start']
  });

  useEffect(() => {
    scrollYProgress.on('change', (e) => {
      console.log(e);
    });
  }, []);

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center">
        <div className="max-w-xl py-6 mb-32 translate-x-[-46%]">
          <p className="font-normal text-lg max-w-sm">
            <span className="">Make meetings a joy.</span>
            <span className="text-[#9aa5b3]">&nbsp; Stay on top of it all with meeting prep, automated notes, and summaries you can trust.</span>
          </p>
        </div>
      </div>

      <div className="w-full flex flex-col items-center relative min-h-[200lvh]" ref={element}>
        <div className="mt-[10vh] sticky top-[45%] mb-[60%] max-w-3xl">
          <div className="feat-text text-4xl font-semibold text-center tracking-tight leading-snug inline" style={{color: 'rgba(71, 85, 105, .3)'}}>
            <span>A &nbsp;</span>
            <span className='relative'>
              <span>web app,&nbsp;</span>
              <span className='feat feat-1 absolute left-0 top-0 w-[64px] h-[64px]'>
                <Image fill src={'/limitless-app-icon.webp'}></Image>
              </span>
            </span>
            <span className='relative'>
              <span>Mac app,&nbsp;</span>
              <span className='feat feat-2 absolute left-0 top-0 w-[64px] h-[64px]'>
                <Image fill src={'/mac-finder.webp'}></Image>
              </span>
            </span>
            <span className='relative'>
              <span>Windows app,&nbsp;</span>
              <span className='feat feat-3 absolute left-0 top-0 w-[64px] h-[64px]'>
                <Image fill src={'/windows-icon.webp'}></Image>
              </span>
            </span>
            <span>and a &nbsp;</span>
            <span>wearable</span>
            <span>to power your personalized AI.</span>
          </div>
        </div>
      </div>
    </>
  );
}