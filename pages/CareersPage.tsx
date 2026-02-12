
import React from 'react';
import { Briefcase, MapPin, Clock, Users, Heart, Coffee, GraduationCap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CareersPage: React.FC = () => {
  const jobs = [
    { title: "Senior Software Engineer", dept: "Engineering", loc: "London (Hybrid)" },
    { title: "Product Designer", dept: "Design", loc: "London (Hybrid)" },
    { title: "Claims Handler", dept: "Operations", loc: "Manchester" },
    { title: "Data Analyst", dept: "Data", loc: "London (Hybrid)" }
  ];

  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <section className="bg-gradient-to-br from-[#2d1f2d] to-[#1a1a2e] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e91e8c]/20 px-4 py-2 text-sm text-[#e91e8c] mb-6">
            <Briefcase size={16} />
            We're hiring!
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">Build the Future of <span className="text-[#e91e8c]">Insurance</span></h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            Join a team of passionate people who are transforming how millions of people protect what matters most.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#2d1f2d] mb-12 font-outfit text-center">Perks & Benefits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Heart />, title: "Health Insurance", desc: "Private medical, dental, and vision coverage." },
              { icon: <Coffee />, title: "Flexible Working", desc: "Hybrid model with 2-3 days in office." },
              { icon: <GraduationCap />, title: "Learning Budget", desc: "£1,500 per year for your development." },
              { icon: <Users />, title: "Team Events", desc: "Regular socials and team building activities." }
            ].map((b, i) => (
              <div key={i} className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
                {/* Fix: Added <any> to React.ReactElement to allow passing size prop */}
                <div className="text-[#e91e8c] mb-4">{React.cloneElement(b.icon as React.ReactElement<any>, { size: 28 })}</div>
                <h3 className="text-lg font-bold text-[#2d1f2d] mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#2d1f2d] mb-8 font-outfit">Current Openings</h2>
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="group p-6 bg-[#faf8fa] rounded-2xl border border-gray-100 hover:border-[#e91e8c] transition-all cursor-pointer flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#2d1f2d] group-hover:text-[#e91e8c] transition-colors">{job.title}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Users size={14} /> {job.dept}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {job.loc}</span>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#e91e8c] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
