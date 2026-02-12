
import React from 'react';
import { Calendar, ExternalLink, Download, FileText } from 'lucide-react';

const PressPage: React.FC = () => {
  const news = [
    { date: "15 Dec 2024", title: "SwiftPolicy Reaches 500,000 Customers Milestone" },
    { date: "03 Nov 2024", title: "New Mobile App with Enhanced Claims Experience" },
    { date: "18 Sep 2024", title: "Named 'Best Car Insurance Provider' at Choice Awards" }
  ];

  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <section className="bg-[#2d1f2d] py-24 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-outfit">Press & <span className="text-[#e91e8c]">Media</span></h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            Latest news, press releases, and resources for media partners.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#2d1f2d] mb-8 font-outfit">Latest News</h2>
          <div className="space-y-6">
            {news.map((item, i) => (
              <article key={i} className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-sm text-[#e91e8c] font-bold mb-2">
                  <Calendar size={14} />
                  {item.date}
                </div>
                <h3 className="text-xl font-bold text-[#2d1f2d] mb-4">{item.title}</h3>
                <a href="#" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#e91e8c]">
                  Read More <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#2d1f2d] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 font-outfit text-center">Media Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { title: "Brand Guidelines", icon: <FileText /> },
              { title: "Press Kit", icon: <Download /> },
              { title: "Executive Photos", icon: <Download /> }
            ].map((r, i) => (
              <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-white/10">
                <div className="flex items-center gap-4">
                   <div className="text-[#e91e8c]">{r.icon}</div>
                   <span className="font-bold">{r.title}</span>
                </div>
                <Download className="text-white/20 group-hover:text-white" size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PressPage;
