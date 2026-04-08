const nodemailer = require("nodemailer");

/* ================= SERVICE ================= */

class DoctorEmailService {

  constructor() {
    this.EMAIL_USER = process.env.EMAIL_USER;
    this.EMAIL_PASS = process.env.EMAIL_PASS;

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: this.EMAIL_USER,
        pass: this.EMAIL_PASS
      }
    });
  }

  /* ================= MAIN METHOD ================= */

  async sendDoctorApplicationEmail(doctorData, cvFile) {
    try {
      const { name, email, specialization, phone } = doctorData;

      /* ================= VALIDATION ================= */

      if (!name || !specialization || !email || !phone) {
        throw new Error("ALL_FIELDS_REQUIRED");
      }

      if (!cvFile) {
        throw new Error("CV_FILE_REQUIRED");
      }

      /* ================= SEND EMAILS (PARALLEL) ================= */

      await Promise.all([
        this._sendAdminEmail({ name, email, specialization, phone, cvFile }),
        this._sendThankYouEmail({ name, email, specialization })
      ]);

      return {
        success: true,
        message: "Admin + Thank You emails sent successfully"
      };

    } catch (error) {
      console.error("DOCTOR_EMAIL_SERVICE_ERROR:", error);
      throw error;
    }
  }

  /* ================= ADMIN EMAIL ================= */

  async _sendAdminEmail({ name, email, specialization, phone, cvFile }) {
    try {
      return await this.transporter.sendMail({
        from: this.EMAIL_USER,
        replyTo: email,
        to: this.EMAIL_USER,
        subject: "New Doctor Application",
        text: `
Doctor Application Details:

Name: ${name}
Specialization: ${specialization}
Email: ${email}
Phone: ${phone}
        `,
        attachments: [
          {
            filename: cvFile.originalname,
            content: cvFile.buffer
          }
        ]
      });
    } catch (error) {
      console.error("ADMIN_EMAIL_ERROR:", error);
      throw error;
    }
  }

  /* ================= THANK YOU EMAIL ================= */

  async _sendThankYouEmail({ name, email, specialization }) {
    try {
      return await this.transporter.sendMail({
        from: this.EMAIL_USER,
        to: email,
        subject: "Application Received - Thank You",
        html: `
          <h2>Dear Dr. ${name}, </h2>

          <p>Thank you for submitting your application for the position of <b> ${specialization} </b>. We have received your details and the attached resume successfully.</p>

          <p>Our team will review your profile and contact you shortly regarding the next steps in the selection process. If any additional information or documents are required, we will let you know.</p>

          <p>Thank you for your interest in joining <b>SymptoNexus</b>. We appreciate your time and look forward to connecting with you.</p>

          <br/>

          <p>Best Regards,</p>
          <p><b>SymptoNexus Team</b></p>
        `
      });
    } catch (error) {
      console.error("THANKYOU_EMAIL_ERROR:", error);
      throw error;
    }
  }
}

module.exports = new DoctorEmailService();