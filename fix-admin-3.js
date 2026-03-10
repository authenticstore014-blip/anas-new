import fs from 'fs';

const filePath = 'pages/AdminDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Fix client-registry closing div
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\}\)\}\s*<\/div>/, '</div>\n                               </div>\n                             );\n                           })}\n                        </div>');

// Fix activity-audit closing divs
content = content.replace(/<\/div>\s*\}\)\}\s*\{adminActivityLogs\.length === 0 && <div className="py-20 text-center text-gray-300 uppercase font-black tracking-widest">No audit history found\.<\/div>\}\s*<\/div>\s*<\/div>\s*\}\)/, '</div>\n                           ))}\n                        </div>\n                     </div>\n                  </div>\n                  {adminActivityLogs.length === 0 && <div className="py-20 text-center text-gray-300 uppercase font-black tracking-widest">No audit history found.</div>}\n               </div>\n            )}');

fs.writeFileSync(filePath, content);
console.log('Fixed AdminDashboard.tsx with regex');
