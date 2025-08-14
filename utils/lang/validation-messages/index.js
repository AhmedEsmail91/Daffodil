const fs = require('fs');
const path = require('path');
const enMessages =require('./en.js');
let arMessages = {};

const arFilePath = path.join(__dirname, 'ar.js');
if (fs.existsSync(arFilePath)) {
    delete require.cache[require.resolve('./ar.js')]; // ensure fresh load
    arMessages = require('./ar.js');
} else {
    fs.writeFileSync(arFilePath, 'module.exports = {};'); // create empty file if it doesn't exist
}
let updated = false;

for (const key in enMessages) {
    if (!arMessages.hasOwnProperty(key)) {
        arMessages[key] = enMessages[key];
        updated = true;
    }
}
for (const key in arMessages) {
    if (!enMessages.hasOwnProperty(key)) {
        delete arMessages[key];
        updated = true;
    }
}

if (updated) {
    fs.writeFileSync(arFilePath, `module.exports = ${JSON.stringify(arMessages, null, 4)};`);
    console.log('✅ ar.js synchronized with messages_en.');
} else {
    // console.log('✅ ar.js is already synchronized.');
}

module.exports = (key) => {
    const en = enMessages[key] || "no custom messages for this validation error";
    const ar = arMessages[key] || "لا توجد رسائل مخصصة لهذا الخطأ في التحقق";
    const val = enMessages[key] ? true : false;
    return {
        en,
        ar,
        val
    };
};
