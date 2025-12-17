const { Schema, Types, model } = require("mongoose");
const User = require("./User");

const schema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: "User",
        default: null
    },
    title: String,
    message: String,
    action: {
        type: String,
        enum: [
            "JOINED",
            "LEFT",
            "CREATED",
            "UPDATED",
            "DELETED",
            "REMINDER"
        ],
        required: true
    },
    entity: {
        type: Types.ObjectId,
        default: null
    },
    entityModel: {
        type: String,
        default: null
    },
    meta: {
        type: Schema.Types.Mixed, // optional extra data
        default: {}
    },
    is_read: {
        type: Boolean,
        default: false
    },
    show_to: {
        type: String,
        enum: ['User', 'Admin', 'All'],
        default: null
    }

}, { timestamps: true });
// schema.post('save', async function (doc) {
//     try {
//         const user = await User.findById(doc.user);

//         const payload = {
//             notification: {
//                 title: doc.title,
//                 body: doc.message,
//             },
//             data: {
//                 notificationId: String(doc._id),

//                 type: doc.type,
//                 action: doc.action,

//                 entityId: doc.entity ? String(doc.entity) : "",
//                 entityModel: doc.entityModel || "",

//                 showTo: doc.show_to,

//                 createdAt: doc.createdAt.toISOString(),

//                 // Optional extra metadata
//                 meta: doc.meta ? JSON.stringify(doc.meta) : "{}"
//             }
//         };

//         const tokens = [];

//         if (user?.fcm_token && (doc.show_to === 'User')) {
//             tokens.push(user.fcm_token);
//         }



//         if (tokens.length == 0) return;
//         tokens.forEach(async tk => {
//             await firebaseAdmin.messaging().send({
//                 token: tk,
//                 notification: payload.notification,
//                 data: payload.data
//             });
//         })
//         // Send FCM
//         if (tokens.length == 1) {
//             await firebaseAdmin.messaging().send({
//                 token: tokens[0],
//                 notification: payload.notification,
//                 data: payload.data
//             });
//         } else {
//             await firebaseAdmin.messaging().sendEachForMulticast({
//                 tokens,
//                 notification: payload.notification,
//                 data: payload.data
//             });
//         }

//         console.log("FCM notifications sent successfully!");
//     } catch (err) {
//         console.error("Error sending FCM notification:", err);
//     }
// });

module.exports = new model('AppNotification', schema);