
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8fa]">
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-[#e91e8c] font-bold mb-8 transition-all hover:gap-3">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="bg-white rounded-[40px] p-8 md:p-16 border border-gray-100 shadow-2xl shadow-pink-900/5">
          <h1 className="text-4xl font-bold text-[#2d1f2d] mb-4 font-outfit">Cookie Policy</h1>
          <div className="flex items-center gap-2 text-gray-400 mb-12 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Last updated: January 2025
          </div>

          <div className="space-y-12 text-gray-500 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-[#2d1f2d] mb-4 font-outfit">1. What Are Cookies?</h2>
              <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide a seamless experience, understand how the site is used, and show you relevant information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#2d1f2d] mb-4 font-outfit">2. Essential Cookies</h2>
              <div className="overflow-hidden border border-gray-100 rounded-2xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-[#2d1f2d] font-bold">
                    <tr>
                      <th className="px-6 py-4">Cookie</th>
                      <th className="px-6 py-4">Purpose</th>
                      <th className="px-6 py-4">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="px-6 py-4 font-mono">sp_session</td>
                      <td className="px-6 py-4">Maintains your secure login</td>
                      <td className="px-6 py-4">Session</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono">sp_consent</td>
                      <td className="px-6 py-4">Stores your privacy settings</td>
                      <td className="px-6 py-4">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-pink-50 p-8 rounded-3xl border border-pink-100">
               <h3 className="text-lg font-bold text-[#2d1f2d] mb-4">Managing your settings</h3>
               <p className="mb-6">You can adjust your cookie settings at any time. Note that disabling essential cookies may impact your ability to get a quote or manage your policy.</p>
               <button className="px-8 py-3 bg-[#e91e8c] text-white rounded-xl font-bold hover:bg-[#c4167a] transition-all">
                  Open Cookie Manager
               </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
