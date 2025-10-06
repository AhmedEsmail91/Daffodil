UPDATE "Appointments" appt
SET status = 'canceled' 
FROM "DoctorSchedules" sch
WHERE appt.schedule_id = sch.id
  AND appt.status = 'pending'
  AND sch."to" < NOW();

UPDATE "Appointments" appt
SET status = 'completed'
FROM "DoctorSchedules" sch
WHERE appt.schedule_id = sch.id
  AND appt.status = 'scheduled'
  AND sch."to" < NOW();

UPDATE "DoctorSchedules" sch
SET status = 'inactive'
WHERE sch.status= 'active' AND sch."to" < NOW();
