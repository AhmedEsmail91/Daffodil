"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// common importing
var AppError = require('../../../utils/errors/AppError.js');

var _require = require('../../../utils/errors/catchError'),
    catchError = _require.catchError;

var dataQuery = require('../../../utils/QueryBuilders/dataQuery.js');

var ApiFeatures = require('../../../utils/QueryBuilders/Sequelize_API_Fetchers.js');

var _require2 = require('sequelize'),
    Op = _require2.Op; // specific importing


var dotenv = require('dotenv');

dotenv.config({
  debug: false,
  quiet: true
});

var _require3 = require('../../../database/models'),
    Appointment = _require3.Appointment,
    User = _require3.User,
    DoctorSchedule = _require3.DoctorSchedule,
    Doctor = _require3.Doctor,
    Scope = _require3.Scope,
    OnlineMeeting = _require3.OnlineMeeting;

var _require4 = require('./appointment.service.js'),
    getFormattedDate = _require4.getFormattedDate,
    announceCalendarEvent = _require4.announceCalendarEvent; //Admin 


var getAppointmentById = catchError(function _callee(req, res, next) {
  var appointment_id, appointment;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          appointment_id = req.params.id;
          _context.next = 3;
          return regeneratorRuntime.awrap(Appointment.findByPk(appointment_id, {
            include: [{
              model: DoctorSchedule,
              as: 'schedule',
              include: [{
                model: Doctor,
                as: 'doctor'
              }]
            }, {
              model: User,
              as: 'patient'
            }, {
              model: Scope,
              as: 'scope'
            }]
          }));

        case 3:
          appointment = _context.sent;

          if (appointment) {
            _context.next = 6;
            break;
          }

          return _context.abrupt("return", next(new AppError('No appointment found with that ID', 404)));

        case 6:
          res.json({
            status: 'success',
            appointment: appointment
          });

        case 7:
        case "end":
          return _context.stop();
      }
    }
  });
});
var getAllAppointments = catchError(function _callee2(req, res, next) {
  var dQuery, appointments, appointmentsData;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          dQuery = new dataQuery(); // dQuery.attributes=['id','title','notes','turn','images'];

          dQuery.include = [{
            model: DoctorSchedule,
            as: 'schedule',
            include: [{
              model: Doctor,
              as: 'doctor'
            }]
          }, {
            model: User,
            as: 'patient'
          }, {
            model: Scope,
            as: 'scope'
          }];
          appointments = new ApiFeatures(Appointment, req.query, dQuery).pagination().search(['title', 'turn']).sort();
          _context2.next = 5;
          return regeneratorRuntime.awrap(appointments.execute());

        case 5:
          appointmentsData = _context2.sent;

          if (!(appointmentsData.meta.totalResults < 1)) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", next(new AppError('No appointments found', 404)));

        case 8:
          res.json({
            status: 'success',
            appointments: appointmentsData
          });

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
});
var updateAppointment = catchError(function _callee3(req, res, next) {
  var id, _req$body, status, appointment_mode, notes, type, appointment, updated, timestamp, formattedNotes, schedule_id, schedule, online_current_turn, current_turn, turn, patientName, summary, details, calendarEvent, link;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          id = req.params.id;
          _req$body = req.body, status = _req$body.status, appointment_mode = _req$body.appointment_mode, notes = _req$body.notes, type = _req$body.type;
          _context3.next = 4;
          return regeneratorRuntime.awrap(Appointment.findByPk(id, {
            include: [{
              model: DoctorSchedule,
              as: 'schedule',
              include: [{
                model: Doctor,
                as: 'doctor',
                include: [{
                  model: User,
                  as: 'user'
                }]
              }]
            }, {
              model: User,
              as: 'patient'
            }, {
              model: Scope,
              as: 'scope'
            }, {
              model: OnlineMeeting,
              as: 'online_meeting'
            }]
          }));

        case 4:
          appointment = _context3.sent;

          if (appointment) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", next(new AppError('No appointment found with that ID', 404)));

        case 7:
          if (!(appointment.status !== 'pending')) {
            _context3.next = 9;
            break;
          }

          return _context3.abrupt("return", next(new AppError('Only pending appointments can be approved', 400)));

        case 9:
          updated = false; // Status update (Joi ensures it's provided & valid)

          if (appointment.status !== status) {
            appointment.status = status;
            updated = true;
          } // Mode update


          if (appointment_mode && appointment_mode !== appointment.appointment_mode) {
            appointment.appointment_mode = appointment_mode;
            updated = true;
          } // Notes update (append with timestamp for traceability)


          if (notes && notes !== appointment.notes) {
            timestamp = new Date().toISOString();
            formattedNotes = "admin:data:notes::".concat(notes, " [").concat(timestamp, "]");
            appointment.notes = appointment.notes ? "".concat(appointment.notes, "\n").concat(formattedNotes) : formattedNotes;
            updated = true;
          } // Type update


          if (type && type !== appointment.type) {
            appointment.type = type;
            updated = true;
          }

          schedule_id = appointment.schedule_id;
          schedule = appointment.schedule;

          if (schedule) {
            _context3.next = 18;
            break;
          }

          return _context3.abrupt("return", next(new AppError('Schedule not found for this appointment', 404)));

        case 18:
          if (!(appointment.appointment_mode === 'online')) {
            _context3.next = 27;
            break;
          }

          _context3.next = 21;
          return regeneratorRuntime.awrap(Appointment.count({
            where: {
              schedule_id: schedule_id,
              appointment_mode: 'online',
              status: 'scheduled'
            }
          }));

        case 21:
          online_current_turn = _context3.sent;

          if (!(online_current_turn >= schedule.online_cases_number)) {
            _context3.next = 24;
            break;
          }

          return _context3.abrupt("return", next(new AppError('No online slots available for this schedule', 400)));

        case 24:
          appointment.turn = online_current_turn + 1;
          _context3.next = 31;
          break;

        case 27:
          _context3.next = 29;
          return regeneratorRuntime.awrap(Appointment.count({
            where: {
              schedule_id: schedule_id,
              appointment_mode: 'in-person',
              status: 'scheduled'
            }
          }));

        case 29:
          current_turn = _context3.sent;
          appointment.turn = current_turn + 1;

        case 31:
          if (updated) {
            _context3.next = 33;
            break;
          }

          return _context3.abrupt("return", res.json({
            status: 'success',
            message: 'No changes detected',
            appointment: appointment
          }));

        case 33:
          _context3.next = 35;
          return regeneratorRuntime.awrap(appointment.save());

        case 35:
          // Calendar event
          turn = appointment.turn;
          patientName = appointment.patient.username;
          summary = appointment.appointment_mode === 'in-person' ? "In-Person - Patient: ".concat(patientName, " - Turn: ").concat(turn) : "Online - Patient: ".concat(patientName, " - Turn: ").concat(turn);
          details = "Visit the App for details: ".concat(process.env.FRONT_BASE_URL, "/appointment/").concat(appointment.id);
          _context3.next = 41;
          return regeneratorRuntime.awrap(announceCalendarEvent(appointment.schedule.doctor.user_id, appointment.schedule.from, appointment.schedule.to, summary, appointment.appointment_mode, details, [appointment.patient.email]));

        case 41:
          calendarEvent = _context3.sent;
          _context3.next = 44;
          return regeneratorRuntime.awrap(OnlineMeeting.create({
            appointment_id: appointment.id,
            startTime: appointment.schedule.from,
            endTime: appointment.schedule.to,
            attendees: [appointment.patient.email],
            link: calendarEvent.data.hangoutLink
          }));

        case 44:
          link = _context3.sent;
          res.json({
            status: 'success',
            message: 'Appointment updated successfully',
            appointment: appointment,
            link: link,
            calendarEvent: calendarEvent
          });

        case 46:
        case "end":
          return _context3.stop();
      }
    }
  });
}); // Patient

var createAppointment = catchError(function _callee4(req, res, next) {
  var _req$auth, patient_id, patient_email, patient_name, _req$body2, schedule_id, type, notes, appointment_mode, scope_id, appointmentData, scope, images, schedule, existingAppointment, createdAppointment;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // handle patient info.
          _req$auth = req.auth, patient_id = _req$auth.user_id, patient_email = _req$auth.email, patient_name = _req$auth.username;
          _req$body2 = req.body, schedule_id = _req$body2.schedule_id, type = _req$body2.type, notes = _req$body2.notes, appointment_mode = _req$body2.appointment_mode, scope_id = _req$body2.scope_id;
          appointmentData = {
            patient_id: patient_id,
            schedule_id: schedule_id,
            scope_id: scope_id,
            appointment_mode: appointment_mode,
            type: type,
            notes: notes
          }; //check scope existence:

          _context4.next = 5;
          return regeneratorRuntime.awrap(Scope.findByPk(scope_id));

        case 5:
          scope = _context4.sent;

          if (scope) {
            _context4.next = 8;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Scope not found', 404)));

        case 8:
          // handle images
          if (req.files.images && req.files.images.length) {
            images = req.files.images;
            appointmentData.images = images.map(function (image) {
              return {
                path: image.path.replace(/\\/g, '/').split('uploads/').pop(),
                name: image.originalname
              };
            });
          } // get schedule info if exists.


          _context4.next = 11;
          return regeneratorRuntime.awrap(DoctorSchedule.findByPk(schedule_id, {
            include: [{
              model: Doctor,
              as: 'doctor',
              include: [{
                model: User,
                as: 'user'
              }]
            }]
          }));

        case 11:
          schedule = _context4.sent;

          if (schedule) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Schedule not found', 404)));

        case 14:
          if (!(schedule.to < new Date())) {
            _context4.next = 16;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Schedule is expired', 400)));

        case 16:
          _context4.next = 18;
          return regeneratorRuntime.awrap(Appointment.findOne({
            where: {
              patient_id: patient_id,
              schedule_id: schedule_id,
              status: _defineProperty({}, Op["in"], ['pending', 'scheduled'])
            }
          }));

        case 18:
          existingAppointment = _context4.sent;

          if (!existingAppointment) {
            _context4.next = 21;
            break;
          }

          return _context4.abrupt("return", next(new AppError('You already have an appointment in this schedule', 400)));

        case 21:
          appointmentData.title = "".concat(schedule.doctor.name_en, " - ").concat(getFormattedDate(schedule.from), " to ").concat(getFormattedDate(schedule.to));
          appointmentData.status = 'pending';
          _context4.next = 25;
          return regeneratorRuntime.awrap(Appointment.create(appointmentData));

        case 25:
          createdAppointment = _context4.sent;

          if (createdAppointment) {
            _context4.next = 28;
            break;
          }

          return _context4.abrupt("return", next(new AppError('Failed to create appointment', 500)));

        case 28:
          res.status(201).json({
            message: 'Appointment created successfully. and your are waiting for approval',
            appointment: createdAppointment,
            paying_methods: {
              VC: process.env.VC_LINK,
              instapay_link: process.env.INSTAPAY_LINK,
              cash: 'At the clinic'
            }
          });

        case 29:
        case "end":
          return _context4.stop();
      }
    }
  });
});
var getPatientAppointments = catchError(function _callee5(req, res, next) {
  var patient_id, dQuery, appointments, appointmentsData;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          patient_id = req.params.id || req.auth.user_id;
          dQuery = new dataQuery();
          dQuery.where = {
            patient_id: patient_id
          };
          dQuery.include = [{
            model: DoctorSchedule,
            as: 'schedule',
            //  where:{to:{[Op.gte]:new Date()}},
            include: [{
              model: Doctor,
              as: 'doctor'
            }]
          }, {
            model: User,
            as: 'patient'
          }, {
            model: OnlineMeeting,
            as: 'online_meeting'
          }, {
            model: Scope,
            as: 'scope'
          }];
          appointments = new ApiFeatures(Appointment, req.query, dQuery).pagination().search(['title', 'turn']).sort();
          _context5.next = 7;
          return regeneratorRuntime.awrap(appointments.execute());

        case 7:
          appointmentsData = _context5.sent;

          if (!(appointmentsData.meta.totalResults < 1)) {
            _context5.next = 10;
            break;
          }

          return _context5.abrupt("return", next(new AppError('No appointments found', 404)));

        case 10:
          res.json({
            status: 'success',
            appointments: appointmentsData
          });

        case 11:
        case "end":
          return _context5.stop();
      }
    }
  });
}); // Doctor

var getDoctorAppointments = catchError(function _callee6(req, res, next) {
  var doctor_id, dQuery, appointments, appointmentsData;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          doctor_id = req.params.id || req.auth.user_id;
          dQuery = new dataQuery();
          dQuery.include = [{
            model: DoctorSchedule,
            as: 'schedule',
            include: [{
              model: Doctor,
              as: 'doctor'
            }]
          }, {
            model: User,
            as: 'patient'
          }, {
            model: Scope,
            as: 'scope'
          }];
          appointments = new ApiFeatures(Appointment, req.query, dQuery).pagination().search(['title', 'turn']).sort();
          _context6.next = 6;
          return regeneratorRuntime.awrap(appointments.execute());

        case 6:
          appointmentsData = _context6.sent;

          if (!(appointmentsData.meta.totalResults < 1)) {
            _context6.next = 9;
            break;
          }

          return _context6.abrupt("return", next(new AppError('No appointments found', 404)));

        case 9:
          res.json({
            status: 'success',
            appointments: appointmentsData
          });

        case 10:
        case "end":
          return _context6.stop();
      }
    }
  });
});
module.exports = {
  getAllAppointments: getAllAppointments,
  getAppointmentById: getAppointmentById,
  createAppointment: createAppointment,
  getPatientAppointments: getPatientAppointments,
  getDoctorAppointments: getDoctorAppointments,
  updateAppointment: updateAppointment
};