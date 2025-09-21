module.exports=class Templates {
  static apologizeEmailTemplate(name,appointmentDate,appointmentTime,rescheduleLink) {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Appointment Apology</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f9f9f9; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px;">
      
      <!-- Header -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <h1 style="color: #e74c3c; margin: 0;">We’re Sorry!</h1>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="color: #333; font-size: 16px; line-height: 1.5;">
          <p>Dear <strong>${name}</strong>,</p>

          <p>We sincerely apologize for the inconvenience caused regarding your scheduled appointment at <strong>Daffodil Clinic</strong>.</p>

          <p>Unfortunately, your appointment on <strong>${appointmentDate}</strong> at <strong>${appointmentTime}</strong> has been affected. We deeply regret any disruption this may have caused.</p>

          <p>Our team is here to assist you in rescheduling at a time that works best for you. Please contact us, or simply reply to this email, and we’ll be glad to arrange a new appointment promptly.</p>

          <p>Thank you for your understanding and patience. Your health and comfort remain our top priority.</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding: 25px 0;">
          <a href="${rescheduleLink}" style="background-color: #27ae60; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; font-weight: bold;">Reschedule Appointment</a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="font-size: 12px; color: #888; padding-top: 20px;">
          <p>Daffodil Clinic © 2025. All rights reserved.<br>
          Need help? Call us at <strong>(+20) 123-456-789</strong></p>
        </td>
      </tr>
    </table>
  </body>
</html>`
  }
  static apologizeEmailTemplateAr(name,appointmentDate,appointmentTime,rescheduleLink) {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>اعتذار عن الموعد</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f9f9f9; font-family: Tahoma, Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px; direction: rtl; text-align: right;">
      
      <!-- Header -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <h1 style="color: #e74c3c; margin: 0;">نعتذر منك!</h1>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="color: #333; font-size: 16px; line-height: 1.8;">
          <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>

          <p>نعتذر لك بصدق عن الإزعاج الذي سببه التغيير في موعدك في <strong>عيادة دافوديل</strong>.</p>

          <p>للأسف، تم تأجيل موعدك المحدد بتاريخ <strong>${appointmentDate}</strong> في الساعة <strong>${appointmentTime}</strong>. نحن نأسف بشدة لأي إرباك قد سببه ذلك.</p>

          <p>يسعدنا مساعدتك في تحديد موعد جديد يناسبك. يمكنك التواصل معنا مباشرة أو الرد على هذا البريد الإلكتروني لإعادة جدولة الموعد في أقرب وقت ممكن.</p>

          <p>نشكرك على تفهمك واعتذارنا العميق. راحتك وصحتك تهمنا دائمًا.</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding: 25px 0;">
          <a href="${rescheduleLink}" style="background-color: #27ae60; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; font-weight: bold;">إعادة جدولة الموعد</a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="font-size: 12px; color: #888; padding-top: 20px;">
          <p>© 2025 عيادة دافوديل - جميع الحقوق محفوظة<br>
          هل تحتاج المساعدة؟ اتصل بنا على <strong>(+20) 123-456-789</strong></p>
        </td>
      </tr>
    </table>
  </body>
</html>`
  }
  static initialPassword(name, email, password,loginLink) {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your Daffodil Clinic Account</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px;">

      <!-- Header -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">Welcome to Daffodil Clinic</h2>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="color: #333; font-size: 16px; line-height: 1.6;">
          <p>Dear <strong>${name}</strong>,</p>

          <p>Thank you for signing in with your Google account. We’ve also created a local account for you so you can log in directly with email and password if you prefer.</p>

          <p><strong>Email:</strong> ${email} <br>
             <strong>Initial Password:</strong> <span style="background:#f1f1f1; padding:6px 10px; border-radius:4px; font-weight:bold;">${password}</span></p>

          <p style="color: #e74c3c;"><strong>⚠️ Important:</strong> This is a temporary password. Please change it immediately after your first login for security purposes.</p>

          <p>You can log in anytime using the button below:</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding: 25px 0;">
          <a href="${loginLink}" style="background-color: #3498db; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; font-weight: bold;">Login to Your Account</a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="font-size: 12px; color: #888; padding-top: 20px;">
          <p>Daffodil Clinic © 2025. All rights reserved.<br>
          Need help? Contact us at <strong>(+20) 123-456-789</strong></p>
        </td>
      </tr>
    </table>
  </body>
</html>

`
  }
  static initialPasswordAr(name, email, password, loginLink) {
    return `
    <!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>حسابك في عيادة دافوديل</title>
  </head>
  <body style="margin: 0; padding: 20px; background-color: #f4f4f4; font-family: Tahoma, Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); padding: 30px; direction: rtl; text-align: right;">
      
      <!-- Header -->
      <tr>
        <td align="center" style="padding-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0;">مرحبًا بك في عيادة دافوديل</h2>
        </td>
      </tr>

      <!-- Message -->
      <tr>
        <td style="color: #333; font-size: 16px; line-height: 1.8;">
          <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>

          <p>شكرًا لاستخدامك حساب جوجل لتسجيل الدخول. لقد قمنا أيضًا بإنشاء حساب محلي لك بحيث يمكنك تسجيل الدخول مباشرة باستخدام البريد الإلكتروني وكلمة المرور إذا رغبت في ذلك.</p>

          <p><strong>البريد الإلكتروني:</strong> ${email} <br>
             <strong>كلمة المرور المبدئية:</strong> <span style="background:#f1f1f1; padding:6px 10px; border-radius:4px; font-weight:bold;">${password}</span></p>

          <p style="color: #e74c3c;"><strong>⚠️ تنبيه مهم:</strong> هذه كلمة مرور مؤقتة. يرجى تغييرها فور تسجيل الدخول لأول مرة حفاظًا على أمان حسابك.</p>

          <p>يمكنك تسجيل الدخول في أي وقت عبر الزر التالي:</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align="center" style="padding: 25px 0;">
          <a href="${loginLink}" style="background-color: #3498db; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 16px; font-weight: bold;">تسجيل الدخول إلى حسابك</a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td align="center" style="font-size: 12px; color: #888; padding-top: 20px;">
          <p>© 2025 عيادة دافوديل - جميع الحقوق محفوظة<br>
          هل تحتاج إلى المساعدة؟ تواصل معنا على <strong>(+20) 123-456-789</strong></p>
        </td>
      </tr>
    </table>
  </body>
</html>

    `
  }
}
;