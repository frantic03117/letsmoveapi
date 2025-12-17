

const firebaseAdmin = require("../../firebaseAuth");
const AppNotification = require("../Models/AppNotification");
const User = require("../Models/User");

const BATCH_SIZE = 500;

class NotificationService {
    /**
     * Generic notification sender
     */
    // NotificationService.send({
    //     bulk: true,
    //     title: "New Event 🎉",
    //     message: event.title,
    //     action: "CREATED",
    //     entity: event._id,
    //     entityModel: "Event",
    // });
    // NotificationService.send({
    //     users: [user1, user2],
    //     title: "Member Left",
    //     message: "A member left the community",
    //     action: "LEFT",
    //     entity: communityId,
    //     entityModel: "Community",
    // });
    static async send({
        users,              // userId | [userId] | null (bulk)
        title,
        message,
        action,
        entity,
        entityModel,
        meta = {},
        showTo = "User",
        bulk = false
    }) {
        if (bulk) {
            await this.#sendBulk({
                title,
                message,
                action,
                entity,
                entityModel,
                meta,
                showTo
            });
        } else {
            await this.#sendSingle({
                users,
                title,
                message,
                action,
                entity,
                entityModel,
                meta,
                showTo
            });
        }
    }

    // ---------------- PRIVATE ----------------

    static async #sendSingle({
        users,
        title,
        message,
        action,
        entity,
        entityModel,
        meta,
        showTo
    }) {
        const userIds = Array.isArray(users) ? users : [users];

        // 1️⃣ Save in DB
        const notifications = userIds.map((user) => ({
            user,
            title,
            message,
            action,
            entity,
            entityModel,
            meta,
            show_to: showTo,
        }));

        await AppNotification.insertMany(notifications);

        // 2️⃣ Send FCM
        const usersWithTokens = await User.find(
            { _id: { $in: userIds }, fcm_token: { $ne: null } },
            { fcm_token: 1 }
        );

        const tokens = usersWithTokens.map((u) => u.fcm_token);

        if (!tokens.length) return;

        await firebaseAdmin.messaging().sendEachForMulticast({
            tokens,
            notification: { title, body: message },
            data: {
                action,
                entityId: entity ? String(entity) : "",
                entityModel: entityModel || "",
                meta: JSON.stringify(meta),
            },
        });
    }

    static async #sendBulk({
        title,
        message,
        action,
        entity,
        entityModel,
        meta,
        showTo
    }) {
        // 1️⃣ Save ONE global notification (not 50k)
        await AppNotification.create({
            user: null,
            title,
            message,
            action,
            entity,
            entityModel,
            meta,
            show_to: showTo,
        });

        // 2️⃣ Send FCM batch-wise
        const cursor = User.find(
            { fcm_token: { $exists: true, $ne: null } },
            { fcm_token: 1 }
        ).cursor();

        let batch = [];

        for await (const user of cursor) {
            batch.push(user.fcm_token);

            if (batch.length === BATCH_SIZE) {
                await this.#sendBatch(batch, {
                    title,
                    message,
                    action,
                    entity,
                    entityModel,
                    meta,
                });
                batch = [];
            }
        }

        if (batch.length) {
            await this.#sendBatch(batch, {
                title,
                message,
                action,
                entity,
                entityModel,
                meta,
            });
        }
    }

    static async #sendBatch(tokens, payload) {
        const response = await firebaseAdmin.messaging().sendEachForMulticast({
            tokens,
            notification: {
                title: payload.title,
                body: payload.message,
            },
            data: {
                action: payload.action,
                entityId: payload.entity ? String(payload.entity) : "",
                entityModel: payload.entityModel || "",
                meta: JSON.stringify(payload.meta || {}),
            },
        });

        // Clean invalid tokens
        response.responses.forEach((res, idx) => {
            if (!res.success) {
                const code = res.error?.code;
                if (
                    code === "messaging/invalid-registration-token" ||
                    code === "messaging/registration-token-not-registered"
                ) {
                    User.updateOne(
                        { fcm_token: tokens[idx] },
                        { $unset: { fcm_token: 1 } }
                    ).exec();
                }
            }
        });
    }
}

module.exports = NotificationService;
