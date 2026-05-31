import {stripe} from "../config/stripe";
import {AuthRequest} from "../middlewares/auth.middleware";
import {Request, Response} from "express";
import {ReservationModel} from "../models/reservation.model";
import {ReservationStatus} from "../models/enum.type";


export async function initCheckout(req:AuthRequest, res:Response){


    try {
        const { reservationId, amount } = req.body;
        console.log("Reservation ID:", reservationId);

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
                        unit_amount: amount * 100, // 10 EUR => 1000
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

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ message: "Payment session error" });
    }
};


export async function webhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );

        console.log(`✅ Webhook received: ${event.type}`);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as any;

            console.log("Session metadata:", JSON.stringify(session.metadata));
            const reservationId = session.metadata?.reservationId;

            if (!reservationId) {
                console.error("⚠️ checkout.session.completed missing reservationId in metadata");
                return res.status(200).json({ received: true, warning: "Missing reservationId" });
            }

            const reservation = await ReservationModel.findByPk(reservationId);

            if (!reservation) {
                console.error(`⚠️ Reservation #${reservationId} not found in database`);
                return res.status(200).json({ received: true, warning: "Reservation not found" });
            }

            reservation.status = ReservationStatus.CONFIRMED;
            await reservation.save();

            console.log("✅ Reservation confirmed:", reservationId);
        }

        return res.status(200).json({ received: true });
    } catch (err: any) {
        console.error("❌ Webhook signature verification error:", err.message);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }
}