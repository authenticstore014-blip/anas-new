
import React from 'react';
import { Shield, Heart, Zap, Target, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <section className="bg-[#2d1f2d] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">About <span className="text-[#e91e8c]">SwiftPolicy</span></h1>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            We're on a mission to make insurance simple, affordable, and actually enjoyable. Founded in 2008, we've grown to protect over 500,000 UK residents.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#2d1f2d] mb-6 font-outfit">Our Story</h2>
            <div className="space-y-4 text-gray-500 leading-relaxed">
              <p>SwiftPolicy was born out of frustration. Our founders had experienced firsthand how complicated, slow, and expensive traditional insurance could be.</p>
              <p>In 2008, they set out to build an insurance company that put customers first. One that used technology to cut out the paperwork and speed up quotes.</p>
              <p>Today, we're proud to maintain a 4.6-star Trustpilot rating and continue innovating for the digital age.</p>
            </div>
          </div>
          <div className="relative">
             <div className="aspect-video rounded-[40px] bg-gray-200 overflow-hidden shadow-2xl">
               <img src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1000" alt="Team" className="w-full h-full object-cover" />
             </div>
             <div className="absolute -bottom-6 -right-6 bg-[#e91e8c] p-8 rounded-3xl text-white shadow-xl">
                <div className="text-4xl font-bold mb-1">15+</div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-80">Years Experience</div>
             </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#2d1f2d] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4">Our Values</h2>
            <p className="text-white/40">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Heart />, title: "Customer First", desc: "Every decision we make starts with asking: 'How does this benefit our customers?'" },
              { icon: <Zap />, title: "Speed & Simplicity", desc: "We've stripped away the jargon and made getting covered quick and easy." },
              { icon: <Shield />, title: "Reliable Protection", desc: "When you need us most, we're there. Our claims team works around the clock." },
              { icon: <Target />, title: "Fair Pricing", desc: "We believe in transparent, competitive pricing. No hidden fees or nasty surprises." }
            ].map((v, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10">
                {/* Fix: Added <any> to React.ReactElement to allow passing size prop */}
                <div className="text-[#e91e8c] mb-6">{React.cloneElement(v.icon as React.ReactElement<any>, { size: 32 })}</div>
                <h3 className="text-xl font-bold mb-3 font-outfit">{v.title}</h3>
                <p className="text-white/40 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
