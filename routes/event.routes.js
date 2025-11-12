const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const { createEvent, getEvents, joinEvent, leaveEvent, getEventMembers, checkJoinStatus } = require("../src/Controllers/EventController");

const router = Router();
router.get('/', Auth(), getEvents);
router.post('/', Auth('Admin', 'Employee', 'SubAdmin'), createEvent);
router.post('/:id/join', Auth('User'), joinEvent);
router.post('/:id/leave', Auth('User'), leaveEvent);
router.get('/members', Auth(), getEventMembers);
router.get('/:id/status', Auth(), checkJoinStatus);
module.exports = router;