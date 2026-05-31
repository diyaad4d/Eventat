const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Phase 2 fallback logic for development if JWT_SECRET is not yet set
    const secret = process.env.JWT_SECRET || 'phase-2-development-fallback-secret';
    
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user payload (usually contains id, role) to the request object
    req.user = decoded;
    
    next();
  } catch (err) {
    console.error('[Auth Error]', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authMiddleware;


/*

errorHandler.js: (المُسعف) هذا الحارس يقف في النهاية، وظيفته أنه إذا حدث أي انهيار أو خطأ مفاجئ في السيرفر، يتدخل ليمتص الصدمة ويرسل للواجهة الأمامية رسالة خطأ أنيقة بصيغة JSON بدلاً من إغلاق السيرفر بالكامل.

validate.middleware.js: (المدقق) سيفحص استمارات التسجيل والدخول قبل إرسالها لقاعدة البيانات.

auth.middleware.js: (مفتش الهوية) سيتأكد من وجود التوكن (JWT) للمسارات المحمية.

role.middleware.js: (مفتش الصلاحيات) سيفصل بين صلاحيات الـ Admin والـ Vendor والـ Customer

*/
