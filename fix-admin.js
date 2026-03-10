import fs from 'fs';

const filePath = 'pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix user list
content = content.replace(/<\/span>\s*<\/td>\s*<td className="px-10 py-8">/g, '</span>\n                                  </div>\n                                  <div>');

// Fix audit logs
content = content.replace(/<\/tbody>\s*<\/table>/g, '');

// Fix td/tr in audit logs
content = content.replace(/<tr key={log\.id} className="hover:bg-gray-50\/50 transition-all group">/g, '<div key={log.id} className="grid grid-cols-[2fr_1.5fr_1.5fr_2fr_1.5fr] px-10 py-8 hover:bg-gray-50/50 transition-all group items-center">');
content = content.replace(/<td className="px-10 py-8">/g, '<div>');
content = content.replace(/<\/td>/g, '</div>');
content = content.replace(/<\/tr>/g, '</div>');

fs.writeFileSync(filePath, content);
console.log('Fixed AdminDashboard.tsx');
