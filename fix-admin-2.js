import fs from 'fs';

const filePath = 'pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix the damage from previous script
content = content.replace(/<thead className="bg-\[#2d1f2d\] text-\[9px\] font-black uppercase text-white\/40 tracking-\[0.2em\]">\s*<tr>/g, '<div className="grid grid-cols-[1.5fr_1fr_2fr_1.2fr_1fr_1.2fr_1fr_1fr_1fr] bg-[#2d1f2d] text-[9px] font-black uppercase text-white/40 tracking-[0.2em] px-8 py-7">');
content = content.replace(/<th className="px-8 py-7 border-b border-white\/5">/g, '<div>');
content = content.replace(/<th className="px-8 py-7 border-b border-white\/5 text-center">/g, '<div className="text-center">');
content = content.replace(/<\/th>/g, '</div>');
content = content.replace(/<\/tr>\s*<\/thead>/g, '</div>');
content = content.replace(/<\/div>\s*<\/thead>/g, '</div>'); // Fix the broken one

// Fix any other stray table tags
content = content.replace(/<\/tbody>/g, '');
content = content.replace(/<\/table>/g, '');

fs.writeFileSync(filePath, content);
console.log('Fixed AdminDashboard.tsx again');
