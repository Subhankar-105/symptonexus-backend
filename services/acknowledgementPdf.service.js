const fs = require("fs");
const path = require("path");

const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/Doctor_Availablity");
const Doctor = require("../models/Doctor");
const DoctorSpecialization = require("../models/Doctor_specalization");
const DoctorDetails = require("../models/Doctor_Details");
const DomainLookup = require("../models/Domain_lookup");
const patientDetails = require("../models/Patient_Details");
const Patient = require("../models/patient");


const replaceTemplatePlaceholders = require("../utils/templateReplacer");
const generatePdfFromHtml = require("../utils/generatePdf");

class AcknowledgementPdfService {
  static calculateAge(dob) {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  static formatTimeTo12Hour(time) {
    if (!time) return "";

    const [hour, minute] = time.split(":");
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12;

    return `${String(h).padStart(2, "0")}:${minute} ${ampm}`;
  }

  static async generateAcknowledgementPdf(appointmentId) {
    try {
      if (!appointmentId) {
        return {
          success: false,
          message: "appointmentId is required",
        };
      }

      const appointment = await Appointment.findByPk(appointmentId, {
        include: [
          {
            model: Patient,
            as: "patient",
            required: false,
            include: [
              {
                model: patientDetails,
                as: "patient_detail",
                required: false,
                include: [
                  {
                    model: DomainLookup,
                    as: "genderLookup",
                    attributes: ["domain_name"],
                    where: { domain_type: "gender" },
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: Doctor,
            as: "doctor",
            required: false,
            include: [
              {
                model: DoctorDetails,
                as: "doctor_detail",
                required: false,
              },
              {
                model: DoctorSpecialization,
                as: "doctor_specializations",
                required: false,
                include: [
                  {
                    model: DomainLookup,
                    as: "specializationLookup",
                    attributes: ["domain_name"],
                    where: { domain_type: "specialization" },
                    required: false,
                  },
                ],
              },
            ],
          },
          {
            model: DoctorAvailability,
            as: "availability",
            required: false,
          },
          {
            model: DomainLookup,
            as: "statusLookup",
            attributes: ["domain_name"],
            where: { domain_type: "booking_status" },
            required: false,
          },
        ],
      });

      if (!appointment) {
        return {
          success: false,
          message: "Appointment not found",
        };
      }
        const logoPath = path.join(process.cwd(), "assets", "logo.png");

            const logoBase64 = fs.readFileSync(logoPath, {
            encoding: "base64",
            });

        const logoSrc = `data:image/png;base64,${logoBase64}`;

        const watermarkPath = path.join(process.cwd(), "assets", "watermark.png");

            const watermarkBase64 = fs.readFileSync(watermarkPath, {
            encoding: "base64",
            });

            const watermarkSrc = `data:image/png;base64,${watermarkBase64}`;

      const data = {
        logo: logoSrc,
        watermark: watermarkSrc,
        patient_name: [
          appointment.patient?.first_name,
          appointment.patient?.middle_name,
          appointment.patient?.last_name,
        ]
          .filter(Boolean)
          .join(" "),
        patient_gender:
          appointment.patient?.patient_detail?.genderLookup?.domain_name || "",
        patient_dob: appointment.patient?.patient_detail?.dob || "",
        patient_age: this.calculateAge(
          appointment.patient?.patient_detail?.dob
        ),
        patient_phone: appointment.patient?.phone_no || "",

        doctor_name: [
          appointment.doctor?.first_name,
          appointment.doctor?.middle_name,
          appointment.doctor?.last_name,
        ]
          .filter(Boolean)
          .join(" "),
        specialization:
          appointment.doctor?.doctor_specializations?.[0]?.specializationLookup
            ?.domain_name || "",
        doctor_bio: appointment.doctor?.doctor_detail?.sort_desc || "",
        doctor_phone: appointment.doctor?.phone_no || "",
        license_number:
          appointment.doctor?.doctor_detail?.licence_number || "",
        slot_time: appointment.availability
          ? `${this.formatTimeTo12Hour(
              appointment.availability.start_time
            )} - ${this.formatTimeTo12Hour(appointment.availability.end_time)}`
          : "",
        experience: `${!appointment.doctor?.doctor_detail?.experience
        ? "Fresher"
        : appointment.doctor.doctor_detail.experience === 1
        ? "1 year"
        : `${appointment.doctor.doctor_detail.experience} years`}`,
        fees: `${appointment.availability?.fees} INR`,

        appointment_id:
          appointment.appointment_no || appointment.appointment_id || "",
        appointment_date: appointment.booking_date || "",
        appointment_time: this.formatTimeTo12Hour(appointment.booking_time),
        booking_status: appointment.statusLookup?.domain_name || "",
        consultation: "Follow Up",

        consultation_type: "In-Person",
        consultation_reason: appointment.description || "",

        booking_no: appointment.booking_no || "",
        booking_date: appointment.created_on
          ? appointment.created_on.toISOString().split("T")[0]
          : "",
        booking_time: appointment.created_on
          ? this.formatTimeTo12Hour(
              appointment.created_on.toTimeString().split(" ")[0]
            )
          : "",
        reporting_time: this.formatTimeTo12Hour(appointment.booking_time),
      };

      const templatePath = path.join(
        process.cwd(),
        "templates",
        "acknowledgementTemplate.html"
      );

      const templateHtml = fs.readFileSync(templatePath, "utf8");
      const finalHtml = replaceTemplatePlaceholders(templateHtml, data);
      const pdfBuffer = await generatePdfFromHtml(finalHtml);

      return {
        success: true,
        message: "Acknowledgement PDF generated successfully",
        data: pdfBuffer,
        
      };
    } catch (error) {
      console.error("ACKNOWLEDGEMENT PDF SERVICE ERROR:", error);

      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = AcknowledgementPdfService;