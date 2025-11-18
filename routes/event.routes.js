const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const { createEvent, getEvents, joinEvent, leaveEvent, getEventMembers, checkJoinStatus, deleteEvent, updateEvent } = require("../src/Controllers/EventController");
const Store = require("../src/middleware/Store");

const router = Router();
router.get('/', Auth(), getEvents);
router.post('/', Auth('Admin'), Store('image').any(), createEvent);
router.post('/:id/join', Auth('User'), joinEvent);
router.post('/:id/leave', Auth('User'), leaveEvent);
router.get('/members', Auth(), getEventMembers);
router.get('/:id/status', Auth(), checkJoinStatus);
router.delete('/delete/:id', Auth('Admin'), deleteEvent);
router.put('/update/:id', Auth('Admin'), Store('image').any(), updateEvent);
module.exports = router;