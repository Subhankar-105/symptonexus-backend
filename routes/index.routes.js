const AuthRoutes = require("./auth.route");
const PatientRoutes = require("./patient.routes");
const CreateAdminRoutes = require("./admin.routes");
const DoctorRoutes = require("./doctor.routes");
const applyDoctorRoutes = require("./applyDoctor.routes");
const DoctorProfileRoutes = require("./doctorProfile.routes");
const SlotAvailableRoutes = require("./slotAvailability.routes");
const AdminProfileRoutes = require("./adminProfile.routes");
const dashboardRoutes = require("./homepageCount.routes");
const accountRoutes = require("./accountDelete.routes");
const appointmentRoutes = require("./appointment.routes");
const acknowledgementPdfRoutes = require("./acknowledgementPdf.routes");


module.exports = (app) => {
  app.use("/api/auth", AuthRoutes);
  app.use("/api/patient", PatientRoutes );
  app.use("/api/admin", CreateAdminRoutes ); 
  app.use("/api/doctor", DoctorRoutes);
  app.use("/api", applyDoctorRoutes);
  app.use("/api/doctor", DoctorProfileRoutes);
  app.use("/api/doctor", SlotAvailableRoutes );
  app.use("/api/admin", AdminProfileRoutes);
  app.use("/api", dashboardRoutes);
  app.use("/api/account", accountRoutes);
  app.use("/api/appointment", appointmentRoutes);
  app.use("/api", acknowledgementPdfRoutes);
};
