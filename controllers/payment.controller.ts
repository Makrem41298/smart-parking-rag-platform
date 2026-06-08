import {stripe} from "../config/stripe";
import {AuthRequest} from "../middlewares/auth.middleware";
import {Request, Response} from "express";
import {ReservationModel} from "../models/reservation.model";
import {PaymentStatus, ReservationStatus, Role} from "../models/enum.type";
import {UserModel} from "../models/user.model";
import {PaymentTransactionModel} from "../models/paymentTransaction.model";
import {EventLogModel} from "../models/eventLog.model";
import sequelize from "../models";
import QRCode from "qrcode";


export async function initCheckout(req: AuthRequest, res: Response) {
    const transaction = await sequelize.transaction();

    try {
        const { reservationId, amount } = req.body;

        if (!reservationId || !amount) {
            await transaction.rollback();
            return res.status(400).json({ message: "reservationId and amount are required" });
        }

        // ✅ Validate reservation exists and is in PENDING status
        const reservation = await ReservationModel.findByPk(reservationId, { transaction });

        if (!reservation) {
            await transaction.rollback();
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.status !== ReservationStatus.PENDING) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Reservation is not in PENDING status (current: ${reservation.status})`,
            });
        }

        // ✅ Prevent duplicate payments (polymorphic 1:1 check)
        const existingPayment = await PaymentTransactionModel.findOne({
            where: { paymentableId: reservationId, paymentableType: "reservation" },
            transaction,
        });

        if (existingPayment) {
            if (existingPayment.status === PaymentStatus.SUCCESS) {
                await transaction.rollback();
                return res.status(409).json({
                    message: "A payment already exists for this reservation",
                    paymentStatus: existingPayment.status,
                });
            }

            // If it is PENDING, try to retrieve the existing Stripe session
            if (existingPayment.status === PaymentStatus.PENDING && existingPayment.stripeSessionId) {
                try {
                    const session = await stripe.checkout.sessions.retrieve(existingPayment.stripeSessionId);
                    if (session && session.status === "open" && session.url) {
                        await transaction.commit();
                        console.log("Reusing open Stripe session for reservation:", reservationId);
                        return res.json({
                            url: session.url,
                            paymentTransactionId: existingPayment.id,
                        });
                    }
                } catch (stripeErr) {
                    console.warn("Could not retrieve existing Stripe session, creating a new one:", stripeErr);
                }
            }

            // Create new checkout session and update the existing PaymentTransaction record
            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "eur",
                            product_data: {
                                name: `Parking Reservation #${reservationId}`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    reservationId: String(reservationId),
                },
                success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            });

            await existingPayment.update(
                {
                    amount,
                    paymentDateTime: new Date(),
                    status: PaymentStatus.PENDING,
                    stripeSessionId: session.id,
                },
                { transaction }
            );

            await EventLogModel.create(
                {
                    paymentTransactionId: existingPayment.id,
                    status: PaymentStatus.PENDING,
                    message: `New checkout session created (retry): ${session.id}`,
                },
                { transaction }
            );

            await transaction.commit();
            console.log("✅ New checkout session created (retry) for reservation:", reservationId);
            return res.json({
                url: session.url,
                paymentTransactionId: existingPayment.id,
            });
        }

        // ✅ Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `Parking Reservation #${reservationId}`,
                        },
                        unit_amount: Math.round(amount * 100),
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                reservationId: String(reservationId),
            },
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        });

        // ✅ Create PaymentTransaction with PENDING status (polymorphic)
        const paymentTransaction = await PaymentTransactionModel.create(
            {
                amount,
                paymentDateTime: new Date(),
                method: "stripe",
                status: PaymentStatus.PENDING,
                stripeSessionId: session.id,
                paymentableId: reservationId,
                paymentableType: "reservation",
            },
            { transaction }
        );

        // ✅ Log the PENDING event
        await EventLogModel.create(
            {
                paymentTransactionId: paymentTransaction.id,
                status: PaymentStatus.PENDING,
                message: `Checkout session created: ${session.id}`,
            },
            { transaction }
        );

        await transaction.commit();

        console.log("✅ Checkout session created for reservation:", reservationId);

        return res.json({
            url: session.url,
            paymentTransactionId: paymentTransaction.id,
        });
    } catch (error) {
        await transaction.rollback();
        console.error("❌ Checkout error:", error);
        return res.status(500).json({ message: "Payment session error" });
    }
}


export async function webhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );

        console.log(`✅ Webhook received: ${event.type}`);

        // ─────────── checkout.session.completed ───────────
        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;
            const stripeSessionId = session.id;
            const reservationId = session.metadata?.reservationId;

            // Find PaymentTransaction by stripeSessionId
            const paymentTransaction = await PaymentTransactionModel.findOne({
                where: { stripeSessionId },
            });

            if (!paymentTransaction) {
                console.error(`⚠️ PaymentTransaction not found for session: ${stripeSessionId}`);
                return res.status(200).json({ received: true, warning: "PaymentTransaction not found" });
            }

            // Update payment status to SUCCESS
            await paymentTransaction.update({ status: PaymentStatus.SUCCESS });

            // Log SUCCESS event
            await EventLogModel.create({
                paymentTransactionId: paymentTransaction.id,
                status: PaymentStatus.SUCCESS,
                message: `Payment completed via Stripe session ${stripeSessionId}`,
            });

            // Confirm the reservation and generate QR code
            if (reservationId) {
                const reservation = await ReservationModel.findByPk(reservationId);
                if (reservation) {
                    reservation.status = ReservationStatus.CONFIRMED;

                    // ✅ Generate QR code now that payment is confirmed
                    const qrPayload = JSON.stringify({
                        reservationId: reservation.id,
                        userId: reservation.userId,
                        parkingLotId: reservation.parkingLotId,
                        startTime: reservation.startTimeDate,
                        endTime: reservation.endTimeDate,
                    });
                    const qrBase64 = await QRCode.toDataURL(qrPayload);
                    reservation.qrCode = qrBase64;

                    await reservation.save();
                    console.log("✅ Reservation confirmed + QR generated:", reservationId);
                }
            }
        }

        // ─────────── checkout.session.expired ───────────
        if (event.type === "checkout.session.expired") {
            const session = event.data.object as any;
            const stripeSessionId = session.id;

            const paymentTransaction = await PaymentTransactionModel.findOne({
                where: { stripeSessionId },
            });

            if (paymentTransaction) {
                await paymentTransaction.update({ status: PaymentStatus.FAILED });

                await EventLogModel.create({
                    paymentTransactionId: paymentTransaction.id,
                    status: PaymentStatus.FAILED,
                    message: `Checkout session expired: ${stripeSessionId}`,
                });

                console.log("⚠️ Payment session expired for transaction:", paymentTransaction.id);
            }
        }

        // ─────────── payment_intent.payment_failed ───────────
        if (event.type === "payment_intent.payment_failed") {
            const paymentIntent = event.data.object as any;
            const failureMessage = paymentIntent.last_payment_error?.message || "Unknown error";

            console.error(`❌ Payment intent failed: ${paymentIntent.id} - ${failureMessage}`);
        }

        return res.status(200).json({ received: true });
    } catch (err: any) {
        console.error("❌ Webhook signature verification error:", err.message);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
}


export async function getPaymentByReservation(req: AuthRequest, res: Response) {
    try {
        const { reservationId } = req.params;

        // Polymorphic lookup
        const payment = await PaymentTransactionModel.findOne({
            where: {
                paymentableId: reservationId,
                paymentableType: "reservation",
            },
            include: [
                { model: EventLogModel, as: "eventLogs" },
            ],
        });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found for this reservation" });
        }

        return res.status(200).json(payment);
    } catch (error) {
        console.error("Error fetching payment:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function getAllTransactions(req: AuthRequest, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Admin/SuperAdmin → all transactions | Client → only their own
        const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;

        const whereCondition: any = { paymentableType: "reservation" };

        if (!isAdmin) {
            // Find all reservation IDs belonging to this client
            const userReservations = await ReservationModel.findAll({
                where: { userId: user.id },
                attributes: ["id"],
            });
            const reservationIds = userReservations.map((r) => r.id);

            whereCondition.paymentableId = reservationIds;
        }

        const transactions = await PaymentTransactionModel.findAll({
            where: whereCondition,
            include: [
                { model: EventLogModel, as: "eventLogs" },
                {
                    model: ReservationModel,
                    as: "reservation",
                    include: [
                        {
                            model: UserModel,
                            as: "user",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export async function getTransactionById(req: AuthRequest, res: Response) {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const transaction = await PaymentTransactionModel.findByPk(Number(id), {
            include: [
                { model: EventLogModel, as: "eventLogs" },
                {
                    model: ReservationModel,
                    as: "reservation",
                    include: [
                        {
                            model: UserModel,
                            as: "user",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                },
            ],
        });

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Client can only see their own transactions
        const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
        if (!isAdmin) {
            const reservation = await ReservationModel.findByPk(transaction.paymentableId);
            if (!reservation || Number(reservation.userId) !== Number(user.id)) {
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        return res.status(200).json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function requestRefund(req: AuthRequest, res: Response) {
    const transaction = await sequelize.transaction();
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            await transaction.rollback();
            return res.status(401).json({ message: "Unauthorized" });
        }

        const payment = await PaymentTransactionModel.findByPk(Number(id), { transaction });
        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Validate ownership if not admin/super_admin
        const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
        if (!isAdmin) {
            const reservation = await ReservationModel.findByPk(payment.paymentableId, { transaction });
            if (!reservation || Number(reservation.userId) !== Number(user.id)) {
                await transaction.rollback();
                return res.status(403).json({ message: "Forbidden" });
            }
        }

        // Must be SUCCESS to request refund
        if (payment.status !== PaymentStatus.SUCCESS) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Refund can only be requested for SUCCESS transactions (current: ${payment.status})`,
            });
        }

        // Enforce only one refund request per transaction
        const alreadyRequested = await EventLogModel.findOne({
            where: {
                paymentTransactionId: payment.id,
                status: PaymentStatus.REFUND_REQUESTED,
            },
            transaction,
        });

        if (alreadyRequested) {
            await transaction.rollback();
            return res.status(400).json({
                message: "A refund has already been requested for this transaction. You can only request a refund once.",
            });
        }

        await payment.update({ status: PaymentStatus.REFUND_REQUESTED }, { transaction });

        await EventLogModel.create(
            {
                paymentTransactionId: payment.id,
                status: PaymentStatus.REFUND_REQUESTED,
                message: `Refund requested by user: ${user.email}`,
            },
            { transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: "Refund requested successfully", payment });
    } catch (error) {
        await transaction.rollback();
        console.error("Error requesting refund:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function approveRefund(req: AuthRequest, res: Response) {
    const transaction = await sequelize.transaction();
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            await transaction.rollback();
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only Admin or Super Admin
        const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
        if (!isAdmin) {
            await transaction.rollback();
            return res.status(403).json({ message: "Forbidden" });
        }

        const payment = await PaymentTransactionModel.findByPk(Number(id), { transaction });
        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (payment.status !== PaymentStatus.REFUND_REQUESTED) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Transaction is not in REFUND_REQUESTED status (current: ${payment.status})`,
            });
        }

        await payment.update({ status: PaymentStatus.REFUNDED }, { transaction });

        // Cancel the reservation if paymentableType is reservation
        if (payment.paymentableType === "reservation") {
            const reservation = await ReservationModel.findByPk(payment.paymentableId, { transaction });
            if (reservation) {
                await reservation.update({ status: ReservationStatus.CANCELED }, { transaction });
            }
        }

        await EventLogModel.create(
            {
                paymentTransactionId: payment.id,
                status: PaymentStatus.REFUNDED,
                message: `Refund approved by admin: ${user.email}`,
            },
            { transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: "Refund approved successfully", payment });
    } catch (error) {
        await transaction.rollback();
        console.error("Error approving refund:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function rejectRefund(req: AuthRequest, res: Response) {
    const transaction = await sequelize.transaction();
    try {
        const user = req.user;
        const { id } = req.params;

        if (!user) {
            await transaction.rollback();
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Only Admin or Super Admin
        const isAdmin = user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN;
        if (!isAdmin) {
            await transaction.rollback();
            return res.status(403).json({ message: "Forbidden" });
        }

        const payment = await PaymentTransactionModel.findByPk(Number(id), { transaction });
        if (!payment) {
            await transaction.rollback();
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (payment.status !== PaymentStatus.REFUND_REQUESTED) {
            await transaction.rollback();
            return res.status(400).json({
                message: `Transaction is not in REFUND_REQUESTED status (current: ${payment.status})`,
            });
        }

        await payment.update({ status: PaymentStatus.SUCCESS }, { transaction });

        await EventLogModel.create(
            {
                paymentTransactionId: payment.id,
                status: PaymentStatus.SUCCESS,
                message: `Refund rejected by admin: ${user.email}`,
            },
            { transaction }
        );

        await transaction.commit();
        return res.status(200).json({ message: "Refund request rejected", payment });
    } catch (error) {
        await transaction.rollback();
        console.error("Error rejecting refund:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}